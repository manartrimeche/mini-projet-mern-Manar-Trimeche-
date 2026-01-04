const mongoose = require('mongoose');

/**
 * Résultats du Quiz - Gamification
 * Enregistre chaque tentative de quiz
 */

const QuizResultSchema = new mongoose.Schema({
  // Utilisateur qui a complété le quiz
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Quiz complété
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },

  // Réponses de l'utilisateur
  answers: [
    {
      questionId: mongoose.Schema.Types.ObjectId,
      selectedIndex: Number,
      isCorrect: Boolean,
      timeSpent: Number // en secondes
    }
  ],

  // Score final
  score: {
    type: Number,
    required: true
  },

  totalQuestions: {
    type: Number,
    required: true
  },

  percentage: {
    type: Number,
    required: true
  },

  // Points gagnés
  pointsEarned: {
    type: Number,
    default: 0
  },

  // Badges
  badgesEarned: [String],

  // Temps total
  totalTime: Number, // en secondes

  // Status
  completed: {
    type: Boolean,
    default: true
  },

  // Date
  completedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('QuizResult', QuizResultSchema);
