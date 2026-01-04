import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { AlertTriangle } from 'lucide-react';

const Cart = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { items, updateQty, removeItem, clear, totals } = useCart();
  const [unavailableItems, setUnavailableItems] = useState([]);

  // Vérifier la disponibilité des produits
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const unavailable = [];
        for (const item of items) {
          try {
            const res = await api.get(`/products/${item.productId}`);
            const product = res.data.data || res.data;
            if (product.stock === 0) {
              unavailable.push(item.productId);
              removeItem(item.productId);
            }
          } catch (err) {
            console.error(`Erreur lors de la vérification du produit ${item.productId}`);
          }
        }
        if (unavailable.length > 0) {
          setUnavailableItems(unavailable);
          setTimeout(() => setUnavailableItems([]), 5000);
        }
      } catch (err) {
        console.error('Erreur lors de la vérification des produits', err);
      }
    };

    if (items.length > 0) {
      checkAvailability();
    }
  }, [items, removeItem]);

  const createOrderMutation = useMutation({
    mutationFn: async (shippingAddress) => {
      const response = await api.post('/orders', {
        items: items.map(it => ({ productId: it.productId, quantity: it.quantity })),
        shippingAddress,
        paymentMethod: 'credit_card'
      });
      return response.data;
    },
    onSuccess: () => {
      clear();
      alert('Commande passée avec succès!');
      navigate('/orders');
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Erreur lors de la création de la commande');
    }
  });

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const address = prompt('Entrez votre adresse de livraison:');
    if (address?.trim()) {
      createOrderMutation.mutate(address);
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '12px' }}>Votre panier est vide</h1>
        <p style={{ color: '#6b7280', marginBottom: '20px' }}>Ajoutez des produits pour continuer vos achats.</p>
        <Link to="/products" style={{
          padding: '12px 18px',
          background: '#0ea5e9',
          color: '#fff',
          borderRadius: '10px',
          textDecoration: 'none',
          fontWeight: 700
        }}>Voir les produits</Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* Alerte produits indisponibles */}
      {unavailableItems.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '16px',
          background: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '10px',
          alignItems: 'flex-start',
          color: '#991b1b'
        }}>
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ fontWeight: '700', marginBottom: '4px' }}>⚠️ Produit(s) indisponible(s)</p>
            <p style={{ fontSize: '14px', margin: 0 }}>
              {unavailableItems.length} produit(s) en rupture de stock ont été retiré(s) automatiquement de votre panier.
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '28px', margin: 0 }}>Panier</h1>
        <button onClick={clear} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}>
          Vider le panier
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
        <div style={{ display: 'grid', gap: '12px' }}>
          {items.map(item => (
            <div key={item.productId} style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr auto',
              gap: '12px',
              padding: '14px',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              alignItems: 'center'
            }}>
              <div style={{ width: '80px', height: '80px', background: '#f3f4f6', borderRadius: '10px', overflow: 'hidden' }}>
                <img src={item.image || 'https://via.placeholder.com/120?text=Produit'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ display: 'grid', gap: '6px' }}>
                <strong>{item.name}</strong>
                {item.brand && <span style={{ color: '#6b7280', fontSize: '14px' }}>{item.brand}</span>}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <label style={{ color: '#6b7280' }}>Qté :</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQty(item.productId, parseInt(e.target.value) || 1)}
                    style={{ width: '70px', padding: '6px 8px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <button onClick={() => removeItem(item.productId)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}>
                    Retirer
                  </button>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, color: '#111827' }}>{(item.price * item.quantity).toFixed(2)} TND</div>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>{item.price} TND / unité</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '18px', background: '#fff' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Résumé</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#6b7280' }}>
            <span>Articles</span>
            <span>{totals.count}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontWeight: 700 }}>
            <span>Total</span>
            <span>{totals.amount.toFixed(2)} TND</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={createOrderMutation.isPending}
            style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '10px', background: createOrderMutation.isPending ? '#cbd5e1' : '#10b981', color: '#fff', fontWeight: 700, cursor: createOrderMutation.isPending ? 'not-allowed' : 'pointer' }}
          >
            {createOrderMutation.isPending ? 'En cours...' : 'Passer commande'}
          </button>
          <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '10px' }}>Vous serez redirigé vers vos commandes après validation.</p>
        </div>
      </div>
    </div>
  );
};

export default Cart;
