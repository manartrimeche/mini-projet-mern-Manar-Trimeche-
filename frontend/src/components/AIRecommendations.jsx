import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const AIRecommendations = ({ preferences }) => {
  const { isAuthenticated } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !preferences) return;

    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        const response = await api.post('/ai/recommendations', {
          preferences: preferences
        });
        setRecommendations(response.data.data.products || []);
      } catch (error) {
        console.error('Erreur recommandations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [preferences, isAuthenticated]);

  if (!isAuthenticated || !preferences) return null;
  if (isLoading) return <div style={{ textAlign: 'center', padding: '20px' }}>Chargement des recommandations...</div>;
  if (recommendations.length === 0) return null;

  return (
    <div style={{ marginTop: '40px' }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 700,
        color: '#111827',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
          Recommandations IA pour vous
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {recommendations.map(product => (
          <Link
            key={product._id}
            to={`/products/${product._id}`}
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              border: '2px solid #10b981',
              borderRadius: '12px',
              padding: '16px',
              background: '#f0fdf4',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                width: '100%',
                aspectRatio: '4/3',
                borderRadius: '8px',
                background: '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <img
                  src={product.image || 'https://via.placeholder.com/200x150?text=Produit'}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#111827',
                  marginBottom: '4px'
                }}>
                  {product.name}
                </h3>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#10b981'
                  }}>
                    {product.price} TND
                  </span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#f59e0b'
                  }}>
                    <Star size={16} fill="#f59e0b" />
                    <span style={{ fontWeight: 700 }}>
                      {product.rating ? product.rating.toFixed(1) : '0.0'}
                    </span>
                  </div>
                </div>

                <div style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: product.stock > 0 ? '#dbeafe' : '#fecaca',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: product.stock > 0 ? '#1e40af' : '#991b1b',
                  textAlign: 'center'
                }}>
                  {product.stock > 0 ? `${product.stock} disponibles` : 'Rupture'}
                </div>
              </div>

              <div style={{
                padding: '8px 12px',
                background: '#10b981',
                color: '#fff',
                borderRadius: '6px',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '14px',
                marginTop: 'auto'
              }}>
                Voir détails
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AIRecommendations;
