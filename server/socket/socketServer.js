// server/socket/socketServer.js
export default function setupSocketServer(io) {
    // Store active connections
    const connections = new Map();
  
    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);
  
      // Handle joining a jam session
      socket.on('join_jam', ({ sessionId }) => {
        // Join the room for this session
        socket.join(`jam:${sessionId}`);
        connections.set(socket.id, sessionId);
        
        console.log(`Client ${socket.id} joined jam session ${sessionId}`);
      });

      // handle a player joining (adding their name)\
      socket.on('add_player', (data) => {
        const roomId = `waiting-room:${data.jam}`;
        // Create a proper participant object
        const newParticipant = {
          participantId: socket.id,
          name: data.playerName,
          joinedAt: new Date().toISOString()
        };
        // Emit to all clients in the room except sender
        socket.to(roomId).emit("player_joined", newParticipant);
        // Also emit to sender to update their view
        socket.emit("player_joined", newParticipant);
      });
  
      // Handle leaving a jam session
      socket.on('leaveJamSession', ({ sessionId }) => {
        socket.leave(`jam:${sessionId}`);
        connections.delete(socket.id);
        
        console.log(`Client ${socket.id} left jam session ${sessionId}`);
      });
  
      // Handle disconnection
      socket.on('disconnect', () => {
        const sessionId = connections.get(socket.id);
        if (sessionId) {
          socket.leave(`jam:${sessionId}`);
          connections.delete(socket.id);
        }
        console.log('Client disconnected:', socket.id);
      });
    });
  
    // Utility function to broadcast updates to a jam session
    const broadcastToJam = (sessionId, eventName, data) => {
      io.to(`jam:${sessionId}`).emit(eventName, data);
    };
  
    return {
      broadcastToJam,
    };
  }