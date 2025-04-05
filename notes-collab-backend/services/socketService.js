const socketio = require('socket.io')
const Note = require('../models/Note')

let io

// Suivre les utilisateurs actifs et leurs salles
const activeUsers = new Map() // { userId: { username, socketId, roomId } }

const init = (server) => {
  io = socketio(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    console.log('Nouvelle connexion Socket.io:', socket.id)

    // Authentification via le userId
    socket.on('authenticate', ({ userId, username }) => {
      if (!userId || !username) {
        socket.disconnect()
        return
      }

      // Stocker l'utilisateur connecté
      activeUsers.set(userId, { username, socketId: socket.id })

      // Mettre à jour tous les clients sur les utilisateurs actifs
      updateActiveUsers()
    })

    // Rejoindre une room (note spécifique)
    socket.on('join-note', ({ noteId, userId }) => {
      if (!noteId || !userId) return

      socket.join(noteId)
      
      // Mettre à jour la room de l'utilisateur
      if (activeUsers.has(userId)) {
        activeUsers.get(userId).roomId = noteId
      }

      updateActiveUsers(noteId)
    })

    // Quitter une room (note spécifique)
    socket.on('leave-note', ({ noteId, userId }) => {
      if (!noteId || !userId) return

      socket.leave(noteId)
      
      // Mettre à jour la room de l'utilisateur
      if (activeUsers.has(userId)) {
        activeUsers.get(userId).roomId = null
      }

      updateActiveUsers(noteId)
    })

    // Mise à jour du contenu d'une note en temps réel
    socket.on('update-note-content', async ({ noteId, content }) => {
      try {
        const note = await Note.findByIdAndUpdate(
          noteId,
          { content, updatedAt: Date.now() },
          { new: true }
        ).populate('createdBy', 'username')

        if (note) {
          // Diffuser la mise à jour à tous les clients dans la room sauf l'émetteur
          socket.to(noteId).emit('note-updated', note)
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour en temps réel:', error)
      }
    })

    // Position du curseur
    socket.on('cursor-position', ({ noteId, position }) => {
      const userId = getUserIdBySocket(socket.id)
      if (!userId) return

      // Envoyer la position aux autres utilisateurs dans la même note
      socket.to(noteId).emit('user-cursor-position', { userId, position })
    })

    // Déconnexion
    socket.on('disconnect', () => {
      const userId = getUserIdBySocket(socket.id)
      if (userId) {
        activeUsers.delete(userId)
        updateActiveUsers()
      }
      console.log('Déconnexion Socket.io:', socket.id)
    })
  })
}

// Mettre à jour la liste des utilisateurs actifs pour une room spécifique ou globale
const updateActiveUsers = (roomId = null) => {
  const usersArray = Array.from(activeUsers.entries()).map(([id, data]) => ({
    id,
    username: data.username
  }))

  if (roomId) {
    // Envoyer seulement aux clients dans cette room
    io.to(roomId).emit('active-users', usersArray.filter(user => {
      const userData = activeUsers.get(user.id)
      return userData && userData.roomId === roomId
    }))
  } else {
    // Envoyer à tous les clients
    io.emit('active-users', usersArray)
  }
}

// Trouver un userId par socket.id
const getUserIdBySocket = (socketId) => {
  for (const [userId, data] of activeUsers.entries()) {
    if (data.socketId === socketId) {
      return userId
    }
  }
  return null
}

module.exports = { init, io }