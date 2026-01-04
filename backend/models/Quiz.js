const mongoose = require('mongoose');

/**
 * Quiz Intelligent - Gamification avec l'IA
 * - Questions générées par Gemini
 * - Points récompensant les bonnes réponses
 * - Historique des tentatives
 */

const QuizSchema = new mongoose.Schema({
  // Produit associé au quiz
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  // Catégorie du quiz
  category: {
    type: String,
    enum: ['ingredients', 'usage', 'benefits', 'skincare_type'],
    default: 'benefits'
  },

  // Questions du quiz
  questions: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      text: {
        type: String,
        required: true
      },
      options: [
        {
          text: String,
          isCorrect: Boolean
        }
      ],
      explanation: String,
      difficulty: {
        type: String,
        enum: ['facile', 'moyen', 'difficile'],
        default: 'moyen'
      }
    }
  ],

  // Statistiques
  stats: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    averageTime: {
      type: Number,
      default: 0
    }
  },

  // Récompenses
  rewards: {
    pointsPerCorrect: {
      type: Number,
      default: 10
    },
    bonusForPerfectScore: {
      type: Number,
      default: 50
    },
    badge: String
  },

  // Métadonnées
  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Quiz', QuizSchema);
