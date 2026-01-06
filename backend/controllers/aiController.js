const aiService = require('../services/aiService');
const Product = require('../models/Product');
const Review = require('../models/Review');

// DESC: Générer une description de produit avec IA
// ROUTE: POST /api/ai/generate-description
// ACCESS: Private (Admin)
exports.generateDescription = async (req, res) => {
  try {
    const { productName, category } = req.body;

    if (!productName) {
      return res.status(400).json({
        success: false,
        message: 'productName est requis'
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Service IA non configuré'
      });
    }

    const description = await aiService.generateProductDescription(
      productName,
      category || 'cosmetics'
    );

    res.status(200).json({
      success: true,
      message: 'Description générée avec succès',
      data: { description }
    });
  } catch (error) {
    console.error('❌ Erreur génération:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur: ' + error.message,
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};

// DESC: Analyser le sentiment d'un avis
// ROUTE: POST /api/ai/analyze-sentiment
// ACCESS: Private
exports.analyzeSentiment = async (req, res) => {
  try {
    const { reviewText } = req.body;

    if (!reviewText) {
      return res.status(400).json({
        success: false,
        message: 'reviewText est requis'
      });
    }

    const analysis = await aiService.analyzeSentiment(reviewText);

    res.status(200).json({
      success: true,
      message: 'Analyse de sentiment complétée',
      data: analysis
    });
  } catch (error) {
    console.error('❌ Erreur analyse sentiment:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur: ' + error.message,
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};

// DESC: Générer un résumé des avis d'un produit
// ROUTE: GET /api/ai/reviews-summary/:productId
// ACCESS: Public
exports.getReviewsSummary = async (req, res) => {
  try {
    const { productId } = req.params;

    // Récupérer tous les avis du produit
    const reviews = await Review.find({ product: productId });

    if (reviews.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Aucun avis disponible',
        data: { summary: 'Aucun avis pour ce produit' }
      });
    }

    const reviewTexts = reviews.map(r => r.comment);
    const summary = await aiService.generateReviewsSummary(reviewTexts);

    res.status(200).json({
      success: true,
      message: 'Résumé des avis généré',
      data: {
        reviewCount: reviews.length,
        summary: summary
      }
    });
  } catch (error) {
    console.error('❌ Erreur résumé avis:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur: ' + error.message,
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};

// DESC: Obtenir des recommandations de produits
// ROUTE: POST /api/ai/recommendations
// ACCESS: Private
exports.getRecommendations = async (req, res) => {
  try {
    const { preferences } = req.body;

    if (!preferences) {
      return res.status(400).json({
        success: false,
        message: 'preferences est requis'
      });
    }

    // Récupérer les produits disponibles
    const products = await Product.find()
      .select('_id name category')
      .limit(50);

    const recommendedIds = await aiService.generateRecommendations(
      preferences,
      products
    );

    // Récupérer les détails des produits recommandés
    const recommended = await Product.find({
      _id: { $in: recommendedIds }
    });

    res.status(200).json({
      success: true,
      message: 'Recommandations générées',
      data: {
        count: recommended.length,
        products: recommended
      }
    });
  } catch (error) {
    console.error('❌ Erreur recommandations:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur: ' + error.message,
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};

// DESC: Obtenir une réponse d'assistance client
// ROUTE: POST /api/ai/support
// ACCESS: Public
exports.getSupport = async (req, res) => {
  try {
    const { question, context } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'question est requis'
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY non configurée');
      return res.status(500).json({
        success: false,
        message: 'Service IA non configuré. Veuillez contacter le support.'
      });
    }

    const response = await aiService.generateCustomerSupport(
      question,
      context || ''
    );

    res.status(200).json({
      success: true,
      message: 'Réponse générée',
      data: { response }
    });
  } catch (error) {
    console.error('❌ Erreur support IA:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Service IA temporairement indisponible.',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};
