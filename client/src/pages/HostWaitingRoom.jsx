import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { UsersRound } from 'lucide-react';
import { Button } from '@/components/ui/button';

// A reusable component to display individual participants
const ParticipantRow = ({ participant, isHost }) => (
  <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
    <span>
      {participant.name}
      {isHost && (
        <span className="ml-2 text-sm text-blue-600">(Host)</span>
      )}
    </span>
    <span className="text-sm text-gray-500">
      {new Date(participant.joinedAt).toLocaleTimeString()}
    </span>
  </div>
);

const HostWaitingRoom = ({ sessionData, onParticipantJoin, onStartJam }) => {
  // State management for component
  const [participants, setParticipants] = useState([]);
  const [jamName, setJamName] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [wsStatus, setWsStatus] = useState('connecting');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize session data when available
    if (sessionData) {
      try {
        // Set the jam name with a default fallback if needed
        const defaultName = sessionData.hostName ? `${sessionData.hostName}'s Jam` : 'New Jam Session';
        setJamName(sessionData.name || defaultName);
        // Initialize participants list
        setParticipants(sessionData.participants || []);
      } catch (error) {
        console.error('Error initializing session data:', error);
        setError('Failed to initialize session data');
      }
    }
    
    // Set up WebSocket connection for real-time updates
    const setupRealTimeUpdates = () => {
      if (!sessionData?.sessionId) {
        console.error('No sessionId available for WebSocket connection');
        setError('Unable to establish real-time connection');
        return () => {};
      }

      const ws = new WebSocket(`ws://localhost:3000/jams/${sessionData.sessionId}`);
      
      // WebSocket connection event handlers
      ws.onopen = () => {
        console.log('WebSocket connection established');
        setWsStatus('connected');
        setError(null);  // Clear any previous connection errors
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
        setWsStatus('disconnected');
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsStatus('error');
        setError('Lost connection to the server');
      };
      
      // Handle incoming WebSocket messages
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'PARTICIPANT_JOINED':
              setParticipants(prevParticipants => {
                // Check if participant already exists to prevent duplicates
                const exists = prevParticipants.some(
                  p => p.participantId === data.participant.participantId
                );
                if (exists) return prevParticipants;
                
                // Add new participant and notify parent component
                const newParticipants = [...prevParticipants, data.participant];
                if (onParticipantJoin) {
                  onParticipantJoin(data.participant);
                }
                return newParticipants;
              });
              break;

            case 'PARTICIPANT_LEFT':
              setParticipants(prevParticipants => 
                prevParticipants.filter(p => p.participantId !== data.participantId)
              );
              break;

            default:
              console.log('Unhandled websocket message type:', data.type);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
          setError('Error processing server update');
        }
      };
      
      // Return cleanup function to close WebSocket on unmount
      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    };
    
    return setupRealTimeUpdates();
  }, [sessionData, onParticipantJoin]);

  // Handle starting the jam session
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostId: sessionData.host.participantId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to start jam');
      }

      // Call the onStartJam callback provided by parent
      if (onStartJam) {
        onStartJam();
      }
    } catch (error) {
      console.error('Error starting jam:', error);
      setError(error.message || 'Failed to start the jam session');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">{jamName}</h2>
          
          {/* Connection status indicator */}
          {wsStatus !== 'connected' && (
            <div className="mb-4 text-center text-sm">
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                wsStatus === 'connecting' ? 'bg-yellow-400' :
                wsStatus === 'error' ? 'bg-red-500' :
                'bg-gray-400'
              }`} />
              {wsStatus === 'connecting' ? 'Connecting to server...' :
               wsStatus === 'error' ? 'Connection error' :
               'Disconnected from server'}
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {/* QR Code for sharing */}
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

          {/* Participants list */}
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

          {/* Start button */}
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

// PropType definitions for type checking
HostWaitingRoom.propTypes = {
  sessionData: PropTypes.shape({
    sessionId: PropTypes.string.isRequired,
    name: PropTypes.string,
    hostName: PropTypes.string,
    qrCode: PropTypes.string,
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
    }))
  }).isRequired,
  onParticipantJoin: PropTypes.func,
  onStartJam: PropTypes.func
};

HostWaitingRoom.defaultProps = {
  onParticipantJoin: () => {},
  onStartJam: () => {}
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