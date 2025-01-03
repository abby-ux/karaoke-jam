import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// import PropTypes from 'prop-types';
import HostWaitingRoom from './HostWaitingRoom';
import PlayerWaitingRoom from './PlayerWaitingRoom';

// LoadingSpinner component for a better loading state presentation
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// // ErrorDisplay component for consistent error presentation
// const ErrorDisplay = ({ message, onRetry }) => (
//   <div className="min-h-screen flex flex-col items-center justify-center p-4">
//     <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
//       <h2 className="text-red-700 text-lg font-semibold mb-2">Error</h2>
//       <p className="text-red-600 mb-4">{message}</p>
//       <button
//         onClick={onRetry}
//         className="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200 transition-colors"
//       >
//         Try Again
//       </button>
//     </div>
//   </div>
// );

const WaitingRoomContainer = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    try {
      const storedUserData = JSON.parse(localStorage.getItem('userData'));
      const storedSessionData = JSON.parse(localStorage.getItem('sessionData'));
      
      if (!storedUserData || !storedSessionData) {
        navigate('/join');
        return;
      }

      setUserData(storedUserData);
      setSessionData(storedSessionData);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading stored data:', err);
      setError('Failed to load session data. Please try joining again.');
      setIsLoading(false);
    }
  }, [navigate]);

  const handleParticipantJoin = (newParticipant) => {
    setSessionData(prev => {
      if (!prev) return prev;

      const participantExists = prev.participants.some(
        p => p.participantId === newParticipant.participantId
      );

      if (participantExists) return prev;

      const updatedData = {
        ...prev,
        participants: [...prev.participants, newParticipant]
      };

      localStorage.setItem('sessionData', JSON.stringify(updatedData));
      return updatedData;
    });
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return {error}
  if (!sessionData || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-gray-600 text-center">
          <p className="mb-4">No session data found</p>
          <button onClick={() => navigate('/')} className="text-blue-500 hover:text-blue-700 underline">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

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

export default WaitingRoomContainer;