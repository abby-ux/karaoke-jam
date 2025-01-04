import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import JamModel from './models/Jam.js';
import connectDB from './config/database.js';
import jamRoutes from './routes/jamRoutes.js';

dotenv.config();

const app = express();

// Define allowed origins for CORS - keeping this as a shared configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

// Express CORS configuration
app.use(cors({
  origin: "http://localhost:5173",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

const server = createServer(app);

// Socket.IO CORS configuration
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  
});

// Basic Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
  });

  socket.on("join_room", (data) => {
    socket.join(data);
  });

  socket.on("send_message", (data) => {
    socket.broadcast.emit("receive_message", data);
  });

  socket.on("send_click", (count, sessionId) => {
    const jamRoomName = `/jam/${sessionId}`;
    io.to(jamRoomName).emit("receive_click", count);
});

  socket.on("send_player", (data) => {
    socket.broadcast.emit("receive_player", data);
  });

  socket.on("join_session", async ({ sessionId, userData }) => {
    // Create a unique room name for this waiting room
    const roomName = `/waiting-room/${sessionId}`;
    
    // Join the socket to this room
    socket.join(roomName);

    try {
        // Update database with new participant
        const jam = await JamModel.findById(sessionId);
        if (jam) {
          // Add participant if not already in the list
          const participantExists = jam.participants.some(
            p => p.participantId === userData.participantId
          );
          
          if (!participantExists) {
            jam.participants.push({
              name: userData.name,
              participantId: userData.participantId,
              joinedAt: new Date()
            });
            await jam.save();
          }
  
          // Broadcast updated participant list to all users in the room
          io.to(roomName).emit("participants_updated", {
            participants: jam.participants
          });
        }
      } catch (error) {
        console.error('Error updating participants:', error);
      }

    // Emit back to confirm join
    socket.emit("session_joined", {
        status: "success",
        sessionId,
        socketId: socket.id
      });
    
    // // // Store user data in the socket for reference
    // // socket.userData = userData;
    
    // // // Notify other users in the room about the new join
    // // socket.to(roomName).emit("user_joined", {
    // //   userId: socket.id,
    // //   userData: userData
    // // });
    
    // // // Send current room state to the joining user
    // // const roomSockets = io.sockets.adapter.rooms.get(roomName);
    // // const usersInRoom = Array.from(roomSockets || []).map(socketId => ({
    // //   userId: socketId,
    // //   userData: io.sockets.sockets.get(socketId)?.userData
    // // }));
    
    // socket.emit("room_state", usersInRoom);
  });


  socket.on('start_jam', async ({sessionId, isHost}) => {
    try {
        // Update jam status in database
        const jam = await JamModel.findById(sessionId);
        if (jam) {
            jam.status = 'active';
            jam.startedAt = new Date();
            await jam.save();

            // Notify all users with the updated jam data
            io.to(`/waiting-room/${sessionId}`).emit("navigate_to_jam", {
                status: "success",
                sessionId,
                jamData: {
                    participants: jam.participants,
                    status: jam.status,
                    startedAt: jam.startedAt,
                },
                hostParticipantId: jam.host.participantId
            });
        }
    } catch (error) {
        console.error('Error starting jam:', error);
        socket.emit("jam_error", { message: "Failed to start jam" });
    }

    // Optional: Log for debugging
    // console.log(`Starting jam ${sessionId}, notifying all users in ${sessionId}`);
  });

  socket.on("join_jam_room", async ({ sessionId, userData }) => {
    // Create unique room name for the active jam
    const jamRoomName = `/jam/${sessionId}`;
    
    socket.join(jamRoomName);
    
    try {
        const jam = await JamModel.findById(sessionId);
        if (jam) {
            // Emit the full jam data to the joining user
            socket.emit("jam_joined", {
                status: "success",
                jamData: {
                    participants: jam.participants,
                    status: jam.status,
                    startedAt: jam.startedAt,
                    // Add any other jam data you need
                }
            });
            
            // Notify others in the room
            socket.to(jamRoomName).emit("player_joined_jam", {
                participant: userData
            });
        }
    } catch (error) {
        console.error('Error joining jam room:', error);
        socket.emit("jam_error", { message: "Failed to join jam room" });
    }
});

  socket.on("disconnect", async () => {
    try {
      // Find which jam/session this user was in
      const userData = socket.userData; // You'll need to store this when user joins
      if (userData?.sessionId) {
        const jam = await Jam.findById(userData.sessionId);
        if (jam) {
          // Remove participant
          jam.participants = jam.participants.filter(
            p => p.participantId !== userData.participantId
          );
          await jam.save();

          // Notify remaining users
          io.to(`/waiting-room/${userData.sessionId}`).emit("participants_updated", {
            participants: jam.participants
          });
        }
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });


});

app.use(express.json());

// Modified routes setup - removed broadcastToJam middleware
app.use('/api/jams', jamRoutes);

app.get('/health', (req, res) => {
  res.send('Server is running');
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    console.log('Successfully connected to MongoDB');
    
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};

startServer();