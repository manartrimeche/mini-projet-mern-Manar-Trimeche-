const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  generateDescription,
  analyzeSentiment,
  getReviewsSummary,
  getRecommendations,
  getSupport
} = require('../controllers/aiController');

// Routes publiques
router.post('/support', getSupport);
router.get('/reviews-summary/:productId', getReviewsSummary);

// Routes privées
router.post('/generate-description', protect, generateDescription);
router.post('/analyze-sentiment', protect, analyzeSentiment);
router.post('/recommendations', protect, getRecommendations);

module.exports = router;
