const User = require('../models/User')

// Middleware d'authentification simplifiée
exports.authenticate = async (req, res, next) => {
  try {
    const userId = req.headers['authorization']?.split(' ')[1]
    
    if (!userId) {
      return res.status(401).json({ error: 'Non autorisé' })
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId)
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' })
    }

    // Ajouter l'ID de l'utilisateur à la requête
    req.userId = userId
    next()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}