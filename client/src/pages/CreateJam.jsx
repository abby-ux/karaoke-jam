// src/components/CreateJam.jsx
import { useNavigate } from 'react-router-dom';
import io from "socket.io-client";
import { useState } from 'react';
import axios from 'axios';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CreateJam = () => {
    const navigate = useNavigate();
    const [error] = useState('');
    const [isLoading] = useState('');
    const [hostName, setHostName] = useState('');
    const [config, setConfig] = useState({
        timeBetweenSongs: 15,
        playlistId: '',
        singersPerRound: 1
    });

    const handleCreateJam = async (e) => {
        e.preventDefault();
        
        if (!hostName.trim()) {
            alert('Please enter your name');
            return;
        }

        try {
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

            const { hostId, sessionId, joinUrl, qrCode } = response.data;

            // Store user data
            const userData = {
                participantId: hostId,
                name: hostName,
                isHost: true
            };

            // Store session data with complete structure matching PropTypes
            const sessionData = {
                sessionId,
                name: `${hostName}'s Jam`,
                host: {
                    participantId: hostId,
                    name: hostName
                },
                participants: [{
                    participantId: hostId,
                    name: hostName,
                    joinedAt: new Date()
                }],
                config,
                joinUrl,
                qrCode
            };

            localStorage.setItem('userData', JSON.stringify(userData));
            localStorage.setItem('sessionData', JSON.stringify(sessionData));


            // Initialize socket connection
        const socket = io('http://localhost:3000', {
            query: { sessionId: sessionData.sessionId }
          });
      
          socket.emit('PARTICIPANT_JOINED', {
            participantId: userData.participantId,
            name: name.trim(),
            joinedAt: new Date()
          });


            navigate(`/waiting-room/${sessionId}`);
        } catch (error) {
            alert('Failed to create jam session. Please try again.');
            console.error('Error creating jam:', error);
        }
    };
    return (
        <div className="container mx-auto px-4 py-8">
            <form onSubmit={handleCreateJam} className="max-w-lg mx-auto">
                <div className="space-y-6">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

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
                            disabled={isLoading}
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
                            disabled={isLoading}
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
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating Jam...' : 'Create Jam'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateJam;