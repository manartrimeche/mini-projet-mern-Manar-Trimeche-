import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { AlertTriangle, Gift } from 'lucide-react';

const Cart = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { items, updateQty, removeItem, clear, totals } = useCart();
  const [unavailableItems, setUnavailableItems] = useState([]);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [discountPreview, setDiscountPreview] = useState(0);

  // Récupérer les points de réduction disponibles
  const { data: pointsData } = useQuery({
    queryKey: ['discountPoints'],
    queryFn: async () => {
      const res = await api.get('/orders/discount-points/available');
      return res.data.data;
    },
    enabled: isAuthenticated
  });

  // Calculer la réduction en temps réel
  useEffect(() => {
    if (pointsData && pointsToUse > 0) {
      const maxDiscount = Math.min(
        pointsToUse * (pointsData.discountRate || 1),
        totals.amount
      );
      setDiscountPreview(maxDiscount);
    } else {
      setDiscountPreview(0);
    }
  }, [pointsToUse, pointsData, totals.amount]);

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
        paymentMethod: 'credit_card',
        discountPointsToUse: pointsToUse
      });
      return response.data;
    },
    onSuccess: () => {
      clear();
      setPointsToUse(0);
      alert('Commande passée avec succès! Points de réduction appliqués.');
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
            <span>Total avant réduction</span>
            <span>{totals.amount.toFixed(2)} TND</span>
          </div>

          {/* Section Points de Réduction */}
          {isAuthenticated && pointsData && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Gift size={18} style={{ color: '#10b981' }} />
                <span style={{ fontWeight: '600', color: '#059669' }}>Points de réduction</span>
              </div>
              
              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
                Disponibles: <span style={{ fontWeight: '700', color: '#111827' }}>{pointsData.availablePoints} points</span>
                {pointsData.maxDiscount > 0 && (
                  <span style={{ marginLeft: '8px' }}>
                    (jusqu'à {pointsData.maxDiscount.toFixed(2)} TND)
                  </span>
                )}
              </div>

              {pointsData.availablePoints > 0 ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="number"
                    min="0"
                    max={pointsData.availablePoints}
                    value={pointsToUse}
                    onChange={(e) => setPointsToUse(Math.max(0, parseInt(e.target.value) || 0))}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px'
                    }}
                    placeholder="Points à utiliser"
                  />
                  <button
                    onClick={() => setPointsToUse(pointsData.availablePoints)}
                    style={{
                      padding: '6px 10px',
                      background: '#e0f2fe',
                      color: '#0369a1',
                      border: '1px solid #bae6fd',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Tous les points
                  </button>
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                  Complétez les tâches pour gagner des points de réduction!
                </p>
              )}
            </div>
          )}

          {/* Réduction appliquée */}
          {discountPreview > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#10b981', fontWeight: '600' }}>
              <span>Réduction appliquée</span>
              <span>-{discountPreview.toFixed(2)} TND</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontWeight: '700', fontSize: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
            <span>Total à payer</span>
            <span style={{ color: '#10b981' }}>
              {(totals.amount - discountPreview).toFixed(2)} TND
            </span>
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
