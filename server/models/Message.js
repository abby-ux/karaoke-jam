import mongoose from "mongoose";
// TEST DATA
const MessageSchema = {
    sessionId: 'string',
  message: 'string',
  senderId: 'string',    // participantId from userData
  senderName: 'string',  // name from userData
  timestamp: 'timestamp'
  };

export default mongoose.model('Message', MessageSchema)