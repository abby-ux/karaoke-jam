import mongoose from 'mongoose'

const jamSchema = new mongoose.Schema({
  
  name: {
    type: String,
    required: true,
    trim: true
  },
  host: {
    
    type: new mongoose.Schema({
      name: String,
      participantId: String,  // Unique ID for the host as a participant
      joinedAt: {
        type: Date,
        default: Date.now
      }
    }),
    required: true
  },
  status: {
    type: String,

    enum: ['waiting', 'active', 'ended'],
    default: 'waiting'  // Start in waiting room
  },
  // Add configuration options
  config: {
    timeBetweenSongs: {
      type: Number,
      default: 30
    },
    singersPerRound: {
      type: Number,
      default: 1
    },
    // playlist
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date    // Will be set when status changes to 'active'
  },
  participants: [{
    name: String,  
    participantId: String,
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  songQueue: [{
    title: String,
    singer: String,
    addedAt: Date
  }],
  // the slug to join
  slug: {
    type: String,
    unique: true,    // Add an index to ensure uniqueness
    sparse: true     // Allow documents without a slug
  },
  // delete?: Add fields for session sharing
  joinUrl: String,     // Store the generated join URL
  qrCode: String      // Store the QR code data URL
})

// method to start the jam
jamSchema.methods.startJam = function() {
  this.status = 'active';
  this.startedAt = new Date();
  return this.save();
}

// method to add participants
jamSchema.methods.addParticipant = function(participantData) {
  this.participants.push({
    name: participantData.name,
    participantId: participantData.participantId,
    joinedAt: new Date()
  });
  return this.save();
}

// method to end the jam
jamSchema.methods.endJam = function() {
  this.status = 'ended';
  return this.save();
}

//  static methods
jamSchema.statics.findActiveJams = function() {
  return this.find({ status: { $in: ['waiting', 'active'] } });
}

jamSchema.statics.findJamByParticipant = function(participantId) {
  return this.findOne({
    $or: [
      { 'host.participantId': participantId },
      { 'participants.participantId': participantId }
    ]
  });
}

export default mongoose.model('Jam', jamSchema)