const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * Génère des questions de quiz intelligent sur un produit
 * @param {string} productName - Nom du produit
 * @param {string} category - Catégorie du quiz
 * @param {number} numQuestions - Nombre de questions
 * @returns {Promise<Array>} Questions formatées
 */
exports.generateQuizQuestions = async (productName, category = 'benefits', numQuestions = 5) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY non configurée');
    }

    const categoryPrompts = {
      benefits: 'les bénéfices et avantages du produit',
      ingredients: 'les ingrédients clés et leurs propriétés',
      usage: 'la bonne façon d\'utiliser le produit',
      skincare_type: 'les types de peau adaptés à ce produit'
    };

    const categoryDesc = categoryPrompts[category] || categoryPrompts.benefits;

    const prompt = `Générez ${numQuestions} questions de quiz sur "${productName}" concernant ${categoryDesc}.

Format: JSON valide UNIQUEMENT, pas d'autre texte.

Retournez exactement ceci (remplacer [...] par les valeurs):
{
  "questions": [
    {
      "text": "Question 1?",
      "options": [
        {"text": "Réponse A", "isCorrect": true},
        {"text": "Réponse B", "isCorrect": false},
        {"text": "Réponse C", "isCorrect": false},
        {"text": "Réponse D", "isCorrect": false}
      ],
      "explanation": "Explication courte",
      "difficulty": "facile|moyen|difficile"
    }
  ]
}

Règles:
- Exactement 1 réponse correcte par question
- Réponses logiques et plausibles
- Explications claires et éducatives
- Mélanger les niveaux de difficulté
- Éviter les questions trop faciles ou trop difficiles`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extraire le JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Réponse IA invalide - JSON non trouvé');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.questions || [];
  } catch (error) {
    console.error('❌ Erreur génération quiz:', error.message);
    throw new Error('Impossible de générer les questions: ' + error.message);
  }
};

/**
 * Génère une explication détaillée pour une question
 * @param {string} question - Texte de la question
 * @param {string} correctAnswer - Réponse correcte
 * @returns {Promise<string>} Explication
 */
exports.generateExplanation = async (question, correctAnswer) => {
  try {
    const prompt = `Question: ${question}
Réponse correcte: ${correctAnswer}

Générez une explication courte (max 100 mots) qui explique pourquoi c'est la bonne réponse et pourquoi les autres ne le sont pas.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('❌ Erreur explication:', error.message);
    return 'Explication non disponible';
  }
};
