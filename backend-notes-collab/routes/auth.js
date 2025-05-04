const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Route de connexion simplifiée (sans mot de passe)
router.post('/login', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ message: 'Le nom d\'utilisateur est requis' });
    }
    
    // Rechercher l'utilisateur ou le créer s'il n'existe pas
    let user = await User.findOne({ username });
    
    if (!user) {
      user = new User({ username });
      await user.save();
    }
    
    // Générer un token JWT
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Vérifier si le token est valide
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Non autorisé' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.json({
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    res.status(401).json({ message: 'Token invalide' });
  }
});

module.exports = router;