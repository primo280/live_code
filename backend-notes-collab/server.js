import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import { Server as SocketServer } from 'socket.io'; // Utilisation de la syntaxe d'import ES pour Socket.io
import noteRoutes from './routes/noteRoutes.js';
import notificationsRoutes from './routes/notificationsRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

import { swaggerUi, specs } from './swagger.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
// Swagger route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/notes', noteRoutes);
app.use('/notifications', notificationsRoutes);

// Crée une instance de Socket.io
const io = new SocketServer(server); // Utilisation du constructeur directement

// Objet pour stocker les positions des utilisateurs
let users = {}; 

// Middleware pour gérer CORS si nécessaire (par exemple, si le frontend est sur un port différent)
const corsOptions = {
  origin: process.env.FRONTEND_URL , // Remplace avec l'URL de ton frontend
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions)); // Ajouter le middleware CORS

// Lorsqu'une connexion Socket est établie
io.on('connection', (socket) => {
  console.log('Un utilisateur est connecté:', socket.id);

  // Envoie des positions actuelles des curseurs à l'utilisateur qui vient de se connecter
  socket.emit('updateCursors', users);

  // Écoute les déplacements de curseurs des utilisateurs
  socket.on('cursorMove', (data) => {
    // Met à jour la position du curseur de cet utilisateur
    users[socket.id] = data;
    // Émet l'update des curseurs à tous les utilisateurs connectés
    io.emit('updateCursors', users);
  });

  // Gère la déconnexion de l'utilisateur
  socket.on('disconnect', () => {
    console.log('Utilisateur déconnecté:', socket.id);
    // Supprime l'utilisateur de l'objet users à la déconnexion
    delete users[socket.id];
    // Informe tous les utilisateurs des changements
    io.emit('updateCursors', users);
  });
  socket.on('noteEdit', (data) => {
    socket.broadcast.emit('noteUpdated', data); // ✅ maintenant socket est défini ici
  });

});


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(process.env.PORT , () => {
      const PORT=process.env.PORT;
      console.log(`Serveur lancé sur le port ${PORT}`);

    });
  })
  .catch((err) => console.error(err));
