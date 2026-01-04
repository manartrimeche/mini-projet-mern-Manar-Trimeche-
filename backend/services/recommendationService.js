const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * Génère des recommandations personnalisées selon le profil utilisateur
 * @param {Object} skinProfile - Profil de peau
 * @param {Object} hairProfile - Profil capillaire
 * @returns {Promise<Object>} Recommandations et routine
 */
exports.generatePersonalizedRecommendations = async (skinProfile, hairProfile) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY non configurée');
    }

    const prompt = `Tu es un expert en cosmétiques et soins personnalisés. Analyse ce profil client et génère des recommandations.

**Profil de peau:**
- Type: ${skinProfile.skinType}
- Préoccupations: ${skinProfile.skinConcerns.join(', ')}
- Objectifs: ${skinProfile.skinGoals.join(', ')}
- Sensibilité: ${skinProfile.sensitivity}

**Profil capillaire:**
- Type cheveux: ${hairProfile.hairType}
- Texture: ${hairProfile.hairTexture}
- Type cuir chevelu: ${hairProfile.scalpType}
- Préoccupations: ${hairProfile.hairConcerns.join(', ')}
- Objectifs: ${hairProfile.hairGoals.join(', ')}

Retourne UNIQUEMENT un JSON valide avec cette structure:
{
  "skinRoutine": ["étape 1", "étape 2", "étape 3"],
  "hairRoutine": ["étape 1", "étape 2", "étape 3"],
  "recommendedTasks": [
    {
      "title": "Titre court",
      "description": "Description claire",
      "category": "skincare|haircare|routine",
      "icon": "emoji",
      "points": 20
    }
  ],
  "tips": ["conseil 1", "conseil 2", "conseil 3"]
}

Règles:
- skinRoutine: 3-5 étapes (nettoyage, soin, protection)
- hairRoutine: 3-4 étapes (lavage, soin, coiffage)
- recommendedTasks: 5 tâches personnalisées et réalisables
- tips: 3-5 conseils pratiques adaptés au profil`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extraire le JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Réponse IA invalide - JSON non trouvé');
    }

    const recommendations = JSON.parse(jsonMatch[0]);
    return recommendations;
  } catch (error) {
    console.error('❌ Erreur génération recommandations:', error.message);
    
    // Retourner des recommandations par défaut en cas d'erreur
    return {
      skinRoutine: [
        'Nettoyez votre visage matin et soir',
        'Appliquez un sérum adapté à vos besoins',
        'Hydratez avec une crème adaptée',
        'Protégez avec un SPF le matin'
      ],
      hairRoutine: [
        'Lavez vos cheveux 2-3 fois par semaine',
        'Utilisez un après-shampoing',
        'Appliquez un masque hebdomadaire',
        'Protégez vos cheveux de la chaleur'
      ],
      recommendedTasks: [
        {
          title: 'Complétez votre routine matinale',
          description: 'Suivez les 4 étapes de votre routine de soin',
          category: 'skincare',
          icon: '☀️',
          points: 20
        },
        {
          title: 'Testez un nouveau produit',
          description: 'Explorez notre catalogue et trouvez votre produit idéal',
          category: 'shopping',
          icon: '🛍️',
          points: 15
        },
        {
          title: 'Partagez votre avis',
          description: 'Laissez un avis sur un produit que vous avez essayé',
          category: 'review',
          icon: '⭐',
          points: 25
        },
        {
          title: 'Soignez vos cheveux',
          description: 'Appliquez un masque capillaire nourrissant',
          category: 'haircare',
          icon: '💆',
          points: 20
        },
        {
          title: 'Participez au quiz',
          description: 'Testez vos connaissances et gagnez des points',
          category: 'quiz',
          icon: '🎮',
          points: 30
        }
      ],
      tips: [
        'Hydratez-vous en buvant au moins 1,5L d\'eau par jour',
        'Dormez 7-8h par nuit pour une peau reposée',
        'Évitez de toucher votre visage trop souvent',
        'Changez votre taie d\'oreiller régulièrement'
      ]
    };
  }
};

/**
 * Génère des tâches quotidiennes personnalisées
 * @param {Object} profile - Profil utilisateur complet
 * @returns {Promise<Array>} Liste de tâches
 */
exports.generateDailyTasks = async (profile) => {
  try {
    const recommendations = await exports.generatePersonalizedRecommendations(
      profile.skinProfile,
      profile.hairProfile
    );

    // Retourner les tâches recommandées
    return recommendations.recommendedTasks;
  } catch (error) {
    console.error('❌ Erreur génération tâches quotidiennes:', error.message);
    return [];
  }
};
