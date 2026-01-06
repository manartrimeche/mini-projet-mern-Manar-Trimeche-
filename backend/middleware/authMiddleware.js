const jwt = require('jsonwebtoken');

// Middleware pour protéger les routes
const protect = (req, res, next) => {
  let token;

  // Récupérer le token du header Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extraire le token (format: "Bearer token")
      token = req.headers.authorization.split(' ')[1];

      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Ajouter l'ID utilisateur à la requête (compatible avec les deux formats)
      req.userId = decoded.userId;
      req.user = { id: decoded.userId };

      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: '  Token invalide ou expiré'
      });
    }
  } else {
    res.status(401).json({
      success: false,
      message: '  Pas de token, accès refusé'
    });
  }
};

module.exports = protect;
