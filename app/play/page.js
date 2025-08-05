'use client';

import { useState, useEffect } from 'react';
import PhaserGame from '@/components/PhaserGame';
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://server-field-agents.onrender.com'; // Update with your server/network IP and port';

export default function Play() {
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  // Get player/lobby info (adapt if you use a different method)
  const username =
    typeof window !== 'undefined'
      ? localStorage.getItem('fieldAgentsUser') || 'Agent'
      : 'Agent';
  const playerId =
    typeof window !== 'undefined'
      ? localStorage.getItem('fieldAgentsId') || null
      : null;
  const lobbyCode =
    typeof window !== 'undefined'
      ? localStorage.getItem('fieldAgentsLobby') || ''
      : '';

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  // -- SOCKET AND GEOLOCATION LOGIC --
  useEffect(() => {
    if (loading) return;
    // Only run after Phaser game starts

    const socketInstance = io(SOCKET_URL, { transports: ['websocket'] });
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to socket server');
    });

    let watcherId;
    if ('geolocation' in navigator) {
      watcherId = navigator.geolocation.watchPosition(
        (position) => {
          socketInstance.emit('playerMove', {
            lobbyCode,
            player: { id: playerId, name: username },
            coordinates: {
              lat: position.coords.latitude,
              long: position.coords.longitude,
            },
          });
        },
        (error) => console.error('Geolocation error:', error),
        { enableHighAccuracy: true }
      );
    }

    return () => {
      if (watcherId) navigator.geolocation.clearWatch(watcherId);
      socketInstance.disconnect();
    };
  }, [loading, lobbyCode, playerId, username]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 0%, #203055 0%, #06080d 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        fontFamily: 'Segoe UI, Arial, sans-serif',
        color: '#fff'
      }}
    >
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <h1 style={{ marginTop: 64, fontSize: 36, letterSpacing: 2 }}>
        Welcome, Agent!
      </h1>
      {loading ? (
        <div
          style={{
            marginTop: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              border: '8px solid #4fa1f2',
              borderTop: '8px solid #293e6a',
              borderRadius: '50%',
              animation: 'spin 1.1s linear infinite'
            }}
          />
          <div style={{ marginTop: 30, fontSize: 20, letterSpacing: 2 }}>
            Initializing mission system...
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 40, width: '100%' }}>
          <PhaserGame />
        </div>
      )}
    </div>
  );
}
