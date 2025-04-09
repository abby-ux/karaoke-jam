// host waiting room

import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router';
import { io } from 'socket.io-client';
import { UsersRound } from 'lucide-react';
import PropTypes from 'prop-types';
import { Button } from '@/components/ui/button';

<<<<<<< HEAD

// A reusable component to display individual participants
=======
>>>>>>> 449d35cc2c8ef0b705446b436ca41335e2f970b7
const ParticipantRow = ({ participant, isHost }) => (
  <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
    <span>
      {participant.name}
      {isHost && <span className="ml-2 text-sm text-blue-600">(Host)</span>}
    </span>
    <span className="text-sm text-gray-500">
      {new Date(participant.joinedAt).toLocaleTimeString()}
    </span>
  </div>
);

<<<<<<< HEAD
const HostWaitingRoom = ({ sessionData, onParticipantJoin }) => {
  // State management for component
=======
const HostWaitingRoom = ({ sessionData, onParticipantJoin, onStartJam }) => {
  // const navigate = useNavigate();
>>>>>>> 449d35cc2c8ef0b705446b436ca41335e2f970b7
  const [participants, setParticipants] = useState([]);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    if (!sessionData?.sessionId) {
      setError('Invalid session data');
      return;
    }

    // Initialize participants with current session data
    setParticipants(sessionData.participants || []);
    
<<<<<<< HEAD
  }, [sessionData, onParticipantJoin]);

  

  // Handle starting the jam session
=======
    // Socket connection
    const socket = io('http://localhost:3000', {
      query: { sessionId: sessionData.sessionId }
    });

    socket.on('connect', () => {
      setWsStatus('connected');
      setError(null);
    });

    socket.on('connect_error', (err) => {
      setWsStatus('error');
      setError(`Connection error: ${err.message}`);
    });

    socket.on('disconnect', () => {
      setWsStatus('disconnected');
    });

    socket.on('PARTICIPANT_JOINED', (data) => {
      setParticipants(prev => {
        const exists = prev.some(p => p.participantId === data.participant.participantId);
        if (!exists && onParticipantJoin) {
          onParticipantJoin(data.participant);
        }
        return exists ? prev : [...prev, data.participant];
      });
    });

    socket.on('PARTICIPANT_LEFT', (data) => {
      setParticipants(prev => 
        prev.filter(p => p.participantId !== data.participantId)
      );
    });

    return () => socket.disconnect();
  }, [sessionData, onParticipantJoin]);

>>>>>>> 449d35cc2c8ef0b705446b436ca41335e2f970b7
  const handleStartJam = async () => {
    if (participants.length < 2) {
      setError('Need at least one other participant to start');
      return;
    }

    setIsStarting(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3000/api/jams/${sessionData.sessionId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostId: sessionData.host.participantId })
      });

      if (!response.ok) {
        throw new Error((await response.json()).message || 'Failed to start jam');
      }

<<<<<<< HEAD
      
=======
      if (onStartJam) {
        onStartJam();
      }
>>>>>>> 449d35cc2c8ef0b705446b436ca41335e2f970b7
    } catch (error) {
      setError(error.message);
    } finally {
      setIsStarting(false);
    }
  };

  if (!sessionData) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">
            {sessionData.name || "New Jam Session"}
          </h2>
          
<<<<<<< HEAD
          
=======
          {wsStatus !== 'connected' && (
            <div className="mb-4 text-center text-sm">
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                wsStatus === 'connecting' ? 'bg-yellow-400' :
                wsStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
              }`} />
              {wsStatus === 'connecting' ? 'Connecting to server...' :
               wsStatus === 'error' ? 'Connection error' :
               'Disconnected from server'}
            </div>
          )}
>>>>>>> 449d35cc2c8ef0b705446b436ca41335e2f970b7

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <div className="flex flex-col items-center space-y-4">
            {sessionData.qrCode ? (
              <img 
                src={sessionData.qrCode} 
                alt="Join QR Code"
                className="w-48 h-48"
              />
            ) : (
              <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                QR Code not available
              </div>
            )}
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center space-x-2">
              <UsersRound className="w-5 h-5" />
              <h3 className="text-lg font-semibold">
                Participants ({participants.length})
              </h3>
            </div>
            <div className="space-y-2">
              {participants.map((participant) => (
                <ParticipantRow
                  key={participant.participantId}
                  participant={participant}
                  isHost={participant.participantId === sessionData.host.participantId}
                />
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleStartJam}
              disabled={isStarting || participants.length < 2}
              className="w-full max-w-xs"
            >
              {isStarting ? 'Starting...' : 'Start Jam'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

HostWaitingRoom.propTypes = {
  sessionData: PropTypes.shape({
    sessionId: PropTypes.string.isRequired,
    name: PropTypes.string,
    host: PropTypes.shape({
      participantId: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
    participants: PropTypes.arrayOf(PropTypes.shape({
      participantId: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      joinedAt: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date)
      ]).isRequired
    })),
    qrCode: PropTypes.string
  }).isRequired,
  onParticipantJoin: PropTypes.func,
  onStartJam: PropTypes.func
};

ParticipantRow.propTypes = {
  participant: PropTypes.shape({
    participantId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    joinedAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date)
    ]).isRequired
  }).isRequired,
  isHost: PropTypes.bool.isRequired
};

export default HostWaitingRoom;