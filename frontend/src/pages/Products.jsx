import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { X } from 'lucide-react';

const Products = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(res => res.data.data || []),
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', search, selectedCategory],
    queryFn: () => {
      const params = { limit: 1000 };
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      return api.get('/products', { params }).then(res => res.data.data || []);
    },
  });

  const clearFilters = () => {
    setSelectedCategory('');
  };

  if (isLoading) return <div>Chargement des produits...</div>;

  return (
    <div style={{ display: 'grid', gap: '32px' }}>
      {/* Hero for visitors */}
      <section style={{
        padding: '48px',
        borderRadius: '18px',
        background: 'linear-gradient(135deg, #eef7ff 0%, #f8fbff 50%, #ffffff 100%)',
        border: '1px solid #e5e7eb',
        boxShadow: '0 20px 50px rgba(0,0,0,0.06)'
      }}>
        <p style={{ letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '8px' }}>Collection</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ maxWidth: '640px' }}>
            <h1 style={{ fontSize: '38px', fontWeight: 800, color: '#111827', marginBottom: '12px' }}>Nos produits, accessibles aux visiteurs</h1>
            <p style={{ color: '#4b5563', fontSize: '16px', lineHeight: 1.6 }}>
              Explorez librement la gamme. Vous pourrez créer un compte ou vous connecter au moment d'acheter.
            </p>
          </div>
          {!isAuthenticated && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to="/register" style={{ padding: '12px 20px', borderRadius: '12px', background: '#10b981', color: '#fff', fontWeight: 700, textDecoration: 'none' }}>S'inscrire</Link>
              <Link to="/login" style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid #d1d5db', color: '#111827', fontWeight: 700, textDecoration: 'none', background: '#fff' }}>Se connecter</Link>
            </div>
          )}
        </div>
      </section>

      {/* Barre de recherche et filtre catégorie */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Rechercher un produit"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: '1 1 280px',
            minWidth: '260px',
            padding: '14px 16px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
            fontSize: '15px'
          }}
        />
        
        {/* Filtre Catégorie */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '14px 16px',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            fontSize: '15px',
            cursor: 'pointer',
            background: '#fff',
            fontWeight: '500',
            minWidth: '200px'
          }}
        >
          <option value="">Toutes les catégories</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>

        {/* Bouton Réinitialiser */}
        {selectedCategory && (
          <button
            onClick={clearFilters}
            style={{
              padding: '14px 20px',
              background: '#fee2e2',
              color: '#991b1b',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <X size={18} />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Grille produits */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
        {products.map(product => (
          <div key={product._id} style={{ textDecoration: 'none', height: '100%' }}>
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '14px',
              padding: '18px',
              background: '#fff',
              boxShadow: '0 12px 30px rgba(0,0,0,0.05)',
              height: '100%',
              display: 'grid',
              gap: '12px'
            }}>
              <Link to={`/products/${product._id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  width: '100%',
                  aspectRatio: '4/3',
                  borderRadius: '12px',
                  background: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  <img
                    src={product.image || product.imageUrl || product.images?.[0] || 'https://via.placeholder.com/400x300?text=Produit'}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </Link>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>{product.name}</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', minHeight: '40px' }}>
                  {product.description?.slice(0, 90) || 'Découvrir ce produit'}{product.description && product.description.length > 90 ? '…' : ''}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#10b981' }}>{product.price} TND</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>★ {product.rating ? product.rating.toFixed(1) : '0.0'}</span>
              </div>

              <div style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: product.stock > 5 ? '#d1fae5' : product.stock > 0 ? '#fef3c7' : '#fee2e2',
                fontSize: '13px',
                fontWeight: '600',
                color: product.stock > 5 ? '#047857' : product.stock > 0 ? '#92400e' : '#991b1b',
                marginBottom: '8px',
                textAlign: 'center'
              }}>
                {product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock'}
              </div>

              <button
                onClick={() => addItem(product, 1)}
                disabled={product.stock === 0}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: product.stock > 0 ? '#10b981' : '#d1d5db',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                  opacity: product.stock > 0 ? 1 : 0.6
                }}
              >
                {product.stock > 0 ? 'Ajouter au panier' : 'Non disponible'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 40px',
          background: '#fef3c7',
          border: '2px solid #fcd34d',
          borderRadius: '14px',
          color: '#92400e'
        }}>
          <p style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}> Aucun produit disponible</p>
          <p style={{ fontSize: '14px', color: '#b45309' }}>Tous les produits sont actuellement en rupture de stock ou les résultats de recherche ne correspondent à aucun produit.</p>
        </div>
      )}
    </div>
  );
};

export default Products;
