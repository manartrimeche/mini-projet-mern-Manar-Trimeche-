const mongoose = require('mongoose');

/**
 * Modèle Task - Missions/Tâches gamifiées
 * Recommandées personnellement par l'IA selon le profil
 */

const taskSchema = new mongoose.Schema(
  {
    // Utilisateur assigné
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Type de tâche
    type: {
      type: String,
      enum: ['daily', 'weekly', 'onboarding', 'challenge', 'special'],
      default: 'daily'
    },

    // Catégorie
    category: {
      type: String,
      enum: ['skincare', 'haircare', 'routine', 'shopping', 'review', 'social'],
      required: true
    },

    // Titre de la tâche
    title: {
      type: String,
      required: true,
      maxlength: 100
    },

    // Description
    description: {
      type: String,
      required: true,
      maxlength: 500
    },

    // Icône
    icon: {
      type: String,
      default: '✨'
    },

    // Récompenses
    rewards: {
      points: {
        type: Number,
        default: 10
      },
      bonus: {
        type: String,
        default: null
      },
      badge: {
        type: String,
        default: null
      }
    },

    // Statut
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'expired'],
      default: 'pending'
    },

    // Progression
    progress: {
      current: {
        type: Number,
        default: 0
      },
      target: {
        type: Number,
        default: 1
      }
    },

    // Date limite (optionnel)
    dueDate: {
      type: Date,
      default: null
    },

    // Date de complétion
    completedAt: {
      type: Date,
      default: null
    },

    // Généré par IA ?
    aiGenerated: {
      type: Boolean,
      default: false
    },

    // Métadonnées additionnelles
    metadata: {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
      }
    }
  },
  { timestamps: true }
);

// Index pour recherche rapide
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('Task', taskSchema);
