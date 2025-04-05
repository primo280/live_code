const http = require('http')
const app = require('./app')
const socketService = require('./services/socketService')

// Créer le serveur HTTP
const server = http.createServer(app)

// Configurer Socket.io
socketService.init(server)

// Démarrer le serveur
const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`)
})