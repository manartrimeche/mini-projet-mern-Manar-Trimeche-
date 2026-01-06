const Profile = require('../models/Profile');
const Task = require('../models/Task');
const { generatePersonalizedRecommendations } = require('../services/recommendationService');

/**
 * Récupère le profil de l'utilisateur connecté
 */
exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id })
      .populate('user', 'username email');

    if (!profile) {
      return res.status(404).json({ message: 'Profil non trouvé' });
    }

    res.json(profile);
  } catch (error) {
    console.error('❌ Erreur récupération profil:', error.message);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/**
 * Complète le questionnaire de profil (onboarding)
 */
exports.completeOnboarding = async (req, res) => {
  try {
    const { skinProfile, hairProfile } = req.body;

    // Validation
    if (!skinProfile || !hairProfile) {
      return res.status(400).json({
        message: 'skinProfile et hairProfile sont requis'
      });
    }

    // Chercher ou créer le profil
    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      profile = new Profile({
        user: req.user.id,
        skinProfile,
        hairProfile,
        profileCompleted: true,
        gamification: {
          totalPoints: 50, // Bonus pour avoir complété le profil
          level: 1,
          badges: ['🌟 Débutant'],
          completedTasks: []
        }
      });
    } else {
      profile.skinProfile = skinProfile;
      profile.hairProfile = hairProfile;
      profile.profileCompleted = true;
      
      // Ajouter bonus si première fois
      if (!profile.gamification.totalPoints) {
        profile.gamification.totalPoints = 50;
        profile.gamification.level = 1;
        profile.gamification.badges = ['🌟 Débutant'];
      }
    }

    // Générer recommandations IA
    console.log('🤖 Génération des recommandations IA...');
    const recommendations = await generatePersonalizedRecommendations(skinProfile, hairProfile);

    profile.aiRecommendations = {
      skinRoutine: recommendations.skinRoutine,
      hairRoutine: recommendations.hairRoutine,
      recommendedProducts: []
    };

    await profile.save();

    // Générer les tâches personnalisées (filtrer les catégories invalides comme 'quiz')
    const validCategories = ['skincare', 'haircare', 'routine', 'shopping', 'review', 'social'];
    const tasksData = recommendations.recommendedTasks
      .filter(task => validCategories.includes(task.category))
      .map(task => ({
        user: req.user.id,
        type: 'onboarding',
        category: task.category,
        title: task.title,
        description: task.description,
        icon: task.icon || '✨',
        rewards: {
          points: task.points || 20
        },
        status: 'pending',
        progress: { current: 0, target: 1 },
        aiGenerated: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
      }));

    // Insérer les tâches
    const tasks = await Task.insertMany(tasksData);

    res.status(201).json({
      message: 'Profil complété avec succès! +50 points bonus 🎉',
      profile,
      tasks,
      recommendations: {
        tips: recommendations.tips
      }
    });
  } catch (error) {
    console.error('❌ Erreur onboarding:', error.message);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/**
 * Met à jour le profil utilisateur
 */
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.user; // Empêcher modification du user
    delete updates.gamification; // Empêcher modification directe de la gamification

    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ message: 'Profil non trouvé' });
    }

    res.json({ message: 'Profil mis à jour', profile });
  } catch (error) {
    console.error('❌ Erreur mise à jour profil:', error.message);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/**
 * Rafraîchit les recommandations IA
 */
exports.refreshRecommendations = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile || !profile.profileCompleted) {
      return res.status(400).json({
        message: 'Veuillez compléter votre profil d\'abord'
      });
    }

    console.log('🔄 Rafraîchissement des recommandations...');
    const recommendations = await generatePersonalizedRecommendations(
      profile.skinProfile,
      profile.hairProfile
    );

    profile.aiRecommendations = {
      skinRoutine: recommendations.skinRoutine,
      hairRoutine: recommendations.hairRoutine,
      recommendedProducts: profile.aiRecommendations?.recommendedProducts || []
    };

    await profile.save();

    res.json({
      message: 'Recommandations mises à jour',
      recommendations: {
        skinRoutine: recommendations.skinRoutine,
        hairRoutine: recommendations.hairRoutine,
        tips: recommendations.tips
      }
    });
  } catch (error) {
    console.error('❌ Erreur refresh recommandations:', error.message);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
