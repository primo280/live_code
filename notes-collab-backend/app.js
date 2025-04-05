const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const dotenv = require('dotenv')

// Charger les variables d'environnement
dotenv.config()

// Importer les routes
const routes = require('./routes')

// Créer l'application Express
const app = express()

// Middlewares
app.use(cors())
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur de connexion à MongoDB:', err))

// Routes
app.use('/api', routes)

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Quelque chose a mal tourné!' })
})

module.exports = app