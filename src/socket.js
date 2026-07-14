import { io } from 'socket.io-client';

export const socket = io('https://boin-server-production.up.railway.app', {
  transports: ['websocket'],
});