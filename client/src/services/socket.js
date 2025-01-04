// client/src/services/socket.js
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: false // We'll connect manually when needed
});

// Add event listeners for connection status
socket.on('connect', () => {
  console.log('Connected to WebSocket server....');
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected from WebSocket server:', reason);
});

// Helper function to join a specific jam room
const joinJamRoom = (sessionId) => {
  if (socket.connected) {
    socket.emit('joinJamRoom', sessionId);
  } else {
    socket.connect();
    socket.once('connect', () => {
      socket.emit('joinJamRoom', sessionId);
    });
  }
};

export { socket, joinJamRoom };