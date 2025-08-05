'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { nanoid } from 'nanoid';
import dynamic from 'next/dynamic';

// const PhaseMapInner = dynamic(() => import('./PhasorMap.js'), { ssr: false });

const SOCKET_URL = 'https://server-field-agents.onrender.com'; // your deployed server in production

export default function Lobby() {
  const [lobbyCode, setLobbyCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [started, setStarted] = useState(false);

  const username = typeof window !== 'undefined'
    ? (localStorage.getItem('fieldAgentsUser') || 'Agent')
    : 'Agent';

    const myPlayerId = typeof window !== 'undefined' 
  ? localStorage.getItem('fieldAgentsId') || null 
  : null;


//     useEffect(() => {
//   let socket = io(SOCKET_URL);
//   let watcherId;

//   if ("geolocation" in navigator) {
//     watcherId = navigator.geolocation.watchPosition(
//       (position) => {
//         socket.emit('playerMove', {
//           lobbyCode,
//           player: { id: myPlayerId, name: username }, // include your unique playerId!
//           coordinates: {
//             lat: position.coords.latitude,
//             long: position.coords.longitude,
//           },
//         });
//       },
//       (error) => console.error(error),
//       { enableHighAccuracy: true }
//     );
//   }

//   return () => {
//     if (watcherId) navigator.geolocation.clearWatch(watcherId);
//     socket.disconnect();
//   };
// }, [lobbyCode, myPlayerId, username]);

  useEffect(() => {
    // Generate a new code on mount
    const code = nanoid(6).toUpperCase();
    setLobbyCode(code);

    const socket = io(SOCKET_URL, { transports: ['websocket'] });

    socket.on('connect', () => {
      socket.emit('createLobby', { lobbyCode: code, player: { name: username } });
    });

    socket.on('lobbyUpdate', (lobby) => {
      setPlayers(lobby.players || []);
    });

    // Clean up socket on unmount
    return () => {
      socket.emit('leaveLobby', { lobbyCode: code, playerId: username });
      socket.disconnect();
    };
  }, [username]);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Lobby</h1>
        <div style={styles.playerCount}>{players.length} / 10</div>
      </header>

      <div style={styles.lobbyCodeContainer}>
        <span style={styles.lobbyCodeLabel}>Lobby Code:</span>
        <span style={styles.lobbyCode}>{lobbyCode}</span>
      </div>

      <div style={styles.infoBox}>
        <div style={{ marginBottom: 20 }}>Share this code with your friends so they can join!</div>
        <ul style={styles.playerList}>
          {players.map((p, i) => (
            <li key={i} style={styles.playerItem}>{(JSON.parse(p.name).username)}</li>
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
      {/* <PhaseMap/> */}
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
    marginBottom: 40
  },
  playerCount: {
    backgroundColor: '#222e44',
    color: '#7ecfff',
    padding: '8px 20px',
    borderRadius: 18,
    fontWeight: '600',
    fontSize: 18,
    letterSpacing: 2
  },
  lobbyCodeContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40
  },
  lobbyCodeLabel: { fontSize: 20, marginRight: 10 },
  lobbyCode: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 8,
    backgroundColor: '#2a3042',
    padding: '14px 36px',
    borderRadius: 12,
    fontFamily: "'Courier New', Courier, monospace"
  },
  infoBox: {
    background: '#131b2b',
    borderRadius: 10,
    padding: 24,
    marginBottom: 32
  },
  playerList: {
    listStyle: 'none',
    margin: 0,
    padding: 0
  },
  playerItem: { padding: '8px 0', fontSize: 19, borderBottom: '1px solid #21304b' },
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
    transition: 'background 0.2s'
  },
  startedPanel: {
    marginTop: 50,
    textAlign: 'center',
    background: '#178277',
    padding: 36,
    borderRadius: 24
  }
};
