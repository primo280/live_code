const Note = require('../models/Note')

// Créer une nouvelle note
exports.createNote = async (req, res) => {
  try {
    const { title, content, tags } = req.body
    const createdBy = req.userId

    const note = await Note.create({
      title,
      content,
      tags,
      createdBy
    })

    res.status(201).json(note)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Récupérer toutes les notes de l'utilisateur
exports.getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find({ createdBy: req.userId })
      .sort({ updatedAt: -1 })
      .populate('createdBy', 'username')

    res.json(notes)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Récupérer une note spécifique
exports.getNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      createdBy: req.userId
    }).populate('createdBy', 'username')

    if (!note) {
      return res.status(404).json({ error: 'Note non trouvée' })
    }

    res.json(note)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Mettre à jour une note
exports.updateNote = async (req, res) => {
  try {
    const { title, content, tags } = req.body

    const note = await Note.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.userId
      },
      { title, content, tags, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('createdBy', 'username')

    if (!note) {
      return res.status(404).json({ error: 'Note non trouvée' })
    }

    res.json(note)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Supprimer une note
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.userId
    })

    if (!note) {
      return res.status(404).json({ error: 'Note non trouvée' })
    }

    res.json({ message: 'Note supprimée avec succès' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}