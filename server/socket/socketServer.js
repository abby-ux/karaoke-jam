// server/socket/socketServer.js
export default function setupSocketServer(io) {
  const connections = new Map();

  io.on('connection', (socket) => {
    const { sessionId } = socket.handshake.query;
    console.log('New client connected:', socket.id);

    if (sessionId) {
      socket.join(`jam:${sessionId}`);
      connections.set(socket.id, sessionId);
      console.log('Connected client ', socket.id, ' to jam ', sessionId);
    }

    socket.on('PARTICIPANT_JOINED', (participant) => {
      const sessionId = connections.get(socket.id);
      if (sessionId) {
        socket.to(`jam:${sessionId}`).emit('message', {
          type: 'PARTICIPANT_JOINED',
          participant
        });
      }
    });

    socket.on("join_room", (data) => {
      socket.join(data);
    });

    socket.on("send_message", (data) => {
      socket.to(data.room).emit("receive_message", data);
    });

    socket.on('JAM_STARTED', () => {
      const sessionId = connections.get(socket.id);
      if (sessionId) {
        socket.to(`jam:${sessionId}`).emit('message', {
          type: 'JAM_STARTED'
        });
      }
    });

    socket.on('disconnect', () => {
      const sessionId = connections.get(socket.id);
      if (sessionId) {
        socket.leave(`jam:${sessionId}`);
        connections.delete(socket.id);
        socket.to(`jam:${sessionId}`).emit('message', {
          type: 'PARTICIPANT_LEFT',
          participantId: socket.id
        });
      }
      console.log('Client disconnected:', socket.id);
    });
  });

  const broadcastToJam = (sessionId, eventData) => {
    io.to(`jam:${sessionId}`).emit('message', eventData);
  };

  return { broadcastToJam };
}