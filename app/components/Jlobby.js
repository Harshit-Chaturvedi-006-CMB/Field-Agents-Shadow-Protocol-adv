'use client';

import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// You can replace with your actual backend URL
const SOCKET_URL = 'https://server-field-agents.onrender.com';

import Reveal from './Reveal';  // Your Reveal component (adjust path)
import Game from './game';      // Your Game component (adjust path)
import ChatBox from './ChatBox';

export default function Joinlobby() {
  const [inputLobbyCode, setInputLobbyCode] = useState('');
  const [joinedLobbyCode, setJoinedLobbyCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [currentScreen, setCurrentScreen] = useState('join'); // 'join' | 'lobby' | 'reveal' | 'game'
  const [myRole, setMyRole] = useState(null);

  const username = typeof window !== 'undefined'
    ? (JSON.parse(localStorage.getItem('fieldAgentsUser'))?.username || 'Agent')
    : 'Agent';

  const playerId = typeof window !== 'undefined'
    ? localStorage.getItem('fieldAgentsId') || username
    : username;

  const socketRef = useRef(null);

  useEffect(() => {
    if (!joinedLobbyCode) return;

    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`Socket connected: ${socket.id}`);
      socket.emit('joinLobby', {
        lobbyCode: joinedLobbyCode,
        player: { id: playerId, name: username }
      });
    });

    socket.on('lobbyUpdate', (lobby) => {
      setPlayers(lobby.players || []);
      if (currentScreen !== 'lobby') setCurrentScreen('lobby'); // Show lobby screen
    });

    socket.on('revealRoles', ({ roles }) => {
      const roleObj = roles.find(r => r.id === playerId);
      setMyRole(roleObj || { role: 'Agent', task: 'No task assigned' });
      setCurrentScreen('reveal');
      console.log('Received revealRoles:', roleObj);
    });

    socket.on('goToGame', () => {
      setCurrentScreen('game');
      console.log('Received goToGame, switching to game screen');
    });

    // OPTIONAL: Handle disconnect, errors, etc.

    return () => {
      socket.emit('leaveLobby', { lobbyCode: joinedLobbyCode, playerId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [joinedLobbyCode, playerId, username]);

  const handleJoinClick = () => {
    if (!/^[A-Z0-9]{6}$/.test(inputLobbyCode)) {
      alert('Please enter a valid 6-character lobby code.');
      return;
    }
    setJoinedLobbyCode(inputLobbyCode.toUpperCase());
  };

  const handleLeaveLobby = () => {
    setJoinedLobbyCode('');
    setPlayers([]);
    setCurrentScreen('join');
  };

  // Render join lobby input form
  if (currentScreen === 'join') {
    return (
      <div style={styles.container}>
        <h1>Join a Lobby</h1>
        <input
          type="text"
          value={inputLobbyCode}
          onChange={e => setInputLobbyCode(e.target.value.toUpperCase())}
          placeholder="Enter Lobby Code"
          maxLength={6}
          style={styles.input}
          autoFocus
        />
        <button onClick={handleJoinClick} style={styles.joinButton}>Join Lobby</button>
      </div>
    );
  }

  // Render lobby screen before game starts
  if (currentScreen === 'lobby') {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <h1>Lobby</h1>
          <div style={styles.playerCount}>{players.length} / 10</div>
        </header>

        <ChatBox lobbyCode={joinedLobbyCode} username={username} playerId={playerId} />

        <div style={styles.lobbyCodeContainer}>
          <span style={styles.lobbyCodeLabel}>Lobby Code:</span>
          <span style={styles.lobbyCode}>{joinedLobbyCode}</span>
        </div>

        <div style={styles.infoBox}>
          <div style={{ marginBottom: 20 }}>Players in Lobby:</div>
          <ul style={styles.playerList}>
            {players.map((p, i) => (
              <li key={i} style={styles.playerItem}>{p.name}</li>
            ))}
          </ul>
        </div>

        <button style={styles.leaveButton} onClick={handleLeaveLobby}>Leave Lobby</button>
      </div>
    );
  }

  // Render Reveal component in reveal phase
  if (currentScreen === 'reveal') {
    return (
      <Reveal
        lobbyCode={joinedLobbyCode}
        playerId={playerId}
        role={myRole?.role}
        task={myRole?.task}
        socket={socketRef.current}
      />
    );
  }

  // Render Game component
  if (currentScreen === 'game') {
    return (
      <Game
        lobbyCode={joinedLobbyCode}
        playerId={playerId}
        username={username}
        socket={socketRef.current}
      />
    );
  }

  // Fallback (should not happen)
  return null;
}

// Styles - same as your existing
const styles = {
  container: {
    minHeight: '100vh',
    padding: '40px 20px',
    backgroundColor: '#10151a',
    color: '#eee',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: 400,
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  lobbyCodeContainer: {
    backgroundColor: '#222e44',
    padding: '18px 32px',
    borderRadius: 14,
    marginBottom: 36,
    textAlign: 'center',
    userSelect: 'all',
  },
  lobbyCodeLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7ecfff',
    marginRight: 12,
  },
  lobbyCode: {
    fontWeight: 'bold',
    fontSize: 34,
    letterSpacing: 10,
    fontFamily: "'Courier New', Courier, monospace",
    color: '#56CCF2',
  },
  infoBox: {
    background: '#131b2b',
    borderRadius: 14,
    padding: 28,
    width: '100%',
    maxWidth: 360,
    marginBottom: 32,
    boxSizing: 'border-box',
  },
  playerList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    maxHeight: 200,
    overflowY: 'auto',
  },
  playerItem: {
    padding: '12px 8px',
    fontSize: 20,
    borderBottom: '1px solid #21304b',
    color: '#90caf9',
    fontWeight: '500',
  },
  header: {
    width: '100%',
    maxWidth: 360,
    marginBottom: 36,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerCount: {
    backgroundColor: '#222e44',
    color: '#7ecfff',
    padding: '6px 22px',
    borderRadius: 20,
    fontWeight: '600',
    fontSize: 20,
    letterSpacing: 3,
  },
  input: {
    fontSize: 24,
    padding: '14px 20px',
    width: '100%',
    maxWidth: 360,
    marginTop: 32,
    marginBottom: 24,
    borderRadius: 12,
    border: '1px solid #556677',
    backgroundColor: '#1a202c',
    color: '#eee',
    textTransform: 'uppercase',
    letterSpacing: 5,
    outline: 'none',
    boxSizing: 'border-box',
  },
  joinButton: {
    fontSize: 22,
    fontWeight: 'bold',
    padding: '16px 48px',
    borderRadius: 30,
    backgroundColor: '#56CCF2',
    color: '#10151a',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    width: '100%',
    maxWidth: 360,
    userSelect: 'none',
  },
  leaveButton: {
    fontSize: 18,
    padding: '12px 48px',
    borderRadius: 30,
    backgroundColor: '#e05f5f',
    border: 'none',
    cursor: 'pointer',
    marginTop: 32,
    color: 'white',
    width: '100%',
    maxWidth: 360,
    userSelect: 'none',
  },
};
