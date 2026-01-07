const User = require('../models/User');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');

// Fonction utilitaire : Générer un JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, // Payload
    process.env.JWT_SECRET, // Secret
    { expiresIn: '7d' } // Options
  );
};

// DESC: Enregistrer un nouvel utilisateur
// ROUTE: POST /api/auth/register
// ACCESS: Public
exports.register = async (req, res) => {
  try {
    const { username, email, password, passwordConfirm } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email et password sont requis'
      });
    }

    // Vérifier que les mots de passe correspondent
    if (password !== passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Les mots de passe ne correspondent pas'
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet email ou username est déjà utilisé'
      });
    }

    // Créer l'utilisateur
    // Le mot de passe est hashé automatiquement par le middleware pre('save')
    const user = new User({
      username,
      email,
      password
    });

    // Sauvegarder l'utilisateur
    await user.save();

    // Créer un profil pour cet utilisateur
    const profile = new Profile({
      user: user._id
    });

    // Sauvegarder le profil
    await profile.save();

    // Mettre à jour l'utilisateur avec la référence au profil
    user.profile = profile._id;
    await user.save();

    res.status(201).json({
      success: true,
      message: '✅ Utilisateur créé avec succès. Veuillez vous connecter.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Erreur enregistrement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement',
      error: error.message
    });
  }
};

// DESC: Connexion utilisateur
// ROUTE: POST /api/auth/login
// ACCESS: Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et password sont requis'
      });
    }

    // Trouver l'utilisateur et INCLURE le password (select: false par défaut)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '  Email ou password incorrect'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '  Email ou password incorrect'
      });
    }

    // Générer le token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: '✅ Connecté avec succès',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message
    });
  }
};

// DESC: Récupérer le profil de l'utilisateur connecté
// ROUTE: GET /api/auth/me
// ACCESS: Private (require token)
exports.getMe = async (req, res) => {
  try {
    // req.userId est défini par le middleware protect
    const user = await User.findById(req.userId)
      .populate('profile')
      .populate('orders')
      .populate('wishlist');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: error.message
    });
  }
};

// DESC: Logout (optionnel - géré côté frontend avec suppression du token)
// ROUTE: POST /api/auth/logout
// ACCESS: Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: '✅ Déconnecté avec succès'
  });
};
