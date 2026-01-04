const quizService = require('../services/quizService');
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const Product = require('../models/Product');

// DESC: Créer un quiz pour un produit
// ROUTE: POST /api/quiz/:productId/generate
// ACCESS: Private (Admin)
exports.generateQuiz = async (req, res) => {
  try {
    const { productId } = req.params;
    const { category = 'benefits', numQuestions = 5 } = req.body;

    // Vérifier que le produit existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    // Vérifier qu'un quiz n'existe pas déjà
    const existingQuiz = await Quiz.findOne({ product: productId, category });
    if (existingQuiz) {
      return res.status(200).json({
        success: true,
        message: 'Quiz existant récupéré',
        data: existingQuiz
      });
    }

    // Générer les questions avec l'IA
    const questions = await quizService.generateQuizQuestions(
      product.name,
      category,
      numQuestions
    );

    // Créer le quiz
    const quiz = new Quiz({
      product: productId,
      category,
      questions: questions.map(q => ({
        _id: new require('mongoose').Types.ObjectId(),
        text: q.text,
        options: q.options,
        explanation: q.explanation,
        difficulty: q.difficulty
      }))
    });

    await quiz.save();

    res.status(201).json({
      success: true,
      message: 'Quiz généré avec succès',
      data: quiz
    });
  } catch (error) {
    console.error('❌ Erreur génération quiz:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur: ' + error.message
    });
  }
};

