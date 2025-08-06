'use client';

import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://server-field-agents.onrender.com';

export default function ShowCord({ lobbyCode, playerId, playerName }) {
  const socketRef = useRef(null);
  const [myCoords, setMyCoords] = useState(null);

  useEffect(() => {
    // Create the socket and join the lobby
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;
    socket.emit('joinLobby', { lobbyCode, player: { id: playerId, name: playerName } });

    // Listen for coordinate updates
    socket.on('playerMoved', ({ player, coordinates }) => {
      if (player.id === playerId) {
        setMyCoords(coordinates);
      }
    });

    // Optionally emit your own location if you want to test
    let watchId;
    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          socket.emit('playerMove', {
            lobbyCode,
            player: { id: playerId, name: playerName },
            coordinates: {
              lat: position.coords.latitude,
              long: position.coords.longitude,
            },
          });
        },
        (err) => console.error('Geolocation error:', err),
        { enableHighAccuracy: true }
      );
    }

    return () => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
      socket.disconnect();
    };
  }, [lobbyCode, playerId, playerName]);

  return (
    <div style={{
      background: '#23293a',
      color: '#fff',
      padding: 20,
      borderRadius: 16,
      fontWeight: 600,
      fontFamily: 'monospace',
      marginBottom: 20,
      width: 340,
    }}>
      <div>
        <span style={{ color: '#7ecfff' }}>Your Coordinates:</span>
      </div>
      {myCoords ? (
        <div>
          Lat: <span style={{ color: '#f5e952' }}>{myCoords.lat.toFixed(6)}</span>
          <br />
          Long: <span style={{ color: '#f5e952' }}>{myCoords.long.toFixed(6)}</span>
        </div>
      ) : (
        <div style={{ color: '#ffb347' }}>Waiting for location...</div>
      )}
    </div>
  );
}
