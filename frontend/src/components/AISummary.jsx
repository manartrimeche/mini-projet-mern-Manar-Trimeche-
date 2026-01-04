import { useEffect, useState } from 'react';
import api from '../api/api';
import { Lightbulb } from 'lucide-react';

const AISummary = ({ productId }) => {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) return;

    const fetchSummary = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(`/ai/reviews-summary/${productId}`);
        setSummary(response.data.data);
      } catch (err) {
        setError('Impossible de charger le résumé');
        console.error('Erreur résumé:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [productId]);

  if (isLoading) {
    return (
      <div style={{
        padding: '16px',
        background: '#f0fdf4',
        borderRadius: '8px',
        color: '#10b981',
        fontStyle: 'italic'
      }}>
        Génération du résumé IA...
      </div>
    );
  }

  if (error || !summary) return null;

  return (
    <div style={{
      padding: '16px',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dbeafe 100%)',
      borderLeft: '4px solid #10b981',
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <Lightbulb size={20} style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '16px',
            fontWeight: 700,
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            💡 Résumé Intelligent IA
          </h3>
          <p style={{
            margin: 0,
            fontSize: '14px',
            lineHeight: 1.6,
            color: '#374151'
          }}>
            {summary.summary}
          </p>
          <p style={{
            margin: '8px 0 0 0',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            Basé sur {summary.reviewCount} avis
          </p>
        </div>
      </div>
    </div>
  );
};

export default AISummary;
