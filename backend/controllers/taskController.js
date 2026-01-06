const Task = require('../models/Task');
const Profile = require('../models/Profile');
const aiService = require('../services/aiService');

/**
 * Récupère toutes les tâches de l'utilisateur
 */
exports.getUserTasks = async (req, res) => {
  try {
    const { status, type, category } = req.query;

    const filter = { user: req.user.id };
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (category) filter.category = category;

    const tasks = await Task.find(filter)
      .sort({ status: 1, createdAt: -1 })
      .populate('metadata.productId', 'name images');

    // Statistiques
    const stats = {
      pending: await Task.countDocuments({ user: req.user.id, status: 'pending' }),
      inProgress: await Task.countDocuments({ user: req.user.id, status: 'in-progress' }),
      completed: await Task.countDocuments({ user: req.user.id, status: 'completed' })
    };

    res.json({ tasks, stats });
  } catch (error) {
    console.error('❌ Erreur récupération tâches:', error.message);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/**
 * Récupère une tâche par ID
 */
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    })
      .populate('metadata.productId', 'name images price');

    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    res.json(task);
  } catch (error) {
    console.error('❌ Erreur récupération tâche:', error.message);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/**
 * Met à jour la progression d'une tâche
 */
exports.updateTaskProgress = async (req, res) => {
  try {
    const { progress } = req.body; // { current: number }

    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    if (task.status === 'completed') {
      return res.status(400).json({ message: 'Tâche déjà complétée' });
    }

    // Mettre à jour la progression
    task.progress.current = progress.current;

    // Si objectif atteint, marquer comme complétée
    if (task.progress.current >= task.progress.target) {
      task.status = 'completed';
      task.completedAt = new Date();

      // Attribuer les récompenses
      const profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        profile.gamification.totalPoints += task.rewards.points;
        
        // Ajouter points de réduction (codes promo)
        if (task.rewards.discountPoints && task.rewards.discountPoints > 0) {
          if (!profile.wallet) profile.wallet = { discountPoints: 0, giftPoints: 0 };
          if (!profile.wallet.discountPoints) profile.wallet.discountPoints = 0;
          profile.wallet.discountPoints += task.rewards.discountPoints;
        }
        
        // Ajouter points cadeaux (achat produits)
        if (task.rewards.giftPoints && task.rewards.giftPoints > 0) {
          if (!profile.wallet) profile.wallet = { discountPoints: 0, giftPoints: 0 };
          if (!profile.wallet.giftPoints) profile.wallet.giftPoints = 0;
          profile.wallet.giftPoints += task.rewards.giftPoints;
        }
        
        // Vérifier niveau (chaque 100 points = 1 niveau)
        const newLevel = Math.floor(profile.gamification.totalPoints / 100) + 1;
        if (newLevel > profile.gamification.level) {
          profile.gamification.level = newLevel;
          profile.gamification.badges.push(`🏆 Niveau ${newLevel}`);
        }

        // Ajouter badge si spécifié
        if (task.rewards.badge && !profile.gamification.badges.includes(task.rewards.badge)) {
          profile.gamification.badges.push(task.rewards.badge);
        }

        // Ajouter tâche complétée
        profile.gamification.completedTasks.push(task._id);

        await profile.save();
      }
    } else if (task.progress.current > 0) {
      task.status = 'in-progress';
    }

    await task.save();

    res.json({
      message: task.status === 'completed' ? 
        `Tâche complétée! +${task.rewards.points} points 🎉` : 
        'Progression mise à jour',
      task
    });
  } catch (error) {
    console.error('❌ Erreur mise à jour progression:', error.message);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/**
 * Marque une tâche comme complétée
 */
exports.completeTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    if (task.status === 'completed') {
      return res.status(400).json({ message: 'Tâche déjà complétée' });
    }

    // Marquer comme complétée
    task.status = 'completed';
    task.completedAt = new Date();
    task.progress.current = task.progress.target;

    await task.save();

    // Attribuer les récompenses
    const profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      profile.gamification.totalPoints += task.rewards.points;
      
      // Ajouter points de réduction (codes promo)
      if (task.rewards.discountPoints && task.rewards.discountPoints > 0) {
        if (!profile.wallet) profile.wallet = { discountPoints: 0, giftPoints: 0 };
        if (!profile.wallet.discountPoints) profile.wallet.discountPoints = 0;
        profile.wallet.discountPoints += task.rewards.discountPoints;
      }
      
      // Ajouter points cadeaux (achat produits)
      if (task.rewards.giftPoints && task.rewards.giftPoints > 0) {
        if (!profile.wallet) profile.wallet = { discountPoints: 0, giftPoints: 0 };
        if (!profile.wallet.giftPoints) profile.wallet.giftPoints = 0;
        profile.wallet.giftPoints += task.rewards.giftPoints;
      }
      
      // Vérifier niveau
      const newLevel = Math.floor(profile.gamification.totalPoints / 100) + 1;
      if (newLevel > profile.gamification.level) {
        profile.gamification.level = newLevel;
        profile.gamification.badges.push(`🏆 Niveau ${newLevel}`);
      }

      // Ajouter badge
      if (task.rewards.badge && !profile.gamification.badges.includes(task.rewards.badge)) {
        profile.gamification.badges.push(task.rewards.badge);
      }

      // Ajouter à la liste des tâches complétées
      if (!profile.gamification.completedTasks.includes(task._id)) {
        profile.gamification.completedTasks.push(task._id);
      }

      await profile.save();

      // Vérifier si toutes les tâches onboarding sont complétées
      const onboardingTasks = await Task.find({
        user: req.user.id,
        type: 'onboarding'
      });

      const allCompleted = onboardingTasks.every(t => 
        t.status === 'completed' || t._id.equals(task._id)
      );

      if (allCompleted && onboardingTasks.length > 0) {
        // Bonus pour avoir tout complété
        profile.gamification.totalPoints += 100;
        if (!profile.wallet) profile.wallet = { discountPoints: 0 };
        profile.wallet.discountPoints += 25; // 25 points de réduction bonus
        profile.gamification.badges.push('🌟 Champion du Démarrage');
        await profile.save();

        return res.json({
          message: 'Toutes les tâches d\'onboarding complétées! Bonus de 100 points + 25 points réduction au panier 🎉🎉',
          task,
          totalRewards: {
            points: task.rewards.points + 100,
            discountPoints: (task.rewards.discountPoints || 0) + 25,
            badges: [task.rewards.badge, '🌟 Champion du Démarrage'].filter(Boolean),
            level: profile.gamification.level
          }
        });
      }

      res.json({
        message: `Tâche complétée! +${task.rewards.points} points 🎉`,
        task,
        rewards: {
          points: task.rewards.points,
          discountPoints: task.rewards.discountPoints || 0,
          badge: task.rewards.badge,
          level: profile.gamification.level
        }
      });
    } else {
      res.json({ message: 'Tâche complétée', task });
    }
  } catch (error) {
    console.error('❌ Erreur complétion tâche:', error.message);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/**
 * Supprime une tâche expirée
 */
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    res.json({ message: 'Tâche supprimée', task });
  } catch (error) {
    console.error('❌ Erreur suppression tâche:', error.message);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/**
 * Nettoie les tâches expirées
 */
exports.cleanExpiredTasks = async (req, res) => {
  try {
    const result = await Task.deleteMany({
      user: req.user.id,
      status: { $ne: 'completed' },
      expiresAt: { $lt: new Date() }
    });

    res.json({
      message: `${result.deletedCount} tâche(s) expirée(s) supprimée(s)`,
      count: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Erreur nettoyage tâches:', error.message);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/**
 * Obtient les conseils IA pour une tâche
 */
exports.getTaskAdvice = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    console.log('💡 Requête conseils pour:', task.title);
    const advice = await aiService.generateTaskAdvice(task);

    res.json({
      success: true,
      message: 'Conseils générés avec succès',
      data: {
        taskId: task._id,
        taskTitle: task.title,
        advice: advice
      }
    });
  } catch (error) {
    console.error('❌ Erreur génération conseils tâche:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur: ' + error.message
    });
  }
};
