import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#111827', marginBottom: '12px' }}>Bienvenue</h1>
          <p style={{ color: '#6b7280', fontSize: '15px' }}>Connectez-vous à votre compte BeautyShop</p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          padding: '32px 24px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.08)'
        }}>
          {error && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '20px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
                {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '18px' }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@example.com"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '14px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10b981';
                  e.target.style.boxShadow = '0 4px 12px rgba(16,185,129,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)';
                }}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '14px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10b981';
                  e.target.style.boxShadow = '0 4px 12px rgba(16,185,129,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)';
                }}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: loading ? '#9ca3af' : '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 10px 30px rgba(16,185,129,0.25)'
              }}
              onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = '0 12px 35px rgba(16,185,129,0.35)')}
              onMouseLeave={(e) => !loading && (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = '0 10px 30px rgba(16,185,129,0.25)')}
            >
              {loading ? '⏳ Connexion...' : '✓ Se connecter'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            <span style={{ color: '#9ca3af', fontSize: '13px' }}>ou</span>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          </div>

          {/* Signup Link */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Pas de compte ?</p>
            <Link to="/register" style={{
              display: 'inline-block',
              padding: '10px 20px',
              border: '1px solid #10b981',
              borderRadius: '10px',
              color: '#10b981',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f0fdf4';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}>
              S'inscrire maintenant
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
