const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    // Relation 1-to-1 avec User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    bio: {
      type: String,
      default: '',
      maxlength: 500
    },
    dateOfBirth: {
      type: Date,
      default: null
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other'
    },
    profilePicture: {
      type: String,
      default: null
    },
    
    // Profil de peau (questionnaire IA)
    skinProfile: {
      skinType: {
        type: String,
        enum: ['grasse', 'sèche', 'mixte', 'normale', 'sensible', 'non-défini'],
        default: 'non-défini'
      },
      skinConcerns: [{
        type: String,
        enum: ['acné', 'rides', 'taches', 'rougeurs', 'déshydratation', 'pores-dilatés', 'cicatrices', 'autre']
      }],
      skinGoals: [{
        type: String,
        enum: ['hydratation', 'anti-âge', 'éclaircissement', 'anti-acné', 'raffermissement', 'protection', 'autre']
      }],
      sensitivity: {
        type: String,
        enum: ['très-sensible', 'sensible', 'normale', 'résistante'],
        default: 'normale'
      }
    },

    // Profil capillaire (questionnaire IA)
    hairProfile: {
      hairType: {
        type: String,
        enum: ['raides', 'ondulés', 'bouclés', 'crépus', 'non-défini'],
        default: 'non-défini'
      },
      hairTexture: {
        type: String,
        enum: ['fins', 'normaux', 'épais', 'non-défini'],
        default: 'non-défini'
      },
      scalpType: {
        type: String,
        enum: ['gras', 'sec', 'normal', 'mixte', 'sensible', 'non-défini'],
        default: 'non-défini'
      },
      hairConcerns: [{
        type: String,
        enum: ['chute', 'pellicules', 'sécheresse', 'frisottis', 'casse', 'manque-de-volume', 'pointes-fourchues', 'autre']
      }],
      hairGoals: [{
        type: String,
        enum: ['hydratation', 'volume', 'brillance', 'fortification', 'croissance', 'lissage', 'définition-boucles', 'autre']
      }]
    },

    // Profil complété ?
    profileCompleted: {
      type: Boolean,
      default: false
    },

    // Recommandations IA personnalisées
    aiRecommendations: {
      skinRoutine: [String],
      hairRoutine: [String],
      recommendedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }],
      lastUpdated: Date
    },

    // Gamification - Points et niveau
    gamification: {
      totalPoints: {
        type: Number,
        default: 0
      },
      level: {
        type: Number,
        default: 1
      },
      badges: [{
        type: String
      }],
      completedTasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
      }]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