// DESC: Obtenir un quiz pour un produit
// ROUTE: GET /api/quiz/:productId
// ACCESS: Public
exports.getQuiz = async (req, res) => {
  try {
    const { productId } = req.params;
    const { category = 'benefits' } = req.query;

    let quiz = await Quiz.findOne({ product: productId, category }).populate('product');

    // Si n'existe pas, créer avec des questions par défaut
    if (!quiz) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produit non trouvé'
        });
      }

      // Questions adaptées selon le type de produit
      const productNameLower = product.name.toLowerCase();
      const isHairProduct = productNameLower.includes('shampoing') || 
                           productNameLower.includes('shampooing') ||
                           productNameLower.includes('après-shampoing') ||
                           productNameLower.includes('conditionneur') ||
                           productNameLower.includes('cheveux');
      
      let defaultQuestions;
      
      if (isHairProduct) {
        // Questions pour produits capillaires
        defaultQuestions = [
          {
            _id: new (require('mongoose')).Types.ObjectId(),
            text: `Comment utiliser correctement ${product.name}?`,
            options: [
              { text: 'Appliquer sur cheveux secs', isCorrect: false },
              { text: 'Appliquer sur cheveux mouillés, masser et rincer', isCorrect: true },
              { text: 'Laisser poser toute la nuit', isCorrect: false },
              { text: 'Utiliser sans rincer', isCorrect: false }
            ],
            explanation: 'Les shampoings s\'appliquent sur cheveux mouillés, on masse le cuir chevelu et on rince abondamment.',
            difficulty: 'facile'
          },
          {
            _id: new (require('mongoose')).Types.ObjectId(),
            text: `Quel est le principal bénéfice de ${product.name}?`,
            options: [
              { text: 'Nettoyer et purifier les cheveux', isCorrect: true },
              { text: 'Colorer les cheveux', isCorrect: false },
              { text: 'Faire pousser les cheveux plus vite', isCorrect: false },
              { text: 'Remplacer le conditionneur', isCorrect: false }
            ],
            explanation: `Un bon shampoing nettoie en douceur le cuir chevelu et les cheveux en éliminant les impuretés.`,
            difficulty: 'facile'
          },
          {
            _id: new (require('mongoose')).Types.ObjectId(),
            text: `À quelle fréquence utiliser ce type de produit?`,
            options: [
              { text: '1 fois par mois', isCorrect: false },
              { text: '2-3 fois par semaine selon le type de cheveux', isCorrect: true },
              { text: '5 fois par jour', isCorrect: false },
              { text: 'Jamais', isCorrect: false }
            ],
            explanation: 'La fréquence dépend de votre type de cheveux : 2-3 fois/semaine pour cheveux normaux, plus pour cheveux gras.',
            difficulty: 'moyen'
          },
          {
            _id: new (require('mongoose')).Types.ObjectId(),
            text: `Quelle quantité de produit utiliser?`,
            options: [
              { text: 'Une noix (taille d\'une pièce)', isCorrect: true },
              { text: 'Tout le flacon', isCorrect: false },
              { text: 'Une goutte', isCorrect: false },
              { text: 'Un demi-flacon', isCorrect: false }
            ],
            explanation: 'Une petite quantité (taille d\'une noix) suffit et mousse bien au contact de l\'eau.',
            difficulty: 'moyen'
          },
          {
            _id: new (require('mongoose')).Types.ObjectId(),
            text: `Pourquoi rincer abondamment après l'application?`,
            options: [
              { text: 'Pour économiser de l\'eau', isCorrect: false },
              { text: 'Pour éliminer tous les résidus de produit', isCorrect: true },
              { text: 'Ce n\'est pas nécessaire', isCorrect: false },
              { text: 'Pour refroidir les cheveux', isCorrect: false }
            ],
            explanation: 'Un rinçage complet élimine tous les résidus et évite que les cheveux ne deviennent ternes ou gras.',
            difficulty: 'facile'
          }
        ];
      } else {
        // Questions pour produits de soin de la peau
        defaultQuestions = [
          {
            _id: new (require('mongoose')).Types.ObjectId(),
            text: `Comment utiliser correctement ${product.name}?`,
            options: [
              { text: 'Appliquer généreusement sur peau sèche', isCorrect: false },
              { text: 'Appliquer sur peau propre et légèrement humide', isCorrect: true },
              { text: 'Utiliser une fois par mois', isCorrect: false },
              { text: 'Mélanger avec d\'autres produits', isCorrect: false }
            ],
            explanation: 'La meilleure application est sur une peau propre et légèrement humidifiée pour une absorption optimale.',
            difficulty: 'facile'
          },
          {
            _id: new (require('mongoose')).Types.ObjectId(),
            text: `Quel est le principal avantage de ${product.name}?`,
            options: [
              { text: 'Économique', isCorrect: false },
              { text: 'Hydratation et protection', isCorrect: true },
              { text: 'Couleur', isCorrect: false },
              { text: 'Texture grasse', isCorrect: false }
            ],
            explanation: `Les produits cosmétiques de qualité offrent une hydratation durable et une protection contre les agressions extérieures.`,
            difficulty: 'moyen'
          },
          {
            _id: new (require('mongoose')).Types.ObjectId(),
            text: `Quelle est la fréquence recommandée d'utilisation?`,
            options: [
              { text: '1 fois par an', isCorrect: false },
              { text: '1 fois par mois', isCorrect: false },
              { text: 'Quotidiennement selon le type de peau', isCorrect: true },
              { text: 'Jamais', isCorrect: false }
            ],
            explanation: 'L\'utilisation régulière et quotidienne est recommandée pour obtenir les meilleurs résultats.',
            difficulty: 'moyen'
          },
          {
            _id: new (require('mongoose')).Types.ObjectId(),
            text: `Pour quel type de peau ce produit est-il idéal?`,
            options: [
              { text: 'Uniquement peaux grasses', isCorrect: false },
              { text: 'Tous les types de peau', isCorrect: true },
              { text: 'Uniquement peaux sèches', isCorrect: false },
              { text: 'Aucun type de peau', isCorrect: false }
            ],
            explanation: 'Les bons produits cosmétiques sont adaptés à la plupart des types de peau.',
            difficulty: 'facile'
          },
          {
            _id: new (require('mongoose')).Types.ObjectId(),
            text: `Quelle est l'importance de la constance dans l'utilisation?`,
            options: [
              { text: 'Peu importante', isCorrect: false },
              { text: 'Très importante pour des résultats visibles', isCorrect: true },
              { text: 'Complètement inutile', isCorrect: false },
              { text: 'Seulement importante en hiver', isCorrect: false }
            ],
            explanation: 'La constance est essentielle pour voir des résultats durables et bénéfiques.',
            difficulty: 'difficile'
          }
        ];
      }

      quiz = new Quiz({
        product: productId,
        category,
        questions: defaultQuestions
      });

      await quiz.save();
      await quiz.populate('product');
    }

    res.status(200).json({
      success: true,
      message: 'Quiz récupéré',
      data: quiz
    });
  } catch (error) {
    console.error('❌ Erreur récupération quiz:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur: ' + error.message
    });
  }
};

