import { useState, useEffect } from 'react';
import {  useParams } from 'react-router-dom';
// import { UsersRound } from 'lucide-react';
// import { Button } from '@/components/ui/button';
import io from "socket.io-client";
import { Alert, AlertDescription } from '@/components/ui/alert';

const JamDisplay = () => {
    // const naviagte = useNavigate();
    const {sessionId} = useParams();
    const [socket, setSocket] = useState(null);
    const [jamData, setJamData] = useState(null);
    const [error, setError] = useState(null);
    // const [isLoading, setIsLoading] = useState(true);
    const [clickCount, setClickCount] = useState(0);

    useEffect(() => {
        const fetchJamDetails = async () => {
          try {
            // setIsLoading(true);
            const response = await fetch(`http://localhost:3000/api/jams/${sessionId}`);
            
            if (!response.ok) {
              throw new Error('Failed to fetch jam details');
            }
            
            const data = await response.json();
            setJamData(data);
          } catch (error) {
            console.error('Error fetching jam details:', error);
            setError(error.message);
          } finally {
            // setIsLoading(false);
          }
        };
    
        fetchJamDetails();
      }, [sessionId]);

    useEffect(() => {
        if (!sessionId) return;
    
        // Add a small delay to ensure previous socket is cleaned up
        const socketSetupTimeout = setTimeout(() => {
            const newSocket = io('http://localhost:3000', {
                transports: ['websocket'],
                autoConnect: true
            });
    
            setSocket(newSocket);
    
            newSocket.on("connect", () => {
                console.log("Connected on jam page");

                newSocket.emit("join_jam_room", {
                    sessionId,
                    userData: JSON.parse(localStorage.getItem('userData')) 
                });
            // Handle new players joining
            // future implementation: allow users to join an already in play jam
            // newSocket.on("player_joined_jam", ({ participant }) => {
            //     setJamData(prev => ({
            //         ...prev,
            //         participants: [...prev.participants, participant]
            //     }));
            });

               // Handle successful join
               newSocket.on("jam_joined", (data) => {
                setJamData(data.jamData);
            });

            // button click
            newSocket.on('receive_click', (data) => {
                setClickCount(data);
                localStorage.setItem('clickCount', JSON.stringify(data));
            });
    
            return () => {
                if (newSocket) {
                    newSocket.removeAllListeners();
                    newSocket.disconnect();
                    setSocket(null);
                    console.log('JamRoom socket cleaned up');
                }
            };
        }, 100);
    
        return () => clearTimeout(socketSetupTimeout);
    }, [sessionId]);



    const handleButtonClick = async () => {
        if (!socket) return; 
    
        const updatedCount = clickCount + 1;
        socket.emit('send_click', updatedCount, sessionId);
    }


    return(
        <div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}


            <div>hi</div>
            <button onClick={handleButtonClick}>
                Button
            </button>
            <h2>clicks: {clickCount}</h2>
            <div id="jam-information">
                <h2>Jam Info</h2>
                <h1>{jamData?.name}</h1>
                <div>Host: {jamData?.host?.name}</div>
            </div>
        </div>
    );

}

export default JamDisplay;