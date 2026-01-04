const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * Génère une description de produit intelligente
 * @param {string} productName - Nom du produit
 * @param {string} category - Catégorie du produit
 * @returns {Promise<string>} Description générée
 */
exports.generateProductDescription = async (productName, category = "cosmetics") => {
  try {
    const prompt = `Générez une description de produit courte et attrayante (max 150 mots) pour un produit cosmétique nommé "${productName}" dans la catégorie "${category}". 
    
Soyez professionnel, engageant et soulignez les bénéfices. Format: texte simple, pas de markdown.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text;
  } catch (error) {
    console.error('Erreur génération description:', error.message);
    throw new Error('Impossible de générer la description: ' + error.message);
  }
};

/**
 * Analyse le sentiment d'un avis produit
 * @param {string} reviewText - Texte de l'avis
 * @returns {Promise<Object>} { sentiment: 'positive|negative|neutral', score: 0-100 }
 */
exports.analyzeSentiment = async (reviewText) => {
  try {
    const prompt = `Analysez le sentiment de cet avis client et retournez UNIQUEMENT un JSON valide sans texte supplémentaire:
    
Avis: "${reviewText}"

Retournez exactement ceci:
{"sentiment": "positive" ou "negative" ou "neutral", "score": nombre entre 0 et 100, "summary": "résumé court"}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extraire le JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Réponse IA invalide');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    console.error('Erreur analyse sentiment:', error);
    // Retourner une valeur par défaut en cas d'erreur
    return {
      sentiment: 'neutral',
      score: 50,
      summary: 'Analyse indisponible'
    };
  }
};

/**
 * Génère un résumé intelligent d'une liste d'avis
 * @param {Array<string>} reviews - Liste des textes d'avis
 * @returns {Promise<string>} Résumé généré
 */
exports.generateReviewsSummary = async (reviews) => {
  try {
    if (reviews.length === 0) {
      return "Aucun avis disponible";
    }

    const reviewsText = reviews.slice(0, 10).join('\n- ');
    
    const prompt = `Générez un résumé concis (max 100 mots) des points clés de ces avis clients:

- ${reviewsText}

Focus sur les thèmes récurrents, points forts et améliorations suggérées.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Erreur résumé:', error);
    throw new Error('Impossible de générer le résumé');
  }
};

/**
 * Génère des recommandations de produits personnalisées
 * @param {string} userPreferences - Préférences utilisateur
 * @param {Array<Object>} products - Produits disponibles
 * @returns {Promise<Array<string>>} IDs des produits recommandés
 */
exports.generateRecommendations = async (userPreferences, products) => {
  try {
    const productNames = products.map(p => `${p.name} (${p.category})`).join(', ');
    
    const prompt = `Basé sur ces préférences client: "${userPreferences}"
    
Recommandez 3-5 produits parmi cette liste (retournez UNIQUEMENT les noms):
${productNames}

Format: liste simple, un nom par ligne, pas de numérotation.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extraire les noms recommandés
    const recommended = text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => {
        // Trouver le produit correspondant
        const product = products.find(p => 
          line.toLowerCase().includes(p.name.toLowerCase())
        );
        return product ? product._id : null;
      })
      .filter(id => id !== null);
    
    return recommended;
  } catch (error) {
    console.error('Erreur recommandations:', error);
    return [];
  }
};

/**
 * Génère une réponse d'assistance client
 * @param {string} question - Question de l'utilisateur
 * @param {string} context - Contexte (produit, commande, etc.)
 * @returns {Promise<string>} Réponse générée
 */
exports.generateCustomerSupport = async (question, context = "") => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY non configurée dans .env');
    }

    const prompt = `Tu es un assistant client pour une boutique cosmétique. Réponds à cette question de façon professionnelle et utile en français.
${context ? `Contexte: ${context}` : ''}

Question: ${question}

Réponse (concise, max 200 mots):`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    if (!text) {
      throw new Error('Réponse vide de l\'IA');
    }

    return text;
  } catch (error) {
    console.error('❌ Erreur support:', error.message);
    throw new Error('Service IA indisponible: ' + error.message);
  }
};
