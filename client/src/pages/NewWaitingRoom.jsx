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
  const [isStarting, setIsStarting] = useState(false);
  const [participants, setParticipants] = useState([]);

//   const [room, setRoom] = useState("");

  // Messages States
  const [message, setMessage] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [messageReceived, setMessageReceived] = useState([]);
  const [playerReceived, setPlayerReceived] = useState([]);
//   const socket = io.connect("http://localhost:3000");
const [socket, setSocket] = useState(null);

// First, create a function to fetch message history

// First, let's fix the initial loading of messages
useEffect(() => {
    const fetchMessageHistory = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/messages/${sessionId}`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        const messages = await response.json();
        setMessageReceived(messages);
        // Save fetched messages to localStorage
        localStorage.setItem('messageData', JSON.stringify(messages));
      } catch (error) {
        console.error('Error fetching messages:', error);
        // If fetch fails, initialize with empty array
        localStorage.setItem('messageData', JSON.stringify([]));
        setMessageReceived([]);
      }
    };
  
    // Get messages from localStorage or fetch them
    const savedMessages = localStorage.getItem('messageData');
    if (savedMessages) {
      // Make sure we parse it as an array
      const parsedMessages = JSON.parse(savedMessages);
      // Extra safety check to ensure it's an array
      setMessageReceived(Array.isArray(parsedMessages) ? parsedMessages : []);
    } else {
      fetchMessageHistory();
    }

    
  }, [sessionId]);
  
  const sendMessage = async () => {
    if (socket && message) {
      // Step 1: Get user data with error checking
      const storedUserData = JSON.parse(localStorage.getItem('userData'));
      if (!storedUserData?.participantId) {
        console.error('No user ID found');
        return;
      }
  
      // Step 2: Create the new message object
      const messageData = {
        message,
        senderId: storedUserData.participantId,
        senderName: storedUserData.name,
        timestamp: new Date()
      };
  
      // Step 3: Get existing messages with careful parsing and validation
      const existingMessagesString = localStorage.getItem('messageData');
      let messageArray = [];
      
      // Make sure we have valid data before parsing
      if (existingMessagesString) {
        try {
          const parsed = JSON.parse(existingMessagesString);
          // Ensure we have an array, if not, create one
          messageArray = Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          console.error('Error parsing messages from localStorage:', error);
          messageArray = []; // Reset to empty array if parsing fails
        }
      }
  
      // Step 4: Create the updated array of messages
      const updatedMessages = [...messageArray, messageData];
      
      // Step 5: Save to localStorage
      try {
        localStorage.setItem('messageData', JSON.stringify(updatedMessages));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
  
      // Step 6: Emit to socket and update state
      socket.emit("send_message", messageData);
      setMessageReceived(updatedMessages);
      setMessage("");
    }
  };

  const handleEnterName = async () => {
    if (socket && playerName) {
        const storedUserData = JSON.parse(localStorage.getItem('userData'));
        if (!storedUserData?.participantId) {
            console.error('No user ID found');
            return;
          }
        const newUserData = {
            participantId: storedUserData.participantId,
            name: playerName,
            isHost: false
        };

        const existingPlayers = localStorage.getItem('playerNameData');
        let playerArray = [];

        if (existingPlayers) {
            try {
                const parsed = JSON.parse(existingPlayers);
                playerArray = Array.isArray(parsed) ? parsed : [];
            } catch (error) {
                console.error('Error parsing messages from localStorage:', error);
                playerArray = [];
            }

            const updatedPlayers = [...playerArray, newUserData];

            try {
                localStorage.setItem('playerNameData', JSON.stringify(updatedPlayers))
            } catch (error) {
                console.error('Error saving to localStorage:', error);
            }

            socket.emit("send_playername", newUserData);
            setPlayerReceived(updatedPlayers);
            setPlayerName("");
        }
    }
    
  }



  useEffect(() => {
    // if (!sessionId|| socket) return;
    if (!sessionId) return;

    // Create a single socket connection
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket'],
      autoConnect: true
    });

    setSocket(newSocket);

    const storedUserData = JSON.parse(localStorage.getItem('userData'));
    // Join session with complete user data
    

    newSocket.on("navigate_to_jam", (data) => {
        if (data.status === "success") {
            console.log("Received navigation command");
            const userData = JSON.parse(localStorage.getItem('userData'));
            const route = userData.participantId === data.hostParticipantId ? 'host' : '';
            navigate(`/jam/${data.sessionId}/${route}`);
        }
    });

    // Set up all event listeners
    newSocket.on("connect", () => {
        console.log("Connected to server");

        if (storedUserData) {
            newSocket.emit("join_session", {
              sessionId,
              userData: {
                participantId: storedUserData.participantId,
                name: storedUserData.name,
                joinedAt: new Date()
              }
            });
        } else {
            newSocket.emit("join_session", {
                sessionId,
                userData: {
                  name: "User Name",
                  joinedAt: new Date()
                }
              });
        }

    });

    // Listen for participant updates
    newSocket.on("participants_updated", (data) => {
        setParticipants(data.participants);
        // Also update sessionData if needed
        setSessionData(prevData => ({
        ...prevData,
        participants: data.participants
        }));
    });
  
      newSocket.on("receive_message", (data) => {
        setMessageReceived(prevMessages => {
            const updatedMessages = [...prevMessages, data];
            // Save to localStorage whenever we receive a message
            localStorage.setItem('messageData', JSON.stringify(updatedMessages));
            return updatedMessages;
          });
      });

      newSocket.on("receive_player", (data) => {
        setPlayerReceived(prevPlayers => {
            const updatedPlayers = [...prevPlayers, data];
            localStorage.setItem('playerNameData', JSON.stringify(updatedPlayers));
            return updatedPlayers;
        });
      });

        newSocket.on("start_jam", (data) => {
            if (data.status === "success") {
                navigate(`/jam/${data.sessionId}`);
            }
        });

      newSocket.on('jam_joined', (response) => {
        console.log('jam joined: ', response);
        if (response.status === 'success') {
            navigate(`jam/${sessionId}`);
        }
      });
  
      // Clean up function
      return () => {
        if (newSocket) {
          // Explicitly leave the room before disconnecting
          newSocket.emit("leave_session", { sessionId });
          newSocket.removeAllListeners();
          newSocket.disconnect();
          setSocket(null);
          console.log('NewWaitingRoom socket cleaned up');
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
      console.log(response);

      if (!response.ok) {
        throw new Error('Failed to start jam');
      }

      // Navigation will happen through WebSocket event    
      socket.emit('start_jam', {sessionId});

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
      <h2> Welcome, enter name to join the jam.</h2>
      <input
        placeholder="Message Test"
        onChange={(event) => {
          setMessage(event.target.value);
        }}
      />
      <button onClick={sendMessage}>Message Test</button>
      
      <div className="space-y-2">
            {messageReceived.map((messageData, index) => {
                // Get the current user's ID to check if this is their message
                const currentUser = JSON.parse(localStorage.getItem('userData'));
                const isOwnMessage = messageData.senderId === currentUser?.participantId;

                return (
                <div 
                    key={index} 
                    className={`p-2 rounded ${
                    isOwnMessage 
                        ? 'bg-blue-100 ml-auto' 
                        : 'bg-gray-100'
                    } max-w-[80%]`}
                >
                    <div className="text-sm text-gray-600 mb-1">
                    {isOwnMessage ? 'You' : messageData.senderName}
                    </div>
                    <div>{messageData.message}</div>
                    <div className="text-xs text-gray-500 mt-1">
                    {new Date(messageData.timestamp).toLocaleTimeString()}
                    </div>
                </div>
                );
            })}
        </div>
    </div>



    <div className="Enter-name">
      {/* <input
        placeholder="Room Number..."
        onChange={(event) => {
          setRoom(event.target.value);
        }}
      /> */}
      {/* <button onClick={joinRoom}> Join Room</button> */}
      <h2> Welcome, enter name to join the jam.</h2>
      <input
        placeholder="Enter Name"
        onChange={(event) => {
          setMessage(event.target.value);
        }}
      />
      <button onClick={handleEnterName}>Enter Name</button>
      
      <div className="space-y-2">
            {playerReceived.map((messageData, index) => {
                // Get the current user's ID to check if this is their message
                const currentUser = JSON.parse(localStorage.getItem('userData'));
                const isOwnMessage = messageData.senderId === currentUser?.participantId;

                return (
                <div 
                    key={index} 
                    className={`p-2 rounded ${
                    isOwnMessage 
                        ? 'bg-blue-100 ml-auto' 
                        : 'bg-gray-100'
                    } max-w-[80%]`}
                >
                    <div className="text-sm text-gray-600 mb-1">
                    {isOwnMessage ? 'You' : messageData.senderName}
                    </div>
                    <div>{messageData.message}</div>
                    <div className="text-xs text-gray-500 mt-1">
                    {new Date(messageData.timestamp).toLocaleTimeString()}
                    </div>
                </div>
                );
            })}
        </div>
    </div>


      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">
            {sessionData.name || "New Jam Session"}
          </h2>
          
          

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