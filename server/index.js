import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
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

  socket.on("join_room", (data) => {
    socket.join(data);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("join_session", ({ sessionId, userData }) => {
    // Create a unique room name for this waiting room
    const roomName = `/waiting-room/${sessionId}`;
    
    // Join the socket to this room
    socket.join(roomName);

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