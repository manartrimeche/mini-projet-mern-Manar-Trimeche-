const Review = require('../models/Review');
const Product = require('../models/Product');

// DESC: Créer un avis
// ROUTE: POST /api/reviews
// ACCESS: Private (utilisateur authentifié)
exports.createReview = async (req, res) => {
  try {
    const { product, productId, rating, comment } = req.body;
    const userId = req.userId; // Utiliser req.userId au lieu de req.user.id
    
    // Accepter soit 'product' soit 'productId' dans le body
    const prodId = product || productId;

    // Vérifier que le produit existe
    const productDoc = await Product.findById(prodId);
    if (!productDoc) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    // Vérifier que l'utilisateur n'a pas déjà laissé un avis
    const existingReview = await Review.findOne({
      product: prodId,
      user: userId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà laissé un avis sur ce produit'
      });
    }

    // Créer l'avis
    const review = await Review.create({
      product: prodId,
      user: userId,
      rating,
      comment
    });

    // Récupérer tous les avis du produit pour calculer la note moyenne
    const allReviews = await Review.find({ product: prodId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    // Mettre à jour la note moyenne du produit
    await Product.findByIdAndUpdate(prodId, { rating: avgRating });

    const populatedReview = await review.populate('user', 'username email');

    res.status(201).json({
      success: true,
      message: 'Avis créé avec succès',
      data: populatedReview
    });
  } catch (error) {
    console.error('Erreur createReview:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'avis',
      error: error.message
    });
  }
};

// DESC: Récupérer les avis d'un produit
// ROUTE: GET /api/reviews/:productId
// ACCESS: Public
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des avis',
      error: error.message
    });
  }
};

// DESC: Récupérer tous les avis de l'utilisateur
// ROUTE: GET /api/reviews/user/:userId
// ACCESS: Public
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ user: userId })
      .populate('product', 'name image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des avis',
      error: error.message
    });
  }
};

// DESC: Mettre à jour un avis
// ROUTE: PUT /api/reviews/:reviewId
// ACCESS: Private (propriétaire du review)
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.userId;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé'
      });
    }

    // Vérifier que c'est l'auteur de l'avis
    if (review.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier cet avis'
      });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    // Recalculer la note moyenne du produit
    const allReviews = await Review.find({ product: review.product });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Product.findByIdAndUpdate(review.product, { rating: avgRating });

    const updatedReview = await review.populate('user', 'username email');

    res.status(200).json({
      success: true,
      message: 'Avis modifié avec succès',
      data: updatedReview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de l\'avis',
      error: error.message
    });
  }
};

// DESC: Supprimer un avis
// ROUTE: DELETE /api/reviews/:reviewId
// ACCESS: Private (propriétaire ou admin)
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.userId;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé'
      });
    }

    // Vérifier que c'est l'auteur
    if (review.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer cet avis'
      });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(reviewId);

    // Recalculer la note moyenne du produit
    const allReviews = await Review.find({ product: productId });
    if (allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await Product.findByIdAndUpdate(productId, { rating: avgRating });
    } else {
      await Product.findByIdAndUpdate(productId, { rating: 0 });
    }

    res.status(200).json({
      success: true,
      message: 'Avis supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'avis',
      error: error.message
    });
  }
};
