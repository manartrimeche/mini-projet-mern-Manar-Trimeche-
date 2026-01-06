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

    const prompt = `Tu es un expert en cosmétiques et soins personnalisés. Analyse ce profil client et génère des recommandations TRÈS SPÉCIFIQUES.

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
      "title": "Titre court et SPÉCIFIQUE au profil",
      "description": "Description TRÈS DÉTAILLÉE mentionnant le type de peau/cheveux et les préoccupations exactes",
      "category": "skincare|haircare|routine|shopping|review",
      "icon": "emoji",
      "points": 20
    }
  ],
  "tips": ["conseil 1", "conseil 2", "conseil 3"]
}

Règles IMPORTANTES:
- skinRoutine: 3-5 étapes personnalisées selon le type de peau "${skinProfile.skinType}" et préoccupations "${skinProfile.skinConcerns.join(', ')}"
- hairRoutine: 3-4 étapes personnalisées selon le type de cheveux "${hairProfile.hairType}" et préoccupations "${hairProfile.hairConcerns.join(', ')}"
- recommendedTasks: 6-8 tâches TRÈS SPÉCIFIQUES basées sur:
  * Les préoccupations exactes (${skinProfile.skinConcerns.join(', ')}, ${hairProfile.hairConcerns.join(', ')})
  * Les objectifs (${skinProfile.skinGoals.join(', ')}, ${hairProfile.hairGoals.join(', ')})
  * Le type de peau/cheveux
  * Exemples: "Appliquer un sérum hydratant pour peau ${skinProfile.skinType}", "Utiliser un masque pour ${hairProfile.hairConcerns[0] || 'cheveux'}"
- tips: 4-6 conseils ULTRA SPÉCIFIQUES au profil, pas génériques
- ÉVITER les tâches génériques comme "Testez un nouveau produit"
- category valides: skincare, haircare, routine, shopping, review, social`;

    console.log('  Appel API Gemini...');
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extraire le JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Réponse IA invalide - JSON non trouvé');
    }

    const recommendations = JSON.parse(jsonMatch[0]);
    
    // Valider la structure de la réponse
    if (!recommendations.skinRoutine || !Array.isArray(recommendations.skinRoutine)) {
      throw new Error('skinRoutine manquante ou invalide dans la réponse IA');
    }
    if (!recommendations.hairRoutine || !Array.isArray(recommendations.hairRoutine)) {
      throw new Error('hairRoutine manquante ou invalide dans la réponse IA');
    }
    if (!recommendations.recommendedTasks || !Array.isArray(recommendations.recommendedTasks)) {
      throw new Error('recommendedTasks manquante ou invalide dans la réponse IA');
    }
    if (!recommendations.tips || !Array.isArray(recommendations.tips)) {
      throw new Error('tips manquée ou invalide dans la réponse IA');
    }
    
    console.log('✅ Recommandations IA générées avec succès');
    return recommendations;
  } catch (error) {
    console.error('❌ Erreur génération recommandations (utilisation du fallback):', error.message);
    console.log('📋 Utilisation des tâches personnalisées par défaut...');
    
    // Retourner des recommandations personnalisées par défaut basées sur le profil
    const skinType = skinProfile.skinType || 'normale';
    const mainSkinConcern = skinProfile.skinConcerns[0] || 'hydratation';
    const mainHairConcern = hairProfile.hairConcerns[0] || 'hydratation';
    const hairType = hairProfile.hairType || 'normaux';
    
    return {
      skinRoutine: [
        `Nettoyez votre peau ${skinType} avec un nettoyant doux matin et soir`,
        `Appliquez un sérum ciblant ${mainSkinConcern}`,
        `Hydratez avec une crème adaptée aux peaux ${skinType}`,
        'Protégez avec un SPF 30+ chaque matin'
      ],
      hairRoutine: [
        `Lavez vos cheveux ${hairType} 2-3 fois par semaine`,
        `Utilisez un après-shampoing pour traiter ${mainHairConcern}`,
        `Appliquez un masque hebdomadaire ciblant ${mainHairConcern}`,
        'Protégez vos cheveux de la chaleur avec un spray thermoprotecteur'
      ],
      recommendedTasks: [
        {
          title: `Routine matinale pour peau ${skinType}`,
          description: `Nettoyez, tonifiez et hydratez votre peau ${skinType}. N'oubliez pas le SPF pour protéger contre les UV et prévenir ${mainSkinConcern}`,
          category: 'skincare',
          icon: '☀️',
          points: 20
        },
        {
          title: `Soin spécifique pour ${mainSkinConcern}`,
          description: `Appliquez un sérum ou un traitement ciblé pour traiter ${mainSkinConcern} sur votre peau ${skinType}`,
          category: 'skincare',
          icon: '✨',
          points: 25
        },
        {
          title: `Masque capillaire pour ${mainHairConcern}`,
          description: `Appliquez un masque nourrissant sur vos cheveux ${hairType} pour traiter ${mainHairConcern}. Laissez poser 15-20 minutes`,
          category: 'haircare',
          icon: '💆',
          points: 20
        },
        {
          title: `Soin du cuir chevelu ${hairProfile.scalpType}`,
          description: `Massez votre cuir chevelu ${hairProfile.scalpType} pour stimuler la circulation et traiter ${mainHairConcern}`,
          category: 'haircare',
          icon: '💆‍♀️',
          points: 15
        },
        {
          title: `Trouvez des produits pour peau ${skinType}`,
          description: `Explorez notre catalogue et découvrez des produits adaptés aux peaux ${skinType} avec préoccupation ${mainSkinConcern}`,
          category: 'shopping',
          icon: '🛍️',
          points: 15
        },
        {
          title: 'Partagez votre expérience',
          description: 'Laissez un avis détaillé sur un produit que vous avez testé pour aider la communauté',
          category: 'review',
          icon: '⭐',
          points: 25
        }
      ],
      tips: [
        `Pour votre peau ${skinType}: buvez au moins 1,5L d'eau par jour pour maintenir l'hydratation`,
        `Contre ${mainSkinConcern}: dormez 7-8h par nuit pour permettre la régénération cellulaire`,
        `Pour vos cheveux ${hairType}: évitez les lavages trop fréquents qui peuvent aggraver ${mainHairConcern}`,
        'Changez votre taie d\'oreiller chaque semaine pour éviter les impuretés',
        `Adaptez votre routine selon les saisons: votre peau ${skinType} peut avoir des besoins différents`
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
