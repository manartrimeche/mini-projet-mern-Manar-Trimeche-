const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/leaderboard', quizController.getLeaderboard);
router.get('/:productId', quizController.getQuiz);
router.post('/:quizId/submit-public', quizController.submitQuizPublic);

// Protected routes
router.post('/:productId/generate', authMiddleware, quizController.generateQuiz);
router.post('/:quizId/submit', authMiddleware, quizController.submitQuiz);
router.get('/:quizId/results', authMiddleware, quizController.getQuizResults);
router.get('/user/results', authMiddleware, quizController.getUserResults);

module.exports = router;
