// src/hooks/useWebSocket.js
import { useState, useEffect } from 'react';
import socketService from '../services/socket';

export function useWebSocket(sessionId) {
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      return;
    }

    // Initialize socket connection
    const socket = socketService.connect();

    // Set up connection status listeners
    socket.on('connect', () => {
      setConnectionStatus('connected');
      setError(null);
      // Join the specific jam session room
      socketService.joinJamSession(sessionId);
    });

    socket.on('connect_error', (err) => {
      setConnectionStatus('error');
      setError(`Connection error: ${err.message}`);
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    // Cleanup on unmount
    return () => {
      socketService.leaveJamSession(sessionId);
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
    };
  }, [sessionId]);

  return { connectionStatus, error };
}