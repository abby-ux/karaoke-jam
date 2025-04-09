import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// import PropTypes from 'prop-types';
import HostWaitingRoom from './HostWaitingRoom';
import PlayerWaitingRoom from './PlayerWaitingRoom';
import io from "socket.io-client";


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
<<<<<<< HEAD
  const [userData, setUserData] = useState(null);
  const socket = io.connect("http://localhost:3000");
=======
  const [userRole, setUserRole] = useState(null);
>>>>>>> 449d35cc2c8ef0b705446b436ca41335e2f970b7

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
        const response = await fetch(`/api/jams/${sessionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch session data');
        }
        
        const data = await response.json();
        
        // Determine if the current user is actually the host by comparing participantId
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

<<<<<<< HEAD
  

  useEffect(() => {
    socket.on("receive_player", (data) => {
      handleParticipantJoin(data.message);
    });
  }, [socket]);

  // Handler for participant updates
=======
>>>>>>> 449d35cc2c8ef0b705446b436ca41335e2f970b7
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
  if (!sessionData || !userRole) {
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

  if (!isLoading && sessionData && userRole) {
    return userRole === 'host' ? (
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
  }
};

export default WaitingRoomContainer;