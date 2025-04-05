const express = require('express')
const router = express.Router()
const notesController = require('../controllers/notesController')
const authMiddleware = require('../middlewares/auth')

// Protéger toutes les routes avec l'authentification
router.use(authMiddleware.authenticate)

// Routes pour les notes
router.route('/notes')
  .get(notesController.getAllNotes)
  .post(notesController.createNote)

router.route('/notes/:id')
  .get(notesController.getNote)
  .put(notesController.updateNote)
  .delete(notesController.deleteNote)

module.exports = router