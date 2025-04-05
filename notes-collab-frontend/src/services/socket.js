import { io } from 'socket.io-client'

let socket

export const useSocket = () => {
  if (!socket) {
    socket = io('http://localhost:3001', {
      autoConnect: false,
      withCredentials: true,
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

  return { socket, connect, disconnect }
}