export default function setupSocketServer(io) {
    const activeSessions = new Map();
  
    io.on('connection', (socket) => {
      const { sessionId } = socket.handshake.query;
      let currentSessionId = null;
  
      if (sessionId) {
        socket.join(sessionId);
        console.log(`Socket ${socket.id} joined session ${sessionId}`);
        
        if (!activeSessions.has(sessionId)) {
          activeSessions.set(sessionId, new Set());
        }
        activeSessions.get(sessionId).add(socket.id);
        currentSessionId = sessionId;
      }
  
      socket.on('PARTICIPANT_JOINED', (participant) => {
        if (currentSessionId) {
          socket.to(currentSessionId).emit('message', {
            type: 'PARTICIPANT_JOINED',
            participant
          });
        }
      });
  
      socket.on('JAM_STARTED', () => {
        if (currentSessionId) {
          socket.to(currentSessionId).emit('message', {
            type: 'JAM_STARTED'
          });
        }
      });
  
      socket.on('disconnect', () => {
        if (currentSessionId) {
          const sessionParticipants = activeSessions.get(currentSessionId);
          if (sessionParticipants) {
            sessionParticipants.delete(socket.id);
            if (sessionParticipants.size === 0) {
              activeSessions.delete(currentSessionId);
            }
            socket.to(currentSessionId).emit('message', {
              type: 'PARTICIPANT_LEFT',
              participantId: socket.id
            });
          }
        }
        console.log('User disconnected:', socket.id);
      });
    });
  
    function broadcastToJam(sessionId, eventData) {
      io.to(sessionId).emit('message', eventData);
    }
  
    return { broadcastToJam };
  }