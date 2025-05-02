const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const auth = require('../middlewares/auth')
// Login avec nom d'utilisateur
router.post('/login', authController.login)

// Récupérer l'utilisateur actuel
router.get('/me', auth.authenticate, authController.getCurrentUser)

module.exports = router