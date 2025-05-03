import express from 'express';
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
const router = express.Router();

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const latestNotif = await Notification.findOne().sort({ createdAt: -1 });
    if (!latestNotif) return res.status(404).json({ message: 'Aucune notification' });

    res.json({
      id: latestNotif._id,
      message: latestNotif.message,
      author: latestNotif.author,
      createdAt: latestNotif.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
