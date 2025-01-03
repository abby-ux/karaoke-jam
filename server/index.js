import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import jamRoutes from './routes/jamRoutes.js';

// Load environment variables first, so they're available throughout the app
dotenv.config();

// Initialize our Express application
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Set up middleware
app.use(cors());
app.use(express.json());

// Set up routes
app.use('/api/jams', jamRoutes);
app.get('/health', (req, res) => {
  res.send('Server is running');
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Single server startup sequence
const PORT = process.env.PORT || 3000;

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB(); // First connect to database
    console.log('Successfully connected to MongoDB');
    
    // Then start the server
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1); // Exit if we can't start properly
  }
};

// Initialize everything
startServer();