import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket;

export const useSocket = (noteId: string, onReceive: (data: any) => void) => {
  useEffect(() => {
    socket = io('http://localhost:4000');
    socket.emit('join', noteId);
    socket.on('update', onReceive);
    return () => {
      socket.disconnect();
    };
  }, [noteId]);

  const send = (data: any) => {
    socket.emit('update', data);
  };

  return { send };
};