import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import io from "socket.io-client";
import { UsersRound } from 'lucide-react';
import io from "socket.io-client";

// A reusable component for the participant row to keep the code DRY
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

const PlayerWaitingRoom = ({ sessionData, onParticipantJoin }) => {
  // State management for the component
  const [participants, setParticipants] = useState([]);
  const [jamName, setJamName] = useState('');
  const [error, setError] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const jam = sessionData.sessionId;

  const socket = io.connect("http://localhost:3000");

  const handleAddPlayer = () => {
    socket.emit("add_player", { playerName, jam });
  };

  // added to main container
//   useEffect(() => {
    // socket.on("receive_message", (data) => {
    //     handleParticipantJoin(data.message);
    //   });
    // }, [socket]);

  useEffect(() => {
    let socket;

    // Initialize the component with session data
    if (sessionData) {
      try {
        const defaultName = sessionData.hostName 
          ? `${sessionData.hostName}'s Jam` 
          : 'New Jam Session';
        setJamName(sessionData.name || defaultName);
        setParticipants(sessionData.participants || []);
      } catch (error) {
        console.error('Error initializing session data:', error);
        setError('Failed to initialize session data');
      }
    }
    
<<<<<<< HEAD
=======
    // Set up Socket.IO connection for real-time updates
    const setupRealTimeUpdates = async () => {
        if (!sessionData?.sessionId) {
          setError('No session ID available');
          return;
        }
      
        try {
        //   const { io } = await import('socket.io-client');
          socket = io('http://localhost:3000', {
            query: { 
              sessionId: sessionData.sessionId,
              userData: localStorage.getItem('userData')
            }
          });
          
          socket.on('connect', () => {
            console.log('Socket.IO connection established');
            setWsStatus('connected');
          });
      
          // Listen for the same events that the server will emit
          socket.on('PARTICIPANT_JOINED', (data) => {
            console.log('New participant joined:', data);
            setParticipants(prevParticipants => {
              const exists = prevParticipants.some(
                p => p.participantId === data.participant.participantId
              );
              if (exists) return prevParticipants;
              
              return [...prevParticipants, data.participant];
            });
          });
      
          socket.on('jam_started', () => {
            window.location.href = `/jam/${sessionData.sessionId}`;
          });
      
          socket.on('disconnect', () => {
            console.log('Socket.IO connection closed');
            setWsStatus('disconnected');
          });
      
          socket.on('connect_error', (error) => {
            console.error('Socket.IO connection error:', error);
            setWsStatus('error');
            setError('Lost connection to the server');
          });
        } catch (error) {
          console.error('Error setting up Socket.IO:', error);
          setError('Failed to establish connection');
        }
      };

    setupRealTimeUpdates();
    
    // Cleanup function
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
>>>>>>> 449d35cc2c8ef0b705446b436ca41335e2f970b7
  }, [sessionData, onParticipantJoin]);

  // Show error state if something goes wrong
  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="text-center">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try refreshing the page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">{jamName}</h2>
          
          <form onSubmit={handleAddPlayer} className="max-w-lg mx-auto">
          <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Your Name
                        </label>
                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            placeholder="Enter your name"
                            disabled={isLoading}
                        />
                    </div>
          </form>
      <button onClick={handleAddPlayer}> Add Player Name </button>


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

          {/* Status message for players */}
          <div className="mt-6">
            <div className="text-center text-gray-600">
              Waiting for host to start the jam...
            </div>
            <div className="text-center text-sm text-gray-500 mt-2">
              Host: {sessionData.host.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// PropTypes definitions remain the same
PlayerWaitingRoom.propTypes = {
  sessionData: PropTypes.shape({
    sessionId: PropTypes.string.isRequired,
    name: PropTypes.string,
    hostName: PropTypes.string,
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
  onParticipantJoin: PropTypes.func
};

PlayerWaitingRoom.defaultProps = {
  onParticipantJoin: () => {}
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

export default PlayerWaitingRoom;