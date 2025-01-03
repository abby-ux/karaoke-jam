import { useState } from 'react';
import io from "socket.io-client";
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

      // Initialize socket connection
        const socket = io('http://localhost:3000', {
        query: { sessionId: jamcode }
      });
  
      socket.emit('PARTICIPANT_JOINED', {
        participantId: data.participantId,
        name: name.trim(),
        joinedAt: new Date()
      });

      // Redirect to waiting room or game page
      navigate(`/waiting-room/${jamcode}`);
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