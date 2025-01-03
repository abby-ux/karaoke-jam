import mongoose from 'mongoose'

const UserSchema = {
    id: 'unique_id',  // This is the host_id for the creator
    name: 'string',
    sessionId: 'session_id',   // References which game they're in
    isHost: 'boolean',         // Identifies if they're the host
    joinedAt: 'timestamp',
    //  add more fields like avatar, etc.
  };

  export default mongoose.model('User', UserSchema)