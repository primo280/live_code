const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const NoteHistory = require('../models/NoteHistory');
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Middleware d'authentification pour toutes les routes
router.use(auth);

// Récupérer toutes les notes de l'utilisateur
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find({
      $or: [
        { createdBy: req.user.id },
        { collaborators: req.user.id }
      ]
    }).sort({ updatedAt: -1 });
    
    res.json(notes);
  } catch (error) {
    console.error('Erreur lors de la récupération des notes:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer une note spécifique
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      $or: [
        { createdBy: req.user.id },
        { collaborators: req.user.id },
        { 'sharedWith.userId': req.user.id } // Vérifier si l'utilisateur est dans le tableau 'sharedWith'
      ]
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Note non trouvée' });
    }
    
    res.json(note);
  } catch (error) {
    console.error('Erreur lors de la récupération de la note:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


// Créer une nouvelle note
router.post('/', async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Le titre est requis' });
    }
    
    const newNote = new Note({
      title,
      content: content || '',
      tags: tags || [],
      createdBy: req.user.id
    });
    
    const savedNote = await newNote.save();
    
    // Créer une entrée dans l'historique
    const user = await User.findById(req.user.id);
    const historyEntry = new NoteHistory({
      noteId: savedNote._id,
      userId: req.user.id,
      username: user.username,
      title: savedNote.title,
      content: savedNote.content,
      tags: savedNote.tags,
      action: 'created'
    });
    
    await historyEntry.save();
    
    res.status(201).json(savedNote);
  } catch (error) {
    console.error('Erreur lors de la création de la note:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mettre à jour une note
router.put('/:id', async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Le titre est requis' });
    }
    
    const note = await Note.findOne({
      _id: req.params.id,
      $or: [
        { createdBy: req.user.id },
        { collaborators: req.user.id }
      ]
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Note non trouvée' });
    }
    
    // Sauvegarder les anciennes valeurs pour comparer
    const oldTitle = note.title;
    
    note.title = title;
    note.content = content || '';
    note.tags = tags || [];
    
    const updatedNote = await note.save();
    
    // Créer une entrée dans l'historique
    const user = await User.findById(req.user.id);
    const historyEntry = new NoteHistory({
      noteId: updatedNote._id,
      userId: req.user.id,
      username: user.username,
      title: updatedNote.title,
      content: updatedNote.content,
      tags: updatedNote.tags,
      action: 'updated'
    });
    
    await historyEntry.save();
    
    // Créer des notifications pour les collaborateurs et le propriétaire
    // si l'utilisateur actuel n'est pas le propriétaire
    if (note.createdBy.toString() !== req.user.id) {
      // Notification pour le propriétaire
      const notification = new Notification({
        userId: note.createdBy,
        noteId: note._id,
        noteTitle: note.title,
        message: `${user.username} a modifié votre note "${oldTitle}"`
      });
      
      await notification.save();
      
      // Émettre la notification via Socket.io
      req.app.get('io').to(note.createdBy.toString()).emit('notification', notification);
    }
    
    // Notifications pour les collaborateurs (sauf l'utilisateur actuel)
    for (const collaboratorId of note.collaborators) {
      if (collaboratorId.toString() !== req.user.id) {
        const notification = new Notification({
          userId: collaboratorId,
          noteId: note._id,
          noteTitle: note.title,
          message: `${user.username} a modifié la note "${oldTitle}"`
        });
        
        await notification.save();
        
        // Émettre la notification via Socket.io
        req.app.get('io').to(collaboratorId.toString()).emit('notification', notification);
      }
    }
    
    res.json(updatedNote);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la note:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer une note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Note non trouvée ou vous n\'êtes pas autorisé à la supprimer' });
    }
    
    // Récupérer le titre avant suppression pour les notifications
    const noteTitle = note.title;
    
    // Supprimer la note
    await note.deleteOne();
    
    // Supprimer l'historique associé
    await NoteHistory.deleteMany({ noteId: note._id });
    
    // Créer des notifications pour les collaborateurs
    const user = await User.findById(req.user.id);
    
    for (const collaboratorId of note.collaborators) {
      const notification = new Notification({
        userId: collaboratorId,
        noteId: note._id,
        noteTitle: noteTitle,
        message: `${user.username} a supprimé la note "${noteTitle}"`
      });
      
      await notification.save();
      
      // Émettre la notification via Socket.io
      req.app.get('io').to(collaboratorId.toString()).emit('notification', notification);
    }
    
    res.json({ message: 'Note supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la note:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer l'historique d'une note
router.get('/:id/history', async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      $or: [
        { createdBy: req.user.id },
        { collaborators: req.user.id }
      ]
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Note non trouvée' });
    }
    
    const history = await NoteHistory.find({
      noteId: note._id
    }).sort({ createdAt: -1 });
    
    res.json(history);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Restaurer une version précédente d'une note
router.post('/:id/restore/:historyId', async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      $or: [
        { createdBy: req.user.id },
        { collaborators: req.user.id }
      ]
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Note non trouvée' });
    }
    
    const historyEntry = await NoteHistory.findOne({
      _id: req.params.historyId,
      noteId: note._id
    });
    
    if (!historyEntry) {
      return res.status(404).json({ message: 'Version d\'historique non trouvée' });
    }
    
    // Mettre à jour la note avec les données de l'historique
    note.title = historyEntry.title;
    note.content = historyEntry.content;
    note.tags = historyEntry.tags;
    
    const updatedNote = await note.save();
    
    // Créer une nouvelle entrée dans l'historique pour la restauration
    const user = await User.findById(req.user.id);
    const newHistoryEntry = new NoteHistory({
      noteId: updatedNote._id,
      userId: req.user.id,
      username: user.username,
      title: updatedNote.title,
      content: updatedNote.content,
      tags: updatedNote.tags,
      action: 'restored'
    });
    
    await newHistoryEntry.save();
    
    // Créer des notifications pour les collaborateurs et le propriétaire
    // si l'utilisateur actuel n'est pas le propriétaire
    if (note.createdBy.toString() !== req.user.id) {
      // Notification pour le propriétaire
      const notification = new Notification({
        userId: note.createdBy,
        noteId: note._id,
        noteTitle: note.title,
        message: `${user.username} a restauré une version précédente de votre note "${note.title}"`
      });
      
      await notification.save();
      
      // Émettre la notification via Socket.io
      req.app.get('io').to(note.createdBy.toString()).emit('notification', notification);
    }
    
    // Notifications pour les collaborateurs (sauf l'utilisateur actuel)
    for (const collaboratorId of note.collaborators) {
      if (collaboratorId.toString() !== req.user.id) {
        const notification = new Notification({
          userId: collaboratorId,
          noteId: note._id,
          noteTitle: note.title,
          message: `${user.username} a restauré une version précédente de la note "${note.title}"`
        });
        
        await notification.save();
        
        // Émettre la notification via Socket.io
        req.app.get('io').to(collaboratorId.toString()).emit('notification', notification);
      }
    }
    
    res.json(updatedNote);
  } catch (error) {
    console.error('Erreur lors de la restauration de la note:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Ajouter un collaborateur à une note
router.post('/:id/collaborators', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ message: 'Le nom d\'utilisateur est requis' });
    }
    
    const note = await Note.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Note non trouvée ou vous n\'êtes pas autorisé à la modifier' });
    }
    
    const collaborator = await User.findOne({ username });
    
    if (!collaborator) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier si l'utilisateur est déjà un collaborateur
    if (note.collaborators.includes(collaborator._id)) {
      return res.status(400).json({ message: 'Cet utilisateur est déjà un collaborateur' });
    }
    
    note.collaborators.push(collaborator._id);
    await note.save();
    
    // Créer une notification pour le nouveau collaborateur
    const user = await User.findById(req.user.id);
    const notification = new Notification({
      userId: collaborator._id,
      noteId: note._id,
      noteTitle: note.title,
      message: `${user.username} vous a ajouté comme collaborateur sur la note "${note.title}"`
    });
    
    await notification.save();
    
    // Émettre la notification via Socket.io
    req.app.get('io').to(collaborator._id.toString()).emit('notification', notification);
    
    res.json(note);
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'un collaborateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un collaborateur d'une note
router.delete('/:id/collaborators/:userId', async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Note non trouvée ou vous n\'êtes pas autorisé à la modifier' });
    }
    
    note.collaborators = note.collaborators.filter(
      collaborator => collaborator.toString() !== req.params.userId
    );
    
    await note.save();
    
    // Créer une notification pour l'ancien collaborateur
    const user = await User.findById(req.user.id);
    const collaborator = await User.findById(req.params.userId);
    
    if (collaborator) {
      const notification = new Notification({
        userId: collaborator._id,
        noteId: note._id,
        noteTitle: note.title,
        message: `${user.username} vous a retiré comme collaborateur de la note "${note.title}"`
      });
      
      await notification.save();
      
      // Émettre la notification via Socket.io
      req.app.get('io').to(collaborator._id.toString()).emit('notification', notification);
    }
    
    res.json(note);
  } catch (error) {
    console.error('Erreur lors de la suppression d\'un collaborateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


// Routes pour le partage de notes (à ajouter à votre fichier routes/notes.js existant)

// Obtenir les utilisateurs avec qui une note est partagée
router.get("/:id/shared", auth, async (req, res) => {
  try {
    const noteId = req.params.id

    // Vérifier si la note existe et si l'utilisateur a le droit d'y accéder
    const note = await Note.findById(noteId)
    if (!note) {
      return res.status(404).json({ message: "Note non trouvée" })
    }

    // Vérifier si l'utilisateur est le propriétaire ou a accès à la note
    if (
      note.createdBy.toString() !== req.user.id &&
      !note.sharedWith.some((share) => share.userId.toString() === req.user.id)
    ) {
      return res.status(403).json({ message: "Accès non autorisé" })
    }

    // Récupérer les informations des utilisateurs avec qui la note est partagée
    const sharedUsers = await Promise.all(
      note.sharedWith.map(async (share) => {
        const user = await User.findById(share.userId)
        return {
          _id: user._id,
          username: user.username,
          permission: share.permission,
        }
      }),
    )

    res.json(sharedUsers)
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs partagés:", error)
    res.status(500).json({ message: "Erreur serveur" })
  }
})

// Partager une note avec un utilisateur
router.post("/:id/share", auth, async (req, res) => {
  try {
    const { userId, permission } = req.body;
    const noteId = req.params.id;

    // Vérifier si la note existe
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note non trouvée" });
    }

    // Vérifier si l'utilisateur est le propriétaire de la note
    if (note.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Seul le propriétaire peut partager cette note" });
    }

    // Vérifier si l'utilisateur avec qui partager existe
    const userToShare = await User.findById(userId);
    if (!userToShare) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier si la note est déjà partagée avec cet utilisateur
    const alreadyShared = note.sharedWith.find((share) => share.userId.toString() === userId);
    if (alreadyShared) {
      return res.status(400).json({ message: "Note déjà partagée avec cet utilisateur" });
    }

    // Ajouter l'utilisateur à la liste des utilisateurs avec qui la note est partagée
    note.sharedWith.push({
      userId,
      permission: permission || "read", // Par défaut, donner l'accès en lecture
    });

    await note.save();

    // Créer une notification pour l'utilisateur avec qui la note est partagée
    const notification = new Notification({
      userId,
      noteId: note._id,
      noteTitle: note.title,
      message: `${req.user.username} a partagé une note avec vous: "${note.title}"`,
      sent: false,  // Ajouter un champ pour savoir si la notification a été envoyée
    });

    await notification.save();

    // Récupérer l'instance de WebSocket (io) et la liste des utilisateurs connectés
    const io = req.app.get("io");
    const connectedUsers = req.app.get("connectedUsers");  // Utiliser 'connectedUsers' directement

    // Vérifier si l'utilisateur est connecté
    const socketId = connectedUsers && connectedUsers.get(userId); // Vérifier si connectedUsers existe

    // Si l'utilisateur est connecté, émettre la notification via WebSocket
    if (socketId) {
      io.to(socketId).emit("notification", notification);
      notification.sent = true; // Marquer la notification comme envoyée
      await notification.save(); // Sauvegarder cette information dans la base de données
    }

    res.status(201).json({ message: "Note partagée avec succès" });
  } catch (error) {
    console.error("Erreur lors du partage de la note:", error);
    res.status(500).json({ message: "Erreur serveur lors du partage" });
  }
});


// Gérer la reconnexion d'un utilisateur pour envoyer les notifications non envoyées
const handleUserReconnection = (userId) => {
  const io = req.app.get("io");

  // Récupérer les notifications non envoyées pour cet utilisateur
  Notification.find({ userId, sent: false })
    .then(notifications => {
      notifications.forEach(async (notification) => {
        // Émettre la notification via WebSocket
        const socketId = req.app.get("connectedUsers").get(userId);
        if (socketId) {
          io.to(socketId).emit("notification", notification);
          notification.sent = true; // Marquer la notification comme envoyée
          await notification.save(); // Sauvegarder cette information dans la base de données
        }
      });
    })
    .catch(err => console.error("Erreur lors de la récupération des notifications:", err));
};


// Mettre à jour les permissions d'un utilisateur
router.put("/:id/share/:userId", auth, async (req, res) => {
  try {
    const { permission } = req.body
    const { id: noteId, userId } = req.params

    // Vérifier si la note existe
    const note = await Note.findById(noteId)
    if (!note) {
      return res.status(404).json({ message: "Note non trouvée" })
    }

    // Vérifier si l'utilisateur est le propriétaire de la note
    if (note.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Seul le propriétaire peut modifier les permissions" })
    }

    // Trouver l'utilisateur dans la liste des utilisateurs avec qui la note est partagée
    const shareIndex = note.sharedWith.findIndex((share) => share.userId.toString() === userId)
    if (shareIndex === -1) {
      return res.status(404).json({ message: "Utilisateur non trouvé dans la liste de partage" })
    }

    // Mettre à jour les permissions
    note.sharedWith[shareIndex].permission = permission

    await note.save()

    res.json({ message: "Permissions mises à jour avec succès" })
  } catch (error) {
    console.error("Erreur lors de la mise à jour des permissions:", error)
    res.status(500).json({ message: "Erreur serveur" })
  }
})

// Supprimer un partage
router.delete("/:id/share/:userId", auth, async (req, res) => {
  try {
    const { id: noteId, userId } = req.params

    // Vérifier si la note existe
    const note = await Note.findById(noteId)
    if (!note) {
      return res.status(404).json({ message: "Note non trouvée" })
    }

    // Vérifier si l'utilisateur est le propriétaire de la note
    if (note.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Seul le propriétaire peut supprimer un partage" })
    }

    // Supprimer l'utilisateur de la liste des utilisateurs avec qui la note est partagée
    note.sharedWith = note.sharedWith.filter((share) => share.userId.toString() !== userId)

    await note.save()

    res.json({ message: "Partage supprimé avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression du partage:", error)
    res.status(500).json({ message: "Erreur serveur" })
  }
})

module.exports = router;