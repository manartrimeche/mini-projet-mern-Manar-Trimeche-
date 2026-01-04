import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div style={{ display: 'grid', minHeight: '80vh', placeItems: 'center' }}>
      <div style={{
        width: '100%',
        maxWidth: '960px',
        padding: '48px 32px',
        background: 'linear-gradient(135deg, #e9f4ff 0%, #f6fbff 50%, #ffffff 100%)',
        borderRadius: '18px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        textAlign: 'center'
      }}>
        <p style={{ letterSpacing: '0.18em', textTransform: 'uppercase', color: '#556' }}>BeautyShop</p>
        <h1 style={{ fontSize: '42px', margin: '12px 0 8px', color: '#1f2933', fontWeight: 800 }}>
          Science & Nature, réinventées
        </h1>
        <p style={{ fontSize: '16px', color: '#4b5563', marginBottom: '28px', lineHeight: 1.6 }}>
          Des formules efficaces, des routines simples. Découvrez notre univers de soins pensés pour sublimer chaque geste du quotidien.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginBottom: '24px' }}>
          <Link
            to="/register"
            style={{
              background: '#10b981',
              color: '#fff',
              padding: '14px 28px',
              borderRadius: '12px',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 10px 30px rgba(16,185,129,0.25)'
            }}
          >
            S'inscrire
          </Link>
          <Link
            to="/login"
            style={{
              border: '1px solid #d1d5db',
              color: '#1f2933',
              padding: '14px 28px',
              borderRadius: '12px',
              fontWeight: 700,
              textDecoration: 'none',
              background: '#fff'
            }}
          >
            Se connecter
          </Link>
        </div>

        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '12px' }}>
          Préférez explorer d'abord ? <Link to="/products" style={{ color: '#0ea5e9', fontWeight: 600 }}>Voir les produits</Link>
        </p>
      </div>
    </div>
  );
};

export default Landing;
