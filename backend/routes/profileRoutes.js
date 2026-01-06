const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getProfile,
  completeOnboarding,
  updateProfile,
  refreshRecommendations
} = require('../controllers/profileController');

// Routes protégées
router.get('/', protect, getProfile);
router.post('/onboarding', protect, completeOnboarding);
router.put('/', protect, updateProfile);
router.post('/refresh-recommendations', protect, refreshRecommendations);

module.exports = router;
