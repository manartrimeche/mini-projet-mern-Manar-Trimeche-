import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(res => {
          setUser(res.data.data);
          // Charger le profil
          return api.get('/profile');
        })
        .then(res => {
          setProfile(res.data);
          // Si profil incomplet, afficher onboarding
          if (!res.data.profileCompleted) {
            setShowOnboarding(true);
          }
        })
        .catch((err) => {
          console.log('Erreur chargement profil:', err.message);
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    
    // Charger le profil après login
    try {
      const profileRes = await api.get('/profile');
      setProfile(profileRes.data);
      if (!profileRes.data.profileCompleted) {
        setShowOnboarding(true);
      }
    } catch (err) {
      // Pas de profil encore, afficher onboarding
      setShowOnboarding(true);
    }
    
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    
    // Afficher onboarding pour les nouveaux utilisateurs
    setShowOnboarding(true);
    
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setProfile(null);
    setShowOnboarding(false);
  };

  const completeOnboarding = (data) => {
    setProfile(data.profile);
    setShowOnboarding(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile,
      login, 
      register, 
      logout, 
      loading, 
      isAuthenticated: !!user,
      showOnboarding,
      completeOnboarding
    }}>
      {children}
    </AuthContext.Provider>
  );
};
