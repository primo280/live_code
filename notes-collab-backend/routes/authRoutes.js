const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

// Login avec nom d'utilisateur
router.post('/login', authController.login)

// Récupérer l'utilisateur actuel
router.get('/me', authController.getCurrentUser)

module.exports = router