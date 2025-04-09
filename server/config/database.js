import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    // Remove deprecated options, using MongoDB driver 4.0+
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connection established');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB connection disconnected');
    });

    return connection;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
};


// Now let's modify our session creation function to use MongoDB
async function handleSessionCreation(req, res) {
  const { sessions, users } = await connectDB();
  
  // Generate unique session ID
  const sessionId = new ObjectId(); // MongoDB's built-in ID generator
  
  // Create session document
  const sessionDocument = {
    _id: sessionId,
    createdAt: new Date(),
    status: 'SETUP_IN_PROGRESS',
    hostIp: req.ip,
    // Any other session metadata you want to store
  };
  
  try {
    // Insert the session document
    await sessions.insertOne(sessionDocument);
    
    // Create host user document
    const hostUser = {
      sessionId: sessionId,
      role: 'HOST',
      createdAt: new Date()
      // Add other user fields
    };
    
    // Insert the user document
    const userResult = await users.insertOne(hostUser);
    
    // Generate session token
    const sessionToken = generateSessionToken(sessionId);
    
    return res.json({
      sessionId: sessionId.toString(), // Convert ObjectId to string
      sessionToken,
      hostId: userResult.insertedId.toString()
    });
  } catch (error) {
    await handleServerError(error, sessionId);
    return res.status(500).json({ error: 'Failed to create session' });
  }
}

// Updating a session would look like this
async function updateSession(sessionId, settings) {
  const { sessions } = await connectDB();
  
  try {
    const result = await sessions.updateOne(
      { _id: new ObjectId(sessionId) },
      { 
        $set: {
          status: 'ACTIVE',
          settings: settings,
          startedAt: new Date()
        }
      }
    );
    
    if (result.modifiedCount === 0) {
      throw new Error('Session not found');
    }
    
    return result;
  } catch (error) {
    console.error('Failed to update session:', error);
    throw error;
  }
}

// Finding a session would look like this
async function findSession(sessionId) {
  const { sessions } = await connectDB();
  
  try {
    const session = await sessions.findOne({ 
      _id: new ObjectId(sessionId) 
    });
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    return session;
  } catch (error) {
    console.error('Failed to find session:', error);
    throw error;
  }
}

export default connectDB;