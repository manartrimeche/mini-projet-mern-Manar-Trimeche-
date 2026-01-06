import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../api/api';
import { ShoppingCart, Star, ArrowLeft, Check, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Fetch product details
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await api.get(`/products/${id}`);
      return response.data.data || response.data;
    },
  });

  // Fetch product reviews
  const { data: reviewsData = {} } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      try {
        const response = await api.get(`/reviews/product/${id}`);
        return response.data || {};
      } catch {
        return {};
      }
    },
  });

  const reviews = reviewsData.data || [];

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: async (data) => {
      console.log('Envoi de l\'avis:', data);
      const response = await api.post('/reviews', data);
      console.log('Réponse:', response.data);
      return response.data;
    },
    onSuccess: async () => {
      // Refetch les données pour mettre à jour le rating immédiatement
      await queryClient.refetchQueries(['reviews', id]);
      await queryClient.refetchQueries(['product', id]);
      setReviewRating(0);
      setReviewComment('');
      setShowReviewForm(false);
    },
    onError: (error) => {
      console.error('Erreur lors de la création de l\'avis:', error);
      alert(error.response?.data?.message || 'Erreur lors de la publication de l\'avis');
    }
  });

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (reviewRating === 0) {
      alert('Veuillez sélectionner une note');
      return;
    }
    createReviewMutation.mutate({
      product: id,
      rating: reviewRating,
      comment: reviewComment
    });
  };

  const handleAddToCart = () => {
    if (user) {
      addItem(product, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } else {
      navigate('/login');
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #10b981',
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: '#6b7280', fontSize: '15px' }}>Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#991b1b', marginBottom: '16px', fontSize: '15px' }}>Erreur de chargement du produit</p>
          <button
            onClick={() => navigate('/products')}
            style={{
              padding: '10px 20px',
              background: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ← Retour aux produits
          </button>
        </div>
      </div>
    );
  }

  // Use product.rating from backend (calculated automatically)
  const averageRating = product.rating ? product.rating.toFixed(1) : '0.0';

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '32px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/products')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#6b7280',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '600',
            marginBottom: '24px',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = '#111827'}
          onMouseLeave={(e) => e.target.style.color = '#6b7280'}
        >
          <ArrowLeft size={18} />
          Retour aux produits
        </button>

        {/* Main Content */}
        <div style={{
          background: '#fff',
          borderRadius: '18px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          boxShadow: '0 12px 30px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '40px',
            padding: '40px'
          }}>
            {/* Product Image */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f3f4f6',
              borderRadius: '14px',
              minHeight: '400px',
              overflow: 'hidden'
            }}>
              <img
                src={product.image || product.imageUrl || 'https://via.placeholder.com/400x400?text=Produit'}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Product Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Title & Rating */}
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#111827', marginBottom: '12px' }}>
                  {product.name}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        style={{
                          color: i < Math.round(averageRating) ? '#f59e0b' : '#e5e7eb',
                          fill: i < Math.round(averageRating) ? '#f59e0b' : 'none'
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>
                    {averageRating} ({reviews.length} avis)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div>
                <span style={{ fontSize: '28px', fontWeight: 800, color: '#10b981' }}>
                  {product.price} TND
                </span>
              </div>

              {/* Description */}
              <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: 1.6 }}>
                {product.description}
              </p>

              {/* Stock Status */}
              <div style={{
                padding: '12px 16px',
                borderRadius: '10px',
                background: product.stock > 0 ? '#d1fae5' : '#fee2e2',
                border: `1px solid ${product.stock > 0 ? '#a7f3d0' : '#fecaca'}`,
                fontSize: '14px',
                fontWeight: '600',
                color: product.stock > 0 ? '#047857' : '#991b1b'
              }}>
                {product.stock > 0 ? `✓ ${product.stock} en stock` : '✗ Rupture de stock'}
              </div>

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '10px' }}>
                    Quantité
                  </label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{
                        width: '40px',
                        height: '40px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        background: '#fff',
                        cursor: 'pointer',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#111827',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#f3f4f6';
                        e.target.style.borderColor = '#d1d5db';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#fff';
                        e.target.style.borderColor = '#e5e7eb';
                      }}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                      style={{
                        width: '60px',
                        height: '40px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontSize: '15px',
                        fontWeight: '600'
                      }}
                      min="1"
                      max={product.stock}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      style={{
                        width: '40px',
                        height: '40px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        background: '#fff',
                        cursor: 'pointer',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#111827',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#f3f4f6';
                        e.target.style.borderColor = '#d1d5db';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#fff';
                        e.target.style.borderColor = '#e5e7eb';
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  background: addedToCart ? '#10b981' : product.stock > 0 ? '#10b981' : '#d1d5db',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: product.stock > 0 ? '0 10px 30px rgba(16,185,129,0.25)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (product.stock > 0 && !addedToCart) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 12px 35px rgba(16,185,129,0.35)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (product.stock > 0 && !addedToCart) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 10px 30px rgba(16,185,129,0.25)';
                  }
                }}
              >
                {addedToCart ? (
                  <>
                    <Check size={20} />
                    Ajouté au panier !
                  </>
                ) : product.stock > 0 ? (
                  <>
                    <ShoppingCart size={20} />
                    Ajouter au panier
                  </>
                ) : (
                  'Non disponible'
                )}
              </button>
            </div>
          </div>

          {/* Reviews Section */}
          <div style={{
            borderTop: '1px solid #e5e7eb',
            padding: '40px',
            background: '#f9fafb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827' }}>
                Avis clients ({reviews.length})
              </h2>
              {user && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  style={{
                    padding: '10px 20px',
                    background: showReviewForm ? '#6b7280' : '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  {showReviewForm ? 'Annuler' : 'Écrire un avis'}
                </button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && user && (
              <div style={{
                background: '#fff',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                marginBottom: '24px'
              }}>
                <form onSubmit={handleSubmitReview}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '10px' }}>
                      Note *
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={32}
                          style={{
                            color: star <= reviewRating ? '#f59e0b' : '#d1d5db',
                            fill: star <= reviewRating ? '#f59e0b' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onClick={() => setReviewRating(star)}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '10px' }}>
                      Commentaire (optionnel)
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows="4"
                      placeholder="Partagez votre expérience avec ce produit..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={createReviewMutation.isPending}
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      background: createReviewMutation.isPending ? '#d1d5db' : '#10b981',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: createReviewMutation.isPending ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Send size={18} />
                    {createReviewMutation.isPending ? 'Envoi en cours...' : 'Publier l\'avis'}
                  </button>
                </form>
              </div>
            )}
            
            {reviews.length > 0 ? (
              <div style={{ display: 'grid', gap: '20px' }}>
                {reviews.map((review) => (
                  <div key={review._id} style={{
                    background: '#fff',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>
                          {review.user?.username || 'Utilisateur anonyme'}
                        </p>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              style={{
                                color: i < review.rating ? '#f59e0b' : '#e5e7eb',
                                fill: i < review.rating ? '#f59e0b' : 'none'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                        {new Date(review.createdAt).toLocaleDateString('fr-TN', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    {review.comment && (
                      <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.6 }}>
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '16px' }}>
                  Aucun avis pour le moment. Soyez le premier à donner votre avis !
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
