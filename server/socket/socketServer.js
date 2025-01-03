// server/socket/socketServer.js

export default function setupSocketServer(io) {
  // Using a Map to store active sessions and their participants
  const activeSessions = new Map();

  io.on('connection', (socket) => {
    let currentSessionId = null;
    
    console.log('New client connected:', socket.id);

    // Handle joining a session
    socket.on('join_session', async (sessionId, userData, callback) => {
      try {
        console.log('joining session...')
        // Join the room for this session
        socket.join(sessionId);
        
        // Get the number of participants in this room
        const room = io.sockets.adapter.rooms.get(sessionId);
        const participantCount = room ? room.size : 0;

        // Send success response back to the client
        callback({
          success: true,
          participantCount
        });

        // Broadcast to all clients in the session except the sender
        // socket.to(sessionId).emit('message', {
          socket.broadcast.emit('message', {
          type: 'PARTICIPANT_JOINED',
          participant: userData, // This will be set when joining
        });

        socket.broadcast.emit('PARTICIPANT_JOINED', )

      } catch (error) {
        console.error('Error in join_session:', error);
        callback({
          success: false,
          error: 'Failed to join session'
        });
      }
    });

    // Handle participant joined event
    socket.on('PARTICIPANT_JOINED', (participant) => {
      if (!currentSessionId) return;
      
      const roomName = `jam:${sessionId}`;
      // Broadcast to all clients in the room except the sender
      // socket.to(roomName).emit('message', {
      //   type: 'PARTICIPANT_JOINED',
      //   participant,
      //   timestamp: Date.now()
      // });
      socket.broadcast.emit('PARTICIPANT_JOINED', userData);
      
      console.log(`Participant joined event broadcasted in ${currentSessionId}`);
    });

    // Handle jam started event
    socket.on('JAM_STARTED', (data) => {
      if (!currentSessionId) return;
      
      const roomName = `jam:${currentSessionId}`;
      // Broadcast to all clients in the room including the sender
      io.in(roomName).emit('message', {
        type: 'JAM_STARTED',
        ...data,
        timestamp: Date.now()
      });
      
      console.log(`Jam started event broadcasted in ${currentSessionId}`);
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      if (currentSessionId) {
        await leaveSession(socket, currentSessionId);
      }
      console.log('Client disconnected:', socket.id);
    });
  });

  // Helper function to handle leaving a session
  async function leaveSession(socket, sessionId) {
    const roomName = `jam:${sessionId}`;
    
    // Remove socket from our tracking Map
    const sessionParticipants = activeSessions.get(sessionId);
    if (sessionParticipants) {
      sessionParticipants.delete(socket.id);
      
      // Clean up empty sessions
      if (sessionParticipants.size === 0) {
        activeSessions.delete(sessionId);
      }
    }

    // Notify other participants
    socket.to(roomName).emit('message', {
      type: 'PARTICIPANT_LEFT',
      participantId: socket.id,
      timestamp: Date.now()
    });

    // Leave the socket.io room
    await socket.leave(roomName);
    
    console.log(`Client ${socket.id} left session ${sessionId}`);
  }

  // Utility function to broadcast to all participants in a session
  function broadcastToJam(sessionId, eventData) {
    const roomName = `jam:${sessionId}`;
    io.to(roomName).emit('message', {
      ...eventData,
      timestamp: Date.now()
    });
  }

  return {
    broadcastToJam,
    getSessionParticipantCount: (sessionId) => 
      activeSessions.get(sessionId)?.size ?? 0
  };
}