import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UsersRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import io from "socket.io-client";

// Simple loading spinner component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
  </div>
);

const NewWaitingRoom = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [wsStatus] = useState('connecting');
  const [isStarting, setIsStarting] = useState(false);
  const [participants, setParticipants] = useState([]);

//   const [room, setRoom] = useState("");

  // Messages States
  const [message, setMessage] = useState("");
  const [messageReceived, setMessageReceived] = useState([]);
//   const socket = io.connect("http://localhost:3000");
const [socket, setSocket] = useState(null);

//   const joinRoom = () => {
//     if (room !== "") {
//       socket.emit("join_room", room);
//     }
//   };

const sendMessage = () => {
    if (socket && message) {
      // Send the message to the server
      socket.emit("send_message", { message });
      
      // Add the message to your local message history too
      setMessageReceived(prevMessages => [...prevMessages, message]);
      
      // Clear the input field
      setMessage("");
    }
  };



  useEffect(() => {
    if (!sessionId) return;

    // Create a single socket connection
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket'],
      autoConnect: true
    });

    setSocket(newSocket);

    // Set up all event listeners
    newSocket.on("connect", () => {
        console.log("Connected to server");
        
        newSocket.emit("join_session", {
          sessionId,
          userData: {
            name: "User Name",
            joinedAt: new Date()
          }
        });
      });
  
      newSocket.on("receive_message", (data) => {
        setMessageReceived(prevMessages => [...prevMessages, data.message]);
      });
  
      // Clean up function
      return () => {
        if (newSocket) {
          newSocket.disconnect();
        }
      };
    }, [sessionId, navigate]);

  // First effect: Load user data and verify role
  useEffect(() => {
    const verifyUserAndRole = async () => {
      try {
        // Get stored user data
        const storedUserData = JSON.parse(localStorage.getItem('userData'));
        if (!storedUserData?.participantId) {
          navigate('/join');
          return;
        }

        // Fetch session data to verify role
        const response = await fetch(`http://localhost:3000/api/jams/${sessionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch session data');
        }
        
        const data = await response.json();
        
        // Determine if the current user is the host
        const isActuallyHost = data.host.participantId === storedUserData.participantId;
        
        // Update localStorage with verified role status
        const verifiedUserData = {
          ...storedUserData,
          isHost: isActuallyHost
        };
        localStorage.setItem('userData', JSON.stringify(verifiedUserData));
        
        // Transform session data
        const transformedData = {
          sessionId: data._id,
          name: data.name,
          host: {
            participantId: data.host.participantId,
            name: data.host.name
          },
          participants: data.participants || [],
          status: data.status,
          config: data.config,
          joinUrl: data.joinUrl,
          qrCode: data.qrCode
        };

        setSessionData(transformedData);
        setParticipants(data.participants || []);
        setUserRole(isActuallyHost ? 'host' : 'player');
        
      } catch (err) {
        console.error('Error verifying user role:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    verifyUserAndRole();
  }, [sessionId, navigate]);

//   // Second effect: Set up WebSocket connection
//   useEffect(() => {
//     if (!sessionId) return;

    

//       ws.on("connect", () => {
//         console.log("Connected to server");
        
//     //     // Join the waiting room session
//     //     ws.emit("join_session", {
//     //       sessionId,
//     //       userData: {
//     //         // Add any user data you want to share
//     //         name: "User Name",
//     //         joinedAt: new Date()
//     //       }
//     //     });
//     //   });
    
//     ws.onopen = () => {
//       console.log('WebSocket connection established');
//       setWsStatus('connected');
//       setError(null);
//     };

//     ws.onclose = () => {
//       console.log('WebSocket connection closed');
//       setWsStatus('disconnected');
//     };

//     ws.onerror = (error) => {
//       console.error('WebSocket error:', error);
//       setWsStatus('error');
//       setError('Lost connection to the server');
//     };
    
//     ws.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);
        
//         switch (data.type) {
//           case 'PARTICIPANT_JOINED':
//             handleParticipantJoin(data.participant);
//             break;
//           case 'JAM_STARTED':
//             navigate(`/jam/${sessionId}`);
//             break;
//           case 'PARTICIPANT_LEFT':
//             setParticipants(prev => 
//               prev.filter(p => p.participantId !== data.participantId)
//             );
//             break;
//           default:
//             console.log('Unhandled websocket message type:', data.type);
//         }
//       } catch (error) {
//         console.error('Error processing WebSocket message:', error);
//         setError('Error processing server update');
//       }
//     };
    
//     return () => {
//       if (ws.readyState === WebSocket.OPEN) {
//         ws.close();
//       }
//     };
//   }, [sessionId, navigate]);

//   const handleParticipantJoin = (newParticipant) => {
//     setParticipants(prev => {
//       const participantExists = prev.some(
//         p => p.participantId === newParticipant.participantId
//       );

//       if (participantExists) return prev;
//       return [...prev, newParticipant];
//     });
//   };

  const handleStartJam = async () => {
    if (participants.length < 2) {
      setError('Need at least one other participant to start');
      return;
    }

    setIsStarting(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3000/api/jams/${sessionId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostId: sessionData.host.participantId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start jam');
      }

      // Navigation will happen through WebSocket event
    } catch (error) {
      console.error('Error starting jam:', error);
      setError(error.message || 'Failed to start the jam session');
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  
  if (!sessionData || !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-gray-600 text-center">
          <p className="mb-4">No session data found</p>
          <button 
            onClick={() => navigate('/')} 
            className="text-blue-500 hover:text-blue-700 underline"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="Test">
      {/* <input
        placeholder="Room Number..."
        onChange={(event) => {
          setRoom(event.target.value);
        }}
      /> */}
      {/* <button onClick={joinRoom}> Join Room</button> */}
      <input
        placeholder="Message..."
        onChange={(event) => {
          setMessage(event.target.value);
        }}
      />
      <button onClick={sendMessage}> Send Message</button>
      <h1> Messages:</h1>
      <div className="space-y-2">
  {messageReceived.map((message, index) => (
    <div key={index} className="p-2 bg-gray-100 rounded">
      {message}
    </div>
  ))}
</div>
    </div>


      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">
            {sessionData.name || "New Jam Session"}
          </h2>
          
          {/* Connection status indicator */}
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

          {/* Error display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {/* QR Code display for host */}
          {userRole === 'host' && (
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
          )}

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
                <div 
                  key={participant.participantId}
                  className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                >
                  <span>
                    {participant.name}
                    {participant.participantId === sessionData.host.participantId && (
                      <span className="ml-2 text-sm text-blue-600">(Host)</span>
                    )}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(participant.joinedAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action section - different for host and player */}
          {userRole === 'host' ? (
            <div className="mt-6 flex justify-center">
              <Button
                onClick={handleStartJam}
                disabled={isStarting || participants.length < 2}
                className="w-full max-w-xs"
              >
                {isStarting ? 'Starting...' : 'Start Jam'}
              </Button>
            </div>
          ) : (
            <div className="mt-6 text-center text-gray-600">
              <p>Waiting for host to start the jam...</p>
              <p className="text-sm mt-2">Host: {sessionData.host.name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewWaitingRoom;