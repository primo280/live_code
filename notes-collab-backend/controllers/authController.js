const User = require('../models/User')

exports.login = async (req, res) => {
  try {
    const { username } = req.body

    if (!username || username.trim() === '') {
      return res.status(400).json({ 
        success: false,
        error: 'Un nom d\'utilisateur valide est requis' 
      })
    }

    // Normaliser le username (minuscules, pas d'espaces superflus)
    const normalizedUsername = username.trim().toLowerCase()

    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ username: normalizedUsername })

    if (!user) {
      // Créer un nouvel utilisateur s'il n'existe pas
      user = await User.create({ 
        username: normalizedUsername,
        createdAt: new Date()
      })
      
      return res.status(201).json({
        success: true,
        message: 'Nouvel utilisateur créé et connecté',
        user: {
          id: user._id,
          username: user.username
        }
      })
    }

    // Si l'utilisateur existe déjà, le connecter
    res.json({
      success: true,
      message: 'Connexion réussie',
      user: {
        id: user._id,
        username: user.username
      }
    })

  } catch (error) {
    console.error('Erreur d\'authentification:', error)
    res.status(500).json({ 
      success: false,
      error: 'Erreur du serveur lors de l\'authentification' 
    })
  }
}

exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId
    
    const user = await User.findById(userId).select('-__v')
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'Utilisateur non trouvé' 
      })
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    console.error('Erreur de récupération:', error)
    res.status(500).json({ 
      success: false,
      error: 'Erreur du serveur' 
    })
  }
}