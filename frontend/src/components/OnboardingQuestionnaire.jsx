import { useState } from 'react';
import api from '../api/api';

// Formatage des labels avec hyphens vers espaces
const formatLabel = (text) => {
  return text
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function OnboardingQuestionnaire({ onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // État du questionnaire
  const [skinProfile, setSkinProfile] = useState({
    skinType: '',
    skinConcerns: [],
    skinGoals: [],
    sensitivity: ''
  });

  const [hairProfile, setHairProfile] = useState({
    hairType: '',
    hairTexture: '',
    scalpType: '',
    hairConcerns: [],
    hairGoals: []
  });

  // Options pour les différents champs
  const skinTypes = ['grasse', 'sèche', 'mixte', 'normale', 'sensible'];
  const skinConcerns = ['acné', 'rides', 'taches', 'rougeurs', 'déshydratation', 'pores-dilatés', 'cicatrices', 'autre'];
  const skinGoals = ['hydratation', 'anti-âge', 'éclaircissement', 'anti-acné', 'raffermissement', 'protection', 'autre'];
  const sensitivities = ['très-sensible', 'sensible', 'normale', 'résistante'];

  const hairTypes = ['raides', 'ondulés', 'bouclés', 'crépus'];
  const hairTextures = ['fins', 'normaux', 'épais'];
  const scalpTypes = ['gras', 'sec', 'normal', 'mixte', 'sensible'];
  const hairConcerns = ['chute', 'pellicules', 'sécheresse', 'frisottis', 'casse', 'manque-de-volume', 'pointes-fourchues', 'autre'];
  const hairGoals = ['hydratation', 'volume', 'brillance', 'fortification', 'réparation', 'croissance', 'lissage', 'définition-boucles', 'autre'];

  // Gérer sélection multiple
  const toggleArray = (array, item, setter) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  // Valider et passer à l'étape suivante
  const handleNext = () => {
    if (step === 1) {
      if (!skinProfile.skinType || skinProfile.skinConcerns.length === 0 || skinProfile.skinGoals.length === 0 || !skinProfile.sensitivity) {
        setError('Veuillez remplir tous les champs');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  // Soumettre le questionnaire
  const handleSubmit = async () => {
    if (!hairProfile.hairType || !hairProfile.hairTexture || !hairProfile.scalpType || hairProfile.hairConcerns.length === 0 || hairProfile.hairGoals.length === 0) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/profile/onboarding', {
        skinProfile,
        hairProfile
      });

      console.log('✅ Onboarding complété:', response.data);
      onComplete(response.data);
    } catch (err) {
      console.error('❌ Erreur onboarding:', err);
      setError(err.response?.data?.message || 'Erreur lors de la soumission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>✨ Questionnaire de Profil</h2>
          <p style={styles.subtitle}>
            Aidez-nous à vous connaître pour des recommandations personnalisées
          </p>
          <div style={styles.progress}>
            <div style={{...styles.progressBar, width: `${(step / 2) * 100}%`}}></div>
          </div>
          <p style={styles.stepIndicator}>Étape {step} sur 2</p>
        </div>

        {/* Étape 1: Profil de peau */}
        {step === 1 && (
          <div style={styles.content}>
            <h3 style={styles.sectionTitle}>🌟 Votre Peau</h3>

            <div style={styles.field}>
              <label style={styles.label}>Type de peau *</label>
              <div style={styles.radioGroup}>
                {skinTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setSkinProfile({...skinProfile, skinType: type})}
                    style={{
                      ...styles.radioButton,
                      ...(skinProfile.skinType === type ? styles.radioButtonActive : {})
                    }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Préoccupations cutanées * (sélectionnez toutes celles qui s'appliquent)</label>
              <div style={styles.checkboxGroup}>
                {skinConcerns.map(concern => (
                  <button
                    key={concern}
                    onClick={() => toggleArray(
                      skinProfile.skinConcerns,
                      concern,
                      (newArr) => setSkinProfile({...skinProfile, skinConcerns: newArr})
                    )}
                    style={{
                      ...styles.checkboxButton,
                      ...(skinProfile.skinConcerns.includes(concern) ? styles.checkboxButtonActive : {})
                    }}
                  >
                    {formatLabel(concern)}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Objectifs de soin * (sélectionnez vos priorités)</label>
              <div style={styles.checkboxGroup}>
                {skinGoals.map(goal => (
                  <button
                    key={goal}
                    onClick={() => toggleArray(
                      skinProfile.skinGoals,
                      goal,
                      (newArr) => setSkinProfile({...skinProfile, skinGoals: newArr})
                    )}
                    style={{
                      ...styles.checkboxButton,
                      ...(skinProfile.skinGoals.includes(goal) ? styles.checkboxButtonActive : {})
                    }}
                  >
                    {formatLabel(goal)}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Sensibilité de la peau *</label>
              <div style={styles.radioGroup}>
                {sensitivities.map(sens => (
                  <button
                    key={sens}
                    onClick={() => setSkinProfile({...skinProfile, sensitivity: sens})}
                    style={{
                      ...styles.radioButton,
                      ...(skinProfile.sensitivity === sens ? styles.radioButtonActive : {})
                    }}
                  >
                    {sens.charAt(0).toUpperCase() + sens.slice(1).replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Étape 2: Profil capillaire */}
        {step === 2 && (
          <div style={styles.content}>
            <h3 style={styles.sectionTitle}>💆 Vos Cheveux</h3>

            <div style={styles.field}>
              <label style={styles.label}>Type de cheveux *</label>
              <div style={styles.radioGroup}>
                {hairTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setHairProfile({...hairProfile, hairType: type})}
                    style={{
                      ...styles.radioButton,
                      ...(hairProfile.hairType === type ? styles.radioButtonActive : {})
                    }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Texture des cheveux *</label>
              <div style={styles.radioGroup}>
                {hairTextures.map(texture => (
                  <button
                    key={texture}
                    onClick={() => setHairProfile({...hairProfile, hairTexture: texture})}
                    style={{
                      ...styles.radioButton,
                      ...(hairProfile.hairTexture === texture ? styles.radioButtonActive : {})
                    }}
                  >
                    {texture.charAt(0).toUpperCase() + texture.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Type de cuir chevelu *</label>
              <div style={styles.radioGroup}>
                {scalpTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setHairProfile({...hairProfile, scalpType: type})}
                    style={{
                      ...styles.radioButton,
                      ...(hairProfile.scalpType === type ? styles.radioButtonActive : {})
                    }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Préoccupations capillaires * (sélectionnez toutes celles qui s'appliquent)</label>
              <div style={styles.checkboxGroup}>
                {hairConcerns.map(concern => (
                  <button
                    key={concern}
                    onClick={() => toggleArray(
                      hairProfile.hairConcerns,
                      concern,
                      (newArr) => setHairProfile({...hairProfile, hairConcerns: newArr})
                    )}
                    style={{
                      ...styles.checkboxButton,
                      ...(hairProfile.hairConcerns.includes(concern) ? styles.checkboxButtonActive : {})
                    }}
                  >
                    {formatLabel(concern)}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Objectifs capillaires * (sélectionnez vos priorités)</label>
              <div style={styles.checkboxGroup}>
                {hairGoals.map(goal => (
                  <button
                    key={goal}
                    onClick={() => toggleArray(
                      hairProfile.hairGoals,
                      goal,
                      (newArr) => setHairProfile({...hairProfile, hairGoals: newArr})
                    )}
                    style={{
                      ...styles.checkboxButton,
                      ...(hairProfile.hairGoals.includes(goal) ? styles.checkboxButtonActive : {})
                    }}
                  >
                    {formatLabel(goal)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages d'erreur */}
        {error && <p style={styles.error}>{error}</p>}

        {/* Actions */}
        <div style={styles.actions}>
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} style={styles.backButton}>
              ← Précédent
            </button>
          )}
          {step === 1 && (
            <button onClick={handleNext} style={styles.nextButton}>
              Suivant →
            </button>
          )}
          {step === 2 && (
            <button onClick={handleSubmit} disabled={loading} style={styles.submitButton}>
              {loading ? 'Envoi...' : '✨ Terminer et obtenir mes recommandations'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px',
    overflow: 'auto'
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    maxWidth: '700px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
  },
  header: {
    padding: '30px 30px 20px',
    borderBottom: '1px solid #e5e7eb',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px'
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '8px'
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    opacity: 0.9,
    marginBottom: '20px'
  },
  progress: {
    width: '100%',
    height: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '10px'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
    transition: 'width 0.3s ease',
    borderRadius: '10px'
  },
  stepIndicator: {
    margin: 0,
    fontSize: '12px',
    opacity: 0.9,
    textAlign: 'center'
  },
  content: {
    padding: '30px'
  },
  sectionTitle: {
    margin: '0 0 20px 0',
    fontSize: '22px',
    fontWeight: '600',
    color: '#1f2937',
    borderBottom: '2px solid #667eea',
    paddingBottom: '10px'
  },
  field: {
    marginBottom: '25px'
  },
  label: {
    display: 'block',
    marginBottom: '12px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  radioGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },
  radioButton: {
    padding: '10px 20px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#4b5563',
    transition: 'all 0.2s ease'
  },
  radioButtonActive: {
    backgroundColor: '#667eea',
    color: '#fff',
    border: '2px solid #667eea'
  },
  checkboxGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },
  checkboxButton: {
    padding: '8px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    color: '#4b5563',
    transition: 'all 0.2s ease'
  },
  checkboxButtonActive: {
    backgroundColor: '#764ba2',
    color: '#fff',
    border: '2px solid #764ba2'
  },
  error: {
    color: '#dc2626',
    fontSize: '14px',
    margin: '0 30px 20px',
    padding: '10px',
    backgroundColor: '#fee2e2',
    borderRadius: '8px',
    textAlign: 'center'
  },
  actions: {
    padding: '20px 30px 30px',
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    borderTop: '1px solid #e5e7eb'
  },
  backButton: {
    padding: '12px 24px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4b5563',
    transition: 'all 0.2s ease'
  },
  nextButton: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
    transition: 'all 0.2s ease'
  },
  submitButton: {
    padding: '12px 32px',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
    transition: 'all 0.2s ease'
  }
};
