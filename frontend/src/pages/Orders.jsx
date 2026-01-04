import { useQuery } from '@tanstack/react-query';
import api from '../api/api';
import { Truck, Package, CheckCircle, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Orders = () => {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.get('/orders').then(res => res.data.data),
  });

  if (isLoading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '4px solid #f0f0f0',
            borderTop: '4px solid #10b981',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }} />
          <p style={{ marginTop: '12px', color: '#6b7280' }}>Chargement de vos commandes...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);

  return (
    <div style={{ display: 'grid', gap: '32px', padding: '24px' }}>
      {/* Hero header */}
      <section style={{
        background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #ffffff 100%)',
        borderRadius: '18px',
        padding: '32px',
        border: '1px solid #d1fae5'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
          <div>
            <p style={{ letterSpacing: '0.18em', textTransform: 'uppercase', color: '#047857', marginBottom: '8px', fontWeight: 700 }}>
              Historique
            </p>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
              Mes Commandes
            </h1>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              {orders.length} commande{orders.length > 1 ? 's' : ''}
            </p>
          </div>
          <div style={{
            background: '#fff',
            borderRadius: '14px',
            padding: '18px 24px',
            border: '1px solid #d1fae5',
            textAlign: 'right'
          }}>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>Total dépensé</p>
            <p style={{ fontSize: '28px', fontWeight: 800, color: '#10b981' }}>
              {totalSpent.toFixed(2)} TND
            </p>
          </div>
        </div>
      </section>

      {orders.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '64px 24px',
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb'
        }}>
          <Package style={{ width: '80px', height: '80px', color: '#d1d5db', margin: '0 auto 24px', display: 'block' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '12px' }}>
            Aucune commande
          </h2>
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '28px' }}>
            Vous n'avez pas encore passé de commande. Commencez vos achats dès maintenant !
          </p>
          <Link to="/products" style={{
            display: 'inline-block',
            padding: '12px 28px',
            background: '#10b981',
            color: '#fff',
            borderRadius: '10px',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 10px 30px rgba(16,185,129,0.25)'
          }}>
            Découvrir nos produits
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {orders.map((order, idx) => (
            <div key={order._id} style={{
              background: '#fff',
              borderRadius: '14px',
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
              boxShadow: '0 12px 30px rgba(0,0,0,0.05)'
            }}>
              {/* En-tête */}
              <div style={{
                padding: '20px',
                borderBottom: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '12px' }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Commande #{order._id.slice(-8).toUpperCase()}</p>
                    <p style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>
                      {order.totalPrice.toFixed(2)} TND
                    </p>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '24px',
                  flexWrap: 'wrap',
                  fontSize: '13px',
                  color: '#6b7280'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin style={{ width: '16px', height: '16px' }} />
                    {order.shippingAddress}
                  </div>
                  <div>{order.items.length} article{order.items.length > 1 ? 's' : ''}</div>
                  <div>{new Date(order.createdAt).toLocaleDateString('fr-TN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
              </div>

              {/* Items */}
              <div style={{ padding: '16px 0' }}>
                {order.items.map(item => (
                  <div key={item._id} style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr auto',
                    gap: '16px',
                    padding: '16px 20px',
                    borderBottom: '1px solid #f3f4f6',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      width: '100px',
                      height: '100px',
                      background: '#f3f4f6',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Package style={{ width: '40px', height: '40px', color: '#9ca3af' }} />
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
                        {item.product?.name || 'Produit'}
                      </h4>
                      <p style={{ fontSize: '13px', color: '#6b7280' }}>
                        {item.quantity} × {item.price.toFixed(2)} TND
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                      {(item.quantity * item.price).toFixed(2)} TND
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
