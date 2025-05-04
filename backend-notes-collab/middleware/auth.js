const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Récupérer le token du header Authorization
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentification requise' });
    }
    
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ajouter les informations de l'utilisateur à la requête
    req.user = {
      id: decoded.id,
      username: decoded.username
    };
    
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(401).json({ message: 'Token invalide' });
  }
};