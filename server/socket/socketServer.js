// // server/socket/socketServer.js

// export default function setupSocketServer(io) {
//   // Store active sessions and their participants
//   // Map structure: sessionId -> Map<socketId, participantData>
//   const activeSessions = new Map();

//   io.on('connection', (socket) => {
//     // Track current session info for this socket
//     let currentSessionId = null;
//     let currentUserData = null;
    
//     console.log('New client connected:', socket.id);

//     // Handle initial connection data from query parameters
//     const { sessionId, userData } = socket.handshake.query;
//     if (sessionId && userData) {
//       try {
//         currentUserData = JSON.parse(userData);
//         currentSessionId = sessionId;
//         console.log('Connection data:', { currentUserData, currentSessionId });
        
//         // Create new session entry if it doesn't exist
//         if (!activeSessions.has(sessionId)) {
//           activeSessions.set(sessionId, new Map());
//         }
        
//         // Add participant to session
//         activeSessions.get(sessionId).set(socket.id, currentUserData);
//       } catch (error) {
//         console.error('Error processing connection data:', error);
//       }
//     }

//     // Handle explicit session join requests
//     socket.on('join_session', async (data, callback) => {
//       try {
//         const roomName = `jam:${data.sessionId}`;
//         await socket.join(roomName);
//         console.log(`Socket ${socket.id} joining session ${data.sessionId}`);
        
//         // Update tracking information
//         currentSessionId = data.sessionId;
//         currentUserData = data.userData;
        
//         // Initialize session if needed
//         if (!activeSessions.has(currentSessionId)) {
//           activeSessions.set(currentSessionId, new Map());
//         }
        
//         // Store participant data
//         activeSessions.get(currentSessionId).set(socket.id, currentUserData);
        
//         // Notify other participants about the new join
//         socket.to(roomName).emit('PARTICIPANT_JOINED', {
//           participant: currentUserData,
//           timestamp: Date.now()
//         });
        
//         // Send success response with current session state
//         const participants = Array.from(activeSessions.get(currentSessionId).values());
//         callback({
//           success: true,
//           participants,
//           participantCount: participants.length
//         });
//       } catch (error) {
//         console.error('Error in join_session:', error);
//         callback({
//           success: false,
//           error: 'Failed to join session'
//         });
//       }
//     });

//     // Handle when a participant broadcasts their join
//     socket.on('PARTICIPANT_JOINED', (participant) => {
//       if (!currentSessionId) return;
      
//       const roomName = `jam:${currentSessionId}`;
//       socket.to(roomName).emit('PARTICIPANT_JOINED', {
//         participant: currentUserData,
//         timestamp: Date.now()
//       });
      
//       console.log(`Participant join broadcasted in session ${currentSessionId}`);
//     });

//     // Handle when host starts the jam
//     socket.on('JAM_STARTED', (data) => {
//       if (!currentSessionId) return;
      
//       const roomName = `jam:${currentSessionId}`;
//       io.in(roomName).emit('JAM_STARTED', {
//         ...data,
//         timestamp: Date.now()
//       });
      
//       console.log(`Jam started in session ${currentSessionId}`);
//     });

//     // Handle socket disconnection
//     socket.on('disconnect', async () => {
//       if (currentSessionId) {
//         await handleLeaveSession(socket, currentSessionId);
//       }
//       console.log('Client disconnected:', socket.id);
//     });
//   });

//   // Helper function to manage session departure
//   async function handleLeaveSession(socket, sessionId) {
//     const roomName = `jam:${sessionId}`;
    
//     // Get participant data before removal
//     const sessionParticipants = activeSessions.get(sessionId);
//     const leavingParticipant = sessionParticipants?.get(socket.id);
    
//     if (sessionParticipants) {
//       // Remove participant from tracking
//       sessionParticipants.delete(socket.id);
      
//       // Clean up empty sessions
//       if (sessionParticipants.size === 0) {
//         activeSessions.delete(sessionId);
//       }
      
//       // Notify others about departure
//       if (leavingParticipant) {
//         socket.to(roomName).emit('PARTICIPANT_LEFT', {
//           participantId: leavingParticipant.participantId,
//           name: leavingParticipant.name,
//           timestamp: Date.now()
//         });
//       }
//     }

//     // Remove socket from room
//     await socket.leave(roomName);
//     console.log(`Client ${socket.id} left session ${sessionId}`);
//   }

//   // Utility function to broadcast to all session participants
//   function broadcastToSession(sessionId, eventData) {
//     const roomName = `jam:${sessionId}`;
//     io.to(roomName).emit('message', {
//       ...eventData,
//       timestamp: Date.now()
//     });
//   }

//   // Return public interface
//   return {
//     broadcastToSession,
//     getSessionParticipantCount: (sessionId) => 
//       activeSessions.get(sessionId)?.size ?? 0
//   };
// }