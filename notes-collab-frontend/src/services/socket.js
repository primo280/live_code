import { io } from 'socket.io-client'

let socket

export const useSocket = () => {
  if (!socket) {
    socket = io({
      autoConnect: false,
      path: '/socket.io'
    })
  }

  const connect = (userId) => {
    if (!socket.connected) {
      socket.auth = { userId }
      socket.connect()
    }
  }

  const disconnect = () => {
    if (socket.connected) {
      socket.disconnect()
    }
  }

  const subscribe = (event, callback) => {
    socket.on(event, callback)
    return () => socket.off(event, callback)
  }

  const emit = (event, data) => {
    socket.emit(event, data)
  }

  return { 
    socket, 
    connect, 
    disconnect,
    subscribe,
    emit
  }
}