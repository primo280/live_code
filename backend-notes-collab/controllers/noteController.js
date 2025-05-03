import Note from '../models/Note.js';
import Notification from '../models/Notification.js';

export const getNotes = async (req, res) => {
  const notes = await Note.find().sort({ updatedAt: -1 });
  res.json(notes);
};

export const getNote = async (req, res) => {
  const note = await Note.findById(req.params.id);
  res.json(note);
};


export const createNote = async (req, res) => {
  try {
    const newNote = await Note.create(req.body);

    await Notification.create({
      message: `Note "${newNote.title}" créée`,
      author: newNote.author, // ← Corrigé ici
      createdAt: new Date(),
    });

    res.status(201).json(newNote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la création de la note" });
  }
};


export const updateNote = async (req, res) => {
  try {
    const updated = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updated) {
      return res.status(404).json({ message: "Note non trouvée" });
    }

    // Vérifie si l'auteur existe dans la note mise à jour, sinon utilise l'auteur envoyé dans req.body
    const author = updated.author || req.body.author;

    if (!author) {
      return res.status(400).json({ message: "L'auteur est requis pour la notification" });
    }

    await Notification.create({
      message: `Note "${updated.title}" mise à jour`,
      author: author, // Utilise l'auteur de la note mise à jour ou celui passé dans req.body
      createdAt: new Date(),
    });

    res.json(updated);
  } catch (error) {
    console.error("Erreur de mise à jour : ", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de la note" });
  }
};







export const searchNotes = async (req, res) => {
  const { q } = req.query;

  try {
    const results = await Note.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } }
      ]
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la recherche de notes.' });
  }
};

