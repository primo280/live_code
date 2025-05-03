import express from 'express';
import { getNotes, getNote, createNote, updateNote,searchNotes, } from '../controllers/noteController.js';
import mongoose from 'mongoose';
import Note from '../models/Note.js';

const router = express.Router();



router.get('/search', searchNotes);
router.get('/', getNotes);
router.get('/:id', getNote);
router.post('/', createNote);
router.put('/:id', updateNote);

// Route DELETE /notes/:id
router.delete('/:id', async (req, res) => {
  try {
    const deletedNote = await Note.findByIdAndDelete(req.params.id);
    if (!deletedNote) {
      return res.status(404).json({ error: 'Note non trouvée' });
    }
    res.json({ message: 'Note supprimée' });
  } catch (error) {
    console.error('Erreur suppression note:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// GET /notes/search?q=motcle
router.get('/search', async (req, res) => {
  const { q } = req.query;
  try {
    const notes = await Note.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } }
      ]
    });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la recherche', error: err });
  }
});

// GET /notes?sort=createdAt|updatedAt
router.get('/', async (req, res) => {
  const sort = req.query.sort === 'updatedAt' ? 'updatedAt' : 'createdAt';
  try {
    const notes = await Note.find().sort({ [sort]: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Erreur de tri', error: err });
  }
});


export default router;