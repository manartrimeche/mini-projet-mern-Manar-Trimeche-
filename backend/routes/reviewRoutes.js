const express = require('express');
const router = express.Router();
const { createReview, getProductReviews, getUserReviews, updateReview, deleteReview } = require('../controllers/reviewController');
const protect = require('../middleware/authMiddleware');

// POST - Créer un avis (protégé)
router.post('/', protect, createReview);

// GET - Récupérer les avis d'un produit
router.get('/product/:productId', getProductReviews);

// GET - Récupérer les avis d'un utilisateur
router.get('/user/:userId', getUserReviews);

// PUT - Mettre à jour un avis (protégé)
router.put('/:reviewId', protect, updateReview);

// DELETE - Supprimer un avis (protégé)
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;

