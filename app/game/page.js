'use client';

import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import ShowCord from '@/components/showcord';
import PlayerMap from '@/components/PhasorMap';

const SOCKET_URL = 'https://server-field-agents.onrender.com'; // Your socket server URL

export default function GamePage() {
  const lobbyCode = 'ABC123';     // replace with actual lobby code from props/state
  const username = 'Agent Smith'; // replace with actual user name

  const [players, setPlayers] = useState([]);
  const socketRef = useRef(null);

  const [playerId, setPlayerId] = useState(null);

useEffect(() => {
  if (typeof window !== 'undefined') {
    const storedId = localStorage.getItem('fieldAgentsId');
    setPlayerId(storedId || 'defaultPlayerId');
  }
}, []);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.emit('joinLobby', { lobbyCode, player: { id: playerId, name: username } });

    socket.on('lobbyUpdate', (lobby) => {
      setPlayers(lobby.players || []);
    });

    socket.on('playerMoved', ({ player, coordinates }) => {
      setPlayers((prevPlayers) => {
        const idx = prevPlayers.findIndex((p) => p.id === player.id);
        if (idx !== -1) {
          const updated = [...prevPlayers];
          updated[idx] = { ...updated[idx], coordinates };
          return updated;
        }
        return prevPlayers;
      });
    });

    // Start watching user geolocation and log coordinates each time user moves
    let watcherId;
    if ('geolocation' in navigator) {
      watcherId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('My current position:', { lat: latitude, long: longitude });

          // Optionally emit user's move to server
          if (socket.connected) {
            socket.emit('playerMove', {
              lobbyCode,
              player: { id: playerId, name: username },
              coordinates: {
                lat: latitude,
                long: longitude,
              },
            });
          }
        },
        (error) => {
          console.error('Error getting position:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000,
        }
      );
    } else {
      console.warn('Geolocation API is not available in your browser.');
    }

    return () => {
      if (watcherId !== undefined) navigator.geolocation.clearWatch(watcherId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [lobbyCode, playerId, username]);

  return (
    <div>
      <ShowCord 
  lobbyCode={lobbyCode} 
  playerId={playerId} 
  playerName={username} 
/>

<PlayerMap 
  lobbyCode={lobbyCode} 
  playerId={playerId} 
  playerName={username} 
/>
      <h1>Game Page</h1>
      {/* Render player list or game UI here */}
    </div>
  );
}
