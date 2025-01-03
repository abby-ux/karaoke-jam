import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import HostWaitingRoom from './HostWaitingRoom';
import PlayerWaitingRoom from './PlayerWaitingRoom';

// LoadingSpinner component for a better loading state presentation
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// ErrorDisplay component for consistent error presentation
const ErrorDisplay = ({ message, onRetry }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4">
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
      <h2 className="text-red-700 text-lg font-semibold mb-2">Error</h2>
      <p className="text-red-600 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

const WaitingRoomContainer = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  // First effect: Load user data from localStorage
  useEffect(() => {
    try {
      const storedUserData = JSON.parse(localStorage.getItem('userData'));
      if (!storedUserData) {
        // If no user data is found, redirect to join page
        navigate('/join');
        return;
      }
      setUserData(storedUserData);
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load user data. Please try joining again.');
    }
  }, [navigate]);

  // Second effect: Fetch session data
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/jams/${sessionId}`);
        if (!response.ok) {
          // Handle specific HTTP error cases
          if (response.status === 404) {
            throw new Error('Jam session not found');
          }
          if (response.status === 403) {
            throw new Error('You do not have permission to join this session');
          }
          throw new Error('Failed to fetch session data');
        }
        
        const data = await response.json();
        
        // Validate essential session data
        if (!data._id || !data.host) {
          throw new Error('Invalid session data received');
        }

        // Transform API data to match our component needs
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
      } catch (err) {
        console.error('Error fetching session data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  // Handler for participant updates
  const handleParticipantJoin = (newParticipant) => {
    setSessionData(prev => {
      if (!prev) return prev;

      // Check if participant already exists
      const participantExists = prev.participants.some(
        p => p.participantId === newParticipant.participantId
      );

      if (participantExists) return prev;

      return {
        ...prev,
        participants: [...prev.participants, newParticipant]
      };
    });
  };

  // Loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Error state
  if (error) {
    return (
      <ErrorDisplay
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // No session data state
  if (!sessionData || !userData) {
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

  // Render the appropriate component based on user role
  return userData.isHost ? (
    <HostWaitingRoom
      sessionData={sessionData}
      onParticipantJoin={handleParticipantJoin}
      onStartJam={() => navigate(`/jam/${sessionId}`)}
    />
  ) : (
    <PlayerWaitingRoom
      sessionData={sessionData}
      onParticipantJoin={handleParticipantJoin}
    />
  );
};

// PropTypes for error display component
ErrorDisplay.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func.isRequired
};

export default WaitingRoomContainer;