'use client';

import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { nanoid } from 'nanoid';
import ChatBox from './ChatBox';

const SOCKET_URL = 'https://server-field-agents.onrender.com'; // your deployed server in production

export default function Lobby() {
  const [lobbyCode, setLobbyCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [started, setStarted] = useState(false);

  const username = typeof window !== 'undefined'
    ? (JSON.parse((localStorage.getItem('fieldAgentsUser'))).username || 'Agent')
    : 'Agent';

  const playerId = typeof window !== 'undefined'
    ? localStorage.getItem('fieldAgentsId') || username
    : username;

  const socketRef = useRef(null);

  // Initialize lobby code once on mount
  useEffect(() => {
    const code = nanoid(6).toUpperCase();
    setLobbyCode(code);
  }, []);

  useEffect(() => {
    if (!lobbyCode || !playerId || !username) return;

    // Create single socket instance and store in ref
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    // Upon connection, create lobby with current player info
    socket.on('connect', () => {
      socket.emit('createLobby', { lobbyCode, player: { id: playerId, name: username } });
    });

    // Update players list on lobby updates
    socket.on('lobbyUpdate', (lobby) => {
      setPlayers(lobby.players || []);
    });

    // Listen for moving players and log coordinates
    socket.on('playerMoved', (data) => {
      console.log(`[From playerMoved] Player ${data.player.name} moved to:`, data.coordinates);
    });

    // Start geolocation watcher and emit position updates
    let watcherId;
    if ('geolocation' in navigator) {
      watcherId = navigator.geolocation.watchPosition(
        (position) => {
          if (socketRef.current.connected) {
            socketRef.current.emit('playerMove', {
              lobbyCode,
              player: { id: playerId, name: username },
              coordinates: {
                lat: position.coords.latitude,
                long: position.coords.longitude,
              },
            });
          }
        },
        (error) => console.error('Geolocation error:', error),
        { enableHighAccuracy: true }
      );
    }

    // Clean up watcher and socket on unmount
    return () => {
      if (watcherId) navigator.geolocation.clearWatch(watcherId);
      if (socketRef.current) {
        socketRef.current.emit('leaveLobby', { lobbyCode, playerId });
        socketRef.current.disconnect();
      }
    };
  }, [lobbyCode, playerId, username]);

  // You don't need to define sendMessage or setMessages here — ChatBox handles chat

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Lobby</h1>
        <div style={styles.playerCount}>{players.length} / 10</div>
      </header>

      {/* Pass current lobby info and user info to ChatBox */}
      <ChatBox lobbyCode={lobbyCode} username={username} playerId={playerId} />

      <div style={styles.lobbyCodeContainer}>
        <span style={styles.lobbyCodeLabel}>Lobby Code:</span>
        <span style={styles.lobbyCode}>{lobbyCode}</span>
      </div>

      <div style={styles.infoBox}>
        <div style={{ marginBottom: 20 }}>Share this code with your friends so they can join!</div>
        <ul style={styles.playerList}>
          {players.map((p, i) => (
            // p.name is a plain string — no JSON.parse needed
            <li key={i} style={styles.playerItem}>{p.name}</li>
          ))}
        </ul>
      </div>

      <button
        style={{
          ...styles.startButton,
          opacity: players.length < 2 ? 0.5 : 1,
          cursor: players.length < 2 ? 'not-allowed' : 'pointer',
        }}
        disabled={players.length < 2}
        onClick={() => setStarted(true)}
      >
        Start Game
      </button>

      {started && (
        <div style={styles.startedPanel}>
          <h2>Game Started!</h2>
        </div>
      )}
    </div>
  );
}


const styles = {
  container: {
    minHeight: '100vh',
    background: '#10151a',
    color: '#eee',
    padding: '30px 5vw',
    boxSizing: 'border-box',
    width: '100vw',
    maxWidth: '100%',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  playerCount: {
    backgroundColor: '#222e44',
    color: '#7ecfff',
    padding: '8px 20px',
    borderRadius: 18,
    fontWeight: '600',
    fontSize: 18,
    letterSpacing: 2,
  },
  lobbyCodeContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  lobbyCodeLabel: { fontSize: 20, marginRight: 10 },
  lobbyCode: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 8,
    backgroundColor: '#2a3042',
    padding: '14px 36px',
    borderRadius: 12,
    fontFamily: "'Courier New', Courier, monospace",
  },
  infoBox: {
    background: '#131b2b',
    borderRadius: 10,
    padding: 24,
    marginBottom: 32,
  },
  playerList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  playerItem: {
    padding: '8px 0',
    fontSize: 19,
    borderBottom: '1px solid #21304b',
  },
  startButton: {
    display: 'block',
    fontSize: 22,
    fontWeight: 'bold',
    padding: '14px 56px',
    borderRadius: 32,
    backgroundColor: '#4fa1f2',
    color: '#fff',
    border: 'none',
    margin: '46px auto 0 auto',
    userSelect: 'none',
    transition: 'background 0.2s',
  },
  startedPanel: {
    marginTop: 50,
    textAlign: 'center',
    background: '#178277',
    padding: 36,
    borderRadius: 24,
  },
};
