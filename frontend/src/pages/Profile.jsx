import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { User, Mail, Save, Edit2, X } from 'lucide-react';

const Profile = () => {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.get('/orders').then(res => res.data.data),
  });

  // Mutation pour mettre à jour le profil
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put('/users/profile', data);
      return response.data;
    },
    onSuccess: (data) => {
      setUser(data.data);
      localStorage.setItem('user', JSON.stringify(data.data));
      setIsEditing(false);
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Profil mis à jour avec succès !');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const updateData = {
      username: formData.username,
      email: formData.email
    };

    // Ajouter le mot de passe seulement si les champs sont remplis
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        alert('Les mots de passe ne correspondent pas');
        return;
      }
      if (!formData.currentPassword) {
        alert('Veuillez entrer votre mot de passe actuel');
        return;
      }
      updateData.currentPassword = formData.currentPassword;
      updateData.newPassword = formData.newPassword;
    }

    updateProfileMutation.mutate(updateData);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '32px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#111827', marginBottom: '32px' }}>
          Mon Profil
        </h1>
        
        {/* Carte profil */}
        <div style={{
          background: '#fff',
          borderRadius: '18px',
          border: '1px solid #e5e7eb',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
              Informations personnelles
            </h2>
            <button
              onClick={() => {
                setIsEditing(!isEditing);
                if (!isEditing) {
                  setFormData({
                    username: user?.username || '',
                    email: user?.email || '',
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }
              }}
              style={{
                padding: '10px 20px',
                background: isEditing ? '#6b7280' : '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              {isEditing ? <><X size={18} /> Annuler</> : <><Edit2 size={18} /> Modifier</>}
            </button>
          </div>

          {!isEditing ? (
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <User size={20} style={{ color: '#6b7280' }} />
                <div>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Nom d'utilisateur</p>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{user?.username}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={20} style={{ color: '#6b7280' }} />
                <div>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Email</p>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{user?.email}</p>
                </div>
              </div>
              <div style={{ 
                padding: '16px',
                background: '#f3f4f6',
                borderRadius: '10px',
                marginTop: '8px'
              }}>
                <p style={{ fontSize: '14px', color: '#4b5563' }}>
                  <strong>Nombre de commandes :</strong> {orders.length}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '15px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '15px'
                  }}
                />
              </div>

              <div style={{
                borderTop: '1px solid #e5e7eb',
                paddingTop: '20px',
                marginTop: '10px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
                  Changer le mot de passe (optionnel)
                </h3>

                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                      Mot de passe actuel
                    </label>
                    <input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        fontSize: '15px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        fontSize: '15px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        fontSize: '15px'
                      }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  background: updateProfileMutation.isPending ? '#d1d5db' : '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: updateProfileMutation.isPending ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  marginTop: '10px'
                }}
              >
                <Save size={20} />
                {updateProfileMutation.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </form>
          )}
        </div>

        {/* Actions rapides */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <Link to="/orders" style={{ 
            padding: '20px', 
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '14px', 
            textAlign: 'center', 
            textDecoration: 'none',
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
            transition: 'all 0.2s'
          }}>
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#0ea5e9', marginBottom: '8px' }}>
              Mes Commandes
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              {orders.length} commande{orders.length > 1 ? 's' : ''}
            </p>
          </Link>
          <Link to="/addresses" style={{ 
            padding: '20px', 
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '14px', 
            textAlign: 'center', 
            textDecoration: 'none',
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
            transition: 'all 0.2s'
          }}>
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#f59e0b', marginBottom: '8px' }}>
              Mes Adresses
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Gérer mes adresses de livraison
            </p>
          </Link>
          <Link to="/products" style={{ 
            padding: '20px', 
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '14px', 
            textAlign: 'center', 
            textDecoration: 'none',
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
            transition: 'all 0.2s'
          }}>
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#10b981', marginBottom: '8px' }}>
              Continuer mes achats
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Découvrir nos produits
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