// DESC: Soumettre les réponses du quiz
// ROUTE: POST /api/quiz/:quizId/submit
// ACCESS: Private
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers, timeSpent } = req.body;
    const userId = req.user.id;

    // Récupérer le quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz non trouvé'
      });
    }

    // Calculer le score
    let correctAnswers = 0;
    const processedAnswers = [];

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = question.options[userAnswer?.selectedIndex]?.isCorrect || false;

      if (isCorrect) {
        correctAnswers++;
      }

      processedAnswers.push({
        questionId: question._id,
        selectedIndex: userAnswer?.selectedIndex,
        isCorrect,
        timeSpent: userAnswer?.timeSpent || 0
      });
    });

    // Calculer le pourcentage
    const score = correctAnswers;
    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    // Calculer les points
    const pointsPerQuestion = quiz.rewards.pointsPerCorrect;
    let pointsEarned = correctAnswers * pointsPerQuestion;

    // Bonus pour score parfait
    if (percentage === 100) {
      pointsEarned += quiz.rewards.bonusForPerfectScore;
    }

    // Déterminer les badges
    const badgesEarned = [];
    if (percentage === 100) badgesEarned.push('Parfait 🏆');
    if (percentage >= 80) badgesEarned.push('Excellent 🌟');
    if (percentage >= 60) badgesEarned.push('Bon 👍');
    if (percentage >= 40) badgesEarned.push('Passable ✓');

    // Créer le résultat
    const result = new QuizResult({
      user: userId,
      quiz: quizId,
      answers: processedAnswers,
      score,
      totalQuestions,
      percentage,
      pointsEarned,
      badgesEarned,
      totalTime: timeSpent
    });

    await result.save();

    // Mettre à jour les statistiques du quiz
    quiz.stats.totalAttempts += 1;
    quiz.stats.averageScore = 
      (quiz.stats.averageScore * (quiz.stats.totalAttempts - 1) + score) / 
      quiz.stats.totalAttempts;
    if (timeSpent) {
      quiz.stats.averageTime = 
        (quiz.stats.averageTime * (quiz.stats.totalAttempts - 1) + timeSpent) / 
        quiz.stats.totalAttempts;
    }
    await quiz.save();

    res.status(200).json({
      success: true,
      message: 'Quiz complété!',
      data: {
        result,
        feedback: {
          score: `${correctAnswers}/${totalQuestions}`,
          percentage: `${percentage}%`,
          pointsEarned,
          badgesEarned
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur soumission quiz:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur: ' + error.message
    });
  }
};

