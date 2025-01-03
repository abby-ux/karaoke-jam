// src/services/socket.js
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    if (this.socket) return;

    // Initialize socket with reconnection options
    this.socket = io('http://localhost:3000', {
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    // Set up event handlers
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    return this.socket;
  }

  // Join a specific jam session room
  joinJamSession(sessionId) {
    if (!this.socket) this.connect();
    this.socket.emit('joinJamSession', { sessionId });
  }

  // Leave a jam session room
  leaveJamSession(sessionId) {
    if (this.socket) {
      this.socket.emit('leaveJamSession', { sessionId });
    }
  }

  // Subscribe to participant updates
  onParticipantJoined(callback) {
    if (!this.socket) this.connect();
    this.socket.on('participantJoined', callback);
  }

  // Subscribe to jam status updates
  onJamStatusUpdate(callback) {
    if (!this.socket) this.connect();
    this.socket.on('jamStatusUpdate', callback);
  }

  // Clean up socket connection
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// Create and export a singleton instance
const socketService = new SocketService();
export default socketService;