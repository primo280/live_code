const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');
const notificationRoutes = require('./routes/notifications');
const usersRoutes = require("./routes/user")

// Charger les variables d'environnement
dotenv.config();

// Initialiser l'application Express
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Configuration de Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Rendre io accessible dans les routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use("/api/users", usersRoutes)

// Middleware d'authentification pour Socket.io
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.username = decoded.username;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Map pour stocker les utilisateurs actifs par note
const activeUsers = new Map();

// Générer une couleur aléatoire pour chaque utilisateur
const getRandomColor = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA5A5', '#A5FFD6',
    '#FFC145', '#FF6B8B', '#845EC2', '#D65DB1', '#FF9671'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Gestion des connexions Socket.io
io.on('connection', (socket) => {
  console.log(`Utilisateur connecté: ${socket.userId}`);
  
  // Attribuer une couleur à l'utilisateur
  const userColor = getRandomColor();
  
  // Rejoindre une salle personnelle pour les notifications
  socket.join(socket.userId);
  
  // Rejoindre une note
  socket.on('join-note', (noteId) => {
    socket.join(noteId);
    
    // Ajouter l'utilisateur à la liste des utilisateurs actifs pour cette note
    if (!activeUsers.has(noteId)) {
      activeUsers.set(noteId, new Map());
    }
    
    activeUsers.get(noteId).set(socket.userId, {
      id: socket.userId,
      username: socket.username,
      color: userColor
    });
    
    // Émettre la liste des utilisateurs actifs à tous les clients dans la salle
    io.to(noteId).emit('active-users', Array.from(activeUsers.get(noteId).values()));
    
    console.log(`${socket.username} a rejoint la note ${noteId}`);
  });
  
  // Quitter une note
  socket.on('leave-note', (noteId) => {
    socket.leave(noteId);
    
    // Supprimer l'utilisateur de la liste des utilisateurs actifs pour cette note
    if (activeUsers.has(noteId)) {
      activeUsers.get(noteId).delete(socket.userId);
      
      // Si la note n'a plus d'utilisateurs actifs, supprimer la note de la map
      if (activeUsers.get(noteId).size === 0) {
        activeUsers.delete(noteId);
      } else {
        // Émettre la liste mise à jour des utilisateurs actifs
        io.to(noteId).emit('active-users', Array.from(activeUsers.get(noteId).values()));
      }
    }
    
    console.log(`${socket.username} a quitté la note ${noteId}`);
  });
  
  // Mise à jour du contenu
  socket.on('update-content', ({ noteId, content }) => {
    // Émettre la mise à jour à tous les autres clients dans la salle
    socket.to(noteId).emit('content-update', content);
  });
  
  // Mise à jour du titre
  socket.on('update-title', ({ noteId, title }) => {
    // Émettre la mise à jour à tous les autres clients dans la salle
    socket.to(noteId).emit('title-update', title);
  });
  
  // Mouvement du curseur
  socket.on('cursor-move', ({ noteId, cursor }) => {
    if (activeUsers.has(noteId) && activeUsers.get(noteId).has(socket.userId)) {
      const user = activeUsers.get(noteId).get(socket.userId);
      user.cursor = cursor;
      
      // Émettre la position du curseur à tous les autres clients dans la salle
      socket.to(noteId).emit('cursor-move', user);
    }
  });
  
  // Déconnexion
  socket.on('disconnect', () => {
    console.log(`Utilisateur déconnecté: ${socket.userId}`);
    
    // Supprimer l'utilisateur de toutes les notes actives
    activeUsers.forEach((users, noteId) => {
      if (users.has(socket.userId)) {
        users.delete(socket.userId);
        
        // Si la note n'a plus d'utilisateurs actifs, supprimer la note de la map
        if (users.size === 0) {
          activeUsers.delete(noteId);
        } else {
          // Émettre la liste mise à jour des utilisateurs actifs
          io.to(noteId).emit('active-users', Array.from(users.values()));
        }
      }
    });
  });
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});