// DESC: Soumettre les réponses du quiz (version publique sans authentification)
// ROUTE: POST /api/quiz/:quizId/submit-public
// ACCESS: Public
exports.submitQuizPublic = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers, timeSpent } = req.body;

    // Récupérer le quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz non trouvé'
      });
    }

    // Calculer le score
    let correctAnswers = 0;
    const processedAnswers = [];

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = question.options[userAnswer?.selectedIndex]?.isCorrect || false;

      if (isCorrect) {
        correctAnswers++;
      }

      processedAnswers.push({
        questionId: question._id,
        selectedIndex: userAnswer?.selectedIndex,
        isCorrect,
        timeSpent: userAnswer?.timeSpent || 0
      });
    });

    // Calculer le pourcentage
    const score = correctAnswers;
    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    // Calculer les points
    const pointsPerQuestion = quiz.rewards.pointsPerCorrect;
    let pointsEarned = correctAnswers * pointsPerQuestion;

    // Bonus pour score parfait
    if (percentage === 100) {
      pointsEarned += quiz.rewards.bonusForPerfectScore;
    }

    // Déterminer les badges
    const badgesEarned = [];
    if (percentage === 100) badgesEarned.push('Parfait 🏆');
    if (percentage >= 80) badgesEarned.push('Excellent 🌟');
    if (percentage >= 60) badgesEarned.push('Bon 👍');
    if (percentage >= 40) badgesEarned.push('Passable ✓');

    // Mettre à jour les statistiques du quiz (sans sauvegarder de résultat utilisateur)
    quiz.stats.totalAttempts += 1;
    quiz.stats.averageScore = 
      (quiz.stats.averageScore * (quiz.stats.totalAttempts - 1) + score) / 
      quiz.stats.totalAttempts;
    if (timeSpent) {
      quiz.stats.averageTime = 
        (quiz.stats.averageTime * (quiz.stats.totalAttempts - 1) + timeSpent) / 
        quiz.stats.totalAttempts;
    }
    await quiz.save();

    // Retourner les résultats sans sauvegarder dans QuizResult (mode anonyme)
    res.status(200).json({
      success: true,
      message: 'Quiz complété!',
      data: {
        result: {
          answers: processedAnswers,
          score,
          totalQuestions,
          percentage,
          pointsEarned,
          badgesEarned,
          totalTime: timeSpent
        },
        feedback: {
          score: `${correctAnswers}/${totalQuestions}`,
          percentage: `${percentage}%`,
          pointsEarned,
          badgesEarned
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur soumission quiz public:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur: ' + error.message
    });
  }
};

// DESC: Obtenir les résultats de l'utilisateur
// ROUTE: GET /api/quiz/results/user
// ACCESS: Private
exports.getUserResults = async (req, res) => {
  try {
    const userId = req.user.id;

    const results = await QuizResult.find({ user: userId })
      .populate('quiz')
      .sort({ completedAt: -1 });

    // Calculer les statistiques globales
    const stats = {
      totalQuizzesCompleted: results.length,
      averagePercentage: 0,
      totalPointsEarned: 0,
      allBadges: []
    };

    if (results.length > 0) {
      stats.averagePercentage = 
        Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length);
      stats.totalPointsEarned = results.reduce((sum, r) => sum + r.pointsEarned, 0);
      stats.allBadges = [...new Set(results.flatMap(r => r.badgesEarned))];
    }

    res.status(200).json({
      success: true,
      message: 'Résultats récupérés',
      data: { results, stats }
    });
  } catch (error) {
    console.error('❌ Erreur résultats:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur: ' + error.message
    });
  }
};

// DESC: Obtenir les résultats d'un quiz spécifique
// ROUTE: GET /api/quiz/:quizId/results
// ACCESS: Private
exports.getQuizResults = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const result = await QuizResult.findOne({ quiz: quizId, user: userId })
      .populate('quiz');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Résultat non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Résultat récupéré',
      data: result
    });
  } catch (error) {
    console.error('❌ Erreur résultat quiz:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur: ' + error.message
    });
  }
};

// DESC: Obtenir le classement global
// ROUTE: GET /api/quiz/leaderboard
// ACCESS: Public
exports.getLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const leaderboard = await QuizResult.aggregate([
      {
        $group: {
          _id: '$user',
          totalPoints: { $sum: '$pointsEarned' },
          quizzesCompleted: { $sum: 1 },
          averagePercentage: { $avg: '$percentage' }
        }
      },
      { $sort: { totalPoints: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Classement récupéré',
      data: leaderboard
    });
  } catch (error) {
    console.error('❌ Erreur classement:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur: ' + error.message
    });
  }
};
