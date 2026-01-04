import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../api/api';
import { MapPin, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Addresses() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'Tunisie',
    phone: '',
    isDefault: false
  });

  // Fetch addresses
  const { data: addressesData, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.get('/users/addresses').then(res => res.data),
  });

  const addresses = addressesData?.data || [];

  // Add address mutation
  const addAddressMutation = useMutation({
    mutationFn: (data) => api.post('/users/addresses', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['addresses']);
      resetForm();
      alert('Adresse ajoutée avec succès !');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Erreur lors de l\'ajout');
    }
  });

  // Update address mutation
  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/users/addresses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['addresses']);
      resetForm();
      alert('Adresse mise à jour avec succès !');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  });

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/addresses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['addresses']);
      alert('Adresse supprimée avec succès !');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  });

  const resetForm = () => {
    setFormData({
      label: '',
      street: '',
      city: '',
      postalCode: '',
      country: 'Tunisie',
      phone: '',
      isDefault: false
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (address) => {
    setFormData({
      label: address.label,
      street: address.street,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country || 'Tunisie',
      phone: address.phone || '',
      isDefault: address.isDefault
    });
    setEditingId(address._id);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateAddressMutation.mutate({ id: editingId, data: formData });
    } else {
      addAddressMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) {
      deleteAddressMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '32px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#111827' }}>
            Mes Adresses
          </h1>
          <button
            onClick={() => navigate('/profile')}
            style={{
              padding: '10px 20px',
              background: '#6b7280',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Retour au profil
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div style={{
            background: '#fff',
            borderRadius: '18px',
            border: '1px solid #e5e7eb',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '20px' }}>
              {editingId ? 'Modifier l\'adresse' : 'Nouvelle adresse'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                    Label *
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="Maison, Travail..."
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+216 XX XXX XXX"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                  Adresse complète *
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="Rue, numéro, etc."
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                    Ville *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Tunis"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                    Code postal *
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="1000"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                    Pays
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="isDefault" style={{ fontSize: '14px', color: '#4b5563', cursor: 'pointer' }}>
                  Définir comme adresse par défaut
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="submit"
                  disabled={addAddressMutation.isPending || updateAddressMutation.isPending}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Check size={18} />
                  {editingId ? 'Mettre à jour' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: '12px 20px',
                    background: '#6b7280',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <X size={18} />
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bouton ajouter */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              width: '100%',
              padding: '16px',
              background: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '14px',
              fontWeight: '700',
              fontSize: '15px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '24px',
              boxShadow: '0 10px 30px rgba(16,185,129,0.25)'
            }}
          >
            <Plus size={20} />
            Ajouter une nouvelle adresse
          </button>
        )}

        {/* Liste des adresses */}
        <div style={{ display: 'grid', gap: '16px' }}>
          {addresses.length === 0 ? (
            <div style={{
              background: '#fff',
              borderRadius: '14px',
              border: '1px solid #e5e7eb',
              padding: '40px',
              textAlign: 'center'
            }}>
              <MapPin size={48} style={{ color: '#d1d5db', margin: '0 auto 16px' }} />
              <p style={{ color: '#6b7280', fontSize: '15px' }}>
                Aucune adresse enregistrée. Ajoutez votre première adresse !
              </p>
            </div>
          ) : (
            addresses.map((address) => (
              <div
                key={address._id}
                style={{
                  background: '#fff',
                  borderRadius: '14px',
                  border: address.isDefault ? '2px solid #10b981' : '1px solid #e5e7eb',
                  padding: '20px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                  position: 'relative'
                }}
              >
                {address.isDefault && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    padding: '4px 12px',
                    background: '#d1fae5',
                    color: '#047857',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    Par défaut
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '12px' }}>
                  <MapPin size={20} style={{ color: '#10b981', marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                      {address.label}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.6 }}>
                      {address.street}<br />
                      {address.city}, {address.postalCode}<br />
                      {address.country}
                      {address.phone && <><br />Tél: {address.phone}</>}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button
                    onClick={() => handleEdit(address)}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      background: '#f3f4f6',
                      color: '#111827',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Edit2 size={16} />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(address._id)}
                    style={{
                      padding: '10px 16px',
                      background: '#fee2e2',
                      color: '#991b1b',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Trash2 size={16} />
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
