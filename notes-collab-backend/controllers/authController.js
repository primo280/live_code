const User = require('../models/User')

// Authentification simplifiée (sans mot de passe)
exports.login = async (req, res) => {
  try {
    const { username } = req.body

    if (!username) {
      return res.status(400).json({ error: 'Le nom d\'utilisateur est requis' })
    }

    // Trouver ou créer l'utilisateur
    let user = await User.findOne({ username })

    if (!user) {
      user = await User.create({ username })
    }

    res.json({ 
      user: {
        id: user._id,
        username: user.username
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Récupérer l'utilisateur actuel (pour la persistance de session)
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId // Vérifier le middleware d'authentification
    
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    res.json({ 
      user: {
        id: user._id,
        username: user.username
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}