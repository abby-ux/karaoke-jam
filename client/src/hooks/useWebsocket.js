<<<<<<< HEAD
// // src/hooks/useWebSocket.js
// import { useState, useEffect } from 'react';
// import socketService from '../services/socket';

// export function useWebSocket(sessionId) {
//   const [connectionStatus, setConnectionStatus] = useState('connecting');
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (!sessionId) {
//       setError('No session ID provided');
//       return;
//     }

//     // Initialize socket connection
//     const socket = socketService.connect();

//     // Set up connection status listeners
//     socket.on('connect', () => {
//       setConnectionStatus('connected');
//       setError(null);
//       // Join the specific jam session room
//       socketService.joinJamSession(sessionId);
//     });

//     socket.on('connect_error', (err) => {
//       setConnectionStatus('error');
//       setError(`Connection error: ${err.message}`);
//     });

//     socket.on('disconnect', () => {
//       setConnectionStatus('disconnected');
//     });

//     // Cleanup on unmount
//     return () => {
//       socketService.leaveJamSession(sessionId);
//       socket.off('connect');
//       socket.off('connect_error');
//       socket.off('disconnect');
//     };
//   }, [sessionId]);

//   return { connectionStatus, error };
// }
=======
// // client/src/services/socket.js
// import { io } from 'socket.io-client';

// const SOCKET_URL = 'http://localhost:3000';

// const socket = io(SOCKET_URL, {
//   withCredentials: true,
//   transports: ['websocket', 'polling'],
//   reconnection: true,
//   reconnectionAttempts: 5,
//   reconnectionDelay: 1000,
//   autoConnect: false // We'll connect manually when needed
// });

// // Add event listeners for connection status
// socket.on('connect', () => {
//   console.log('Connected to WebSocket server....');
// });

// socket.on('connect_error', (error) => {
//   console.error('Socket connection error:', error);
// });

// socket.on('disconnect', (reason) => {
//   console.log('Disconnected from WebSocket server:', reason);
// });

// // Helper function to join a specific jam room
// const joinJamRoom = (sessionId) => {
//   if (socket.connected) {
//     socket.emit('joinJamRoom', sessionId);
//   } else {
//     socket.connect();
//     socket.once('connect', () => {
//       socket.emit('joinJamRoom', sessionId);
//     });
//   }
// };

// export { socket, joinJamRoom };
>>>>>>> 449d35cc2c8ef0b705446b436ca41335e2f970b7
