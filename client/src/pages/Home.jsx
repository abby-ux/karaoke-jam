// src/components/HomePage.js
// import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
// import { useSession } from '../context/SessionContext';

const Home = () => {
    const navigate = useNavigate();

    useEffect(() => {
        console.log('Home component mounted');
      }, []);

    // Initial click handler
const handleCreateJamClick = () => {
    // First navigate to a pre-creation screen (using React Router library)
      // hard coded path to navigate to the compenet with this URL:
      // future implementations could include types of jams:
      // navigate(`/create-jam/${jamType}/setup`);
    navigate('/create-jam/setup');
    // Jam config:
    // - Jam name
    // - Privacy settings (public/private)
    // - Max participants
    // - Song selection preferences
  };

  const handleJoinJamClick = () => {
    navigate('/join');
  };
  
  // Later, when user confirms settings
  //   const createJamSession = async (settings) => {
  //     try {
  //       const response = await axios.post('/api/sessions', {
  //         ...settings,
  //         createdAt: new Date(),
  //       });
  //       setSessionData(response.data);
  //       navigate(`/jam/${response.data.sessionId}`);
  //     } catch (error) {
  //         console.log(error);
  //       // Handle error appropriately
  //     }
  //   };

    return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-blue-700">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Welcome to KaraokeJam
        </h1>
        
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-8">
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">
                Ready to start singing?
              </h2>
              <p className="text-gray-600 mb-6">
                Create your own karaoke session or join an existing one
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <button
                onClick={handleCreateJamClick}
                className="p-6 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition"
              >
                <span className="block text-xl mb-2">Create a Jam</span>
                <span className="text-sm opacity-90">
                  Host your own karaoke session
                </span>
              </button>

              <button
                onClick={handleJoinJamClick}
                className="p-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
              >
                <span className="block text-xl mb-2">Join a Jam</span>
                <span className="text-sm opacity-90">
                  Jump into an existing session
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;