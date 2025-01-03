// src/components/CreateJam.jsx
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CreateJam = () => {
    const navigate = useNavigate();
    const [hostName, setHostName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [config, setConfig] = useState({
        timeBetweenSongs: 15,
        playlistId: '',
        singersPerRound: 1
    });

    // Configure axios with proper defaults
    const api = axios.create({
        baseURL: 'http://localhost:3000',
        withCredentials: true,
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        }
    });

    const handleCreateJam = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        if (!hostName.trim()) {
            setError('Please enter your name');
            setIsLoading(false);
            return;
        }

        try {
            const response = await api.post('/api/jams/create', {
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

            navigate(`/waiting-room/${sessionId}`);
        } catch (error) {
            console.error('Error creating jam:', error);
            
            let errorMessage = 'Failed to create jam session. ';
            
            if (error.response) {
                // Server responded with an error
                errorMessage += error.response.data.error || error.response.statusText;
            } else if (error.request) {
                // Request was made but no response received
                errorMessage += 'Could not reach the server. Please check your connection.';
            } else {
                // Error in request setup
                errorMessage += error.message;
            }
            
            setError(errorMessage);
        } finally {
            setIsLoading(false);
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