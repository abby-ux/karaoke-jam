// server/index.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import jamRoutes from './routes/jamRoutes.js';
import setupSocketServer from './socket/socketServer.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type']
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

app.use(express.json());

const { broadcastToJam } = setupSocketServer(io);

app.use('/api/jams', (req, res, next) => {
  req.broadcastToJam = broadcastToJam;
  next();
}, jamRoutes);

app.get('/health', (req, res) => {
  res.send('Server is running');
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    console.log('Successfully connected to MongoDB');
    
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};

startServer();