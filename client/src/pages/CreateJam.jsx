import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

const CreateJam = () => {
    const navigate = useNavigate();
    const [hostName, setHostName] = useState(''); // state for host name
    const [config, setConfig] = useState({
        timeBetweenSongs: 15,
        playlistId: '',
        singersPerRound: 1
    });

    // create both host user and session -- two seperate records
    const handleCreateJam = async (e) => {
        e.preventDefault();
        
        // Validate that host name is provided
        if (!hostName.trim()) {
            alert('Please enter your name');
            return;
        }

        try {
            // Send both host and config data to create the session
            const response = await axios.post('http://localhost:3000/api/jams/create', {
                host: {
                    name: hostName,
                    isHost: true,
                    joinedAt: new Date()
                },
                config: {
                    ...config,
                    createdAt: new Date()
                }
            });

            // Destructure the response to get all necessary data
            const { hostId, sessionId, joinUrl, qrCode } = response.data;

            // Store session data in localStorage
            localStorage.setItem('sessionData', JSON.stringify({
                hostId,
                sessionId,
                hostName,
                joinUrl,
                qrCode,
                config
            }));
            localStorage.setItem('userData', JSON.stringify({
                participantId: hostId,
                name: hostName,
                isHost: true
              }));

            // Navigate to waiting room with session ID
            navigate(`/waiting-room/${sessionId}`);
            // navigate(`/jam/${sessionId}/waiting-room`);
        } catch (error) {
            // Provide user feedback for errors
            alert('Failed to create jam session. Please try again.');
            console.error('Error creating jam:', error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <form onSubmit={handleCreateJam} className="max-w-lg mx-auto">
                <div className="space-y-6">
                    {/* input field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Your Name
                        </label>
                        <input
                            type="text"
                            value={hostName}
                            onChange={(e) => setHostName(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            placeholder="Enter your name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Time between songs (seconds)
                        </label>
                        <input
                            type="number"
                            value={config.timeBetweenSongs}
                            onChange={(e) => setConfig({
                                ...config,
                                timeBetweenSongs: parseInt(e.target.value)
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            min="0"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Singers per round
                        </label>
                        <input
                            type="number"
                            value={config.singersPerRound}
                            onChange={(e) => setConfig({
                                ...config,
                                singersPerRound: parseInt(e.target.value)
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            min="1"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
                    >
                        Create Jam
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateJam;