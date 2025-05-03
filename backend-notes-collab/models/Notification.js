import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true, // nom d'utilisateur ou ID
    },
  },
  {
    timestamps: true, // crée automatiquement `createdAt` et `updatedAt`
  }
);

// Si le modèle existe déjà, ne pas le redéclarer
export default mongoose.models.Notification ||
  mongoose.model('Notification', NotificationSchema);
