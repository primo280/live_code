// middleware/auth.js
const jwt = require('jsonwebtoken')
const User = require('../models/User')

module.exports = {
  authenticate: async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1]
      
      if (!token) {
        return res.status(401).json({ error: 'Accès non autorisé' })
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.userId)

      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' })
      }

      req.userId = user._id
      next()
    } catch (error) {
      console.error('Erreur d\'authentification:', error)
      res.status(401).json({ error: 'Session invalide' })
    }
  },

  generateToken: (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
  }
}