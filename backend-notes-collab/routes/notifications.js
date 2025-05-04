const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Middleware d'authentification pour toutes les routes
router.use(auth);

// Récupérer toutes les notifications de l'utilisateur
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user.id
    }).sort({ createdAt: -1 });
    
    res.json(notifications);
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Marquer une notification comme lue
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }
    
    notification.read = true;
    await notification.save();
    
    res.json(notification);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Marquer toutes les notifications comme lues
router.put('/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { $set: { read: true } }
    );
    
    res.json({ message: 'Toutes les notifications ont été marquées comme lues' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des notifications:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer une notification
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }
    
    await notification.deleteOne();
    res.json({ message: 'Notification supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;