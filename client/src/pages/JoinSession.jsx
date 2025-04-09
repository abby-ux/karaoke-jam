import { useState,  } from 'react';
import io from "socket.io-client";
// import { socket, joinJamRoom } from '../services/socket';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import io from "socket.io-client";

// This component handles the join session page where users can enter their name
// to join an existing jam session
const JoinSession = () => {


  // Get the sessionId from the URL parameters
//   const { sessionId } = useParams();
  const navigate = useNavigate();
  
  // State for form handling
  const [name, setName] = useState('');
  const [jamcode, setJamcode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

<<<<<<< HEAD
  const socket = io.connect("http://localhost:3000");
=======
>>>>>>> 449d35cc2c8ef0b705446b436ca41335e2f970b7

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // if (!sessionId) {
    //     setError('Invalid session ID');
    //     setIsLoading(false);
    //     return;
    // }

    if (!name.trim()) {
        setError('Please enter your name');
        setIsLoading(false);
        return;
    }


    try {
      // Create the new user object
      const newUser = {
        name: name.trim(),
        // name: null,
        sessionId: jamcode,
        isHost: false,
        joinedAt: new Date().toISOString()
      };

      // Make API call to create user and join session
      const response = await fetch(`http://localhost:3000/api/jams/join-jam`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      localStorage.setItem('userData', JSON.stringify({
        participantId: data.participantId,
        name: name.trim(),
        isHost: false
      }));

      if (!response.ok) {
        throw new Error(data.message || 'Failed to join session');
      }

<<<<<<< HEAD
     socket.emit("join_jam", { sessionId: jamcode });

      // Redirect to waiting room or game page
=======
      // Store user data
      const userData = {
        participantId: data.participantId,
        name: name.trim(),
        isHost: false
      };
      localStorage.setItem('userData', JSON.stringify(userData));

      // Create socket connection
      const socket = io('http://localhost:3000', {
        query: { 
          sessionId: jamcode,
          userData: JSON.stringify(userData) // Pass user data with connection
        }
      });

    //   // Wait for socket connection before proceeding
    //   socket.on('connect', () => {
    //     console.log('Socket connected, joining session...');
        
    //     // Join the session room
    //     socket.emit('join_session', {
    //       sessionId: jamcode,
    //       userData: userData
    //     }, (response) => {
    //       if (response.success) {
    //         console.log(`Successfully joined session`);
    //         // Only navigate after successful socket connection
    //         navigate(`/waiting-room/${jamcode}`);
    //       } else {
    //         setError('Failed to join session room');
    //         console.error('Join session error:', response.error);
    //       }
    //     });
    //   });
    socket.emit('join_session', {
        sessionId: jamcode,
        userData: userData
      });

>>>>>>> 449d35cc2c8ef0b705446b436ca41335e2f970b7
      navigate(`/waiting-room/${jamcode}`);

      socket.on('session_joined', (response) => {
        console.log('Session joined:', response);
        if (response.status === 'success') {
          navigate(`/waiting-room/${response.sessionId}`);
        }
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setError('Failed to connect to game server');
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">Join Session</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Your Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                minLength={2}
                maxLength={50}
                className="mt-1"
                disabled={isLoading}
              />
            </div>

            <div>
                <label htmlFor="jamcode" className="block text-sm font-medium text-gray-700">
                Enter Jam Code
                    <Input
                    id="jamcode"
                    type="text"
                    value={jamcode}
                    onChange={(e) => setJamcode(e.target.value)}
                    placeholder="Enter jam code"
                    required
                    minLength={2}
                    maxLength={50}
                    className="mt-1"
                    disabled={isLoading}
                    />
                </label>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? 'Joining...' : 'Join Session'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinSession;