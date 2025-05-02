const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// Configuration CORS avancée
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000', // Autoriser uniquement ce domaine
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Méthodes autorisées
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept'
  ], // Headers autorisés
  credentials: true, // Autoriser les cookies et l'authentification
  optionsSuccessStatus: 200 // Pour les requêtes OPTIONS
};

// Créer l'application Express
const app = express();

// Middlewares
app.use(cors(corsOptions)); // Utiliser la configuration CORS
app.use(helmet()); // Sécurité HTTP
app.use(morgan('dev')); // Logging des requêtes
app.use(express.json()); // Parser le JSON

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout après 5s
  socketTimeoutMS: 45000 // Fermer les sockets après 45s d'inactivité
})
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => {
    console.error('Erreur de connexion à MongoDB:', err);
    process.exit(1); // Quitter l'application en cas d'échec
  });

// Routes
app.use('/api', require('./routes'));

// Route de santé
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Gestion spécifique des erreurs Mongoose
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      error: 'Erreur de validation',
      details: err.errors
    });
  }

  // Erreurs CORS
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  // Erreur générale
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;