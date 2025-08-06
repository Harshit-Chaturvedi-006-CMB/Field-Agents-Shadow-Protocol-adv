'use client';

import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://server-field-agents.onrender.com';

import Reveal from './Reveal';  // Adjust path
import Game from '@/components/game';     // Adjust path
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

  // Persistent socket instance across component lifetime
  const socketRef = useRef(null);

  // Initialize socket once on mount only
  useEffect(() => {
    console.log('Initializing socket connection...');
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.warn('Socket disconnected');
    });

    // Optional: handle general socket errors here

    // Cleanup on unmount
    return () => {
      console.log('Disconnecting socket on unmount...');
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // empty deps → run once

  // Handle lobby join/leaves dynamically
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // If no lobby code, leave all rooms and reset states
    if (!joinedLobbyCode) {
      console.log('No joinedLobbyCode, clearing players & resetting screen...');
      setPlayers([]);
      setMyRole(null);
      setCurrentScreen('join');
      socket.emit('leaveLobby', { lobbyCode: '', playerId });
      return;
    }

    // Join the lobby room
    console.log(`Joining lobby: ${joinedLobbyCode} as player ${playerId}`);
    socket.emit('joinLobby', { lobbyCode: joinedLobbyCode, player: { id: playerId, name: username } });

    // Setup event listeners for lobby lifecycle
    const onLobbyUpdate = (lobby) => {
      console.log('Lobby update received:', lobby);
      setPlayers(lobby.players || []);
      if (currentScreen !== 'lobby') setCurrentScreen('lobby');
    };

    const onRevealRoles = ({ roles }) => {
      console.log('Reveal roles received:', roles);
      const roleObj = roles.find(r => r.id === playerId);
      setMyRole(roleObj || { role: 'Agent', task: 'No task assigned' });
      setCurrentScreen('reveal');
    };

    const onGoToGame = () => {
      console.log('goToGame event received, switching to game screen');
      setCurrentScreen('game');
    };

    socket.on('lobbyUpdate', onLobbyUpdate);
    socket.on('revealRoles', onRevealRoles);
    socket.on('goToGame', onGoToGame);

    // Cleanup when lobbyCode or playerId changes or on component unmount
    return () => {
      socket.off('lobbyUpdate', onLobbyUpdate);
      socket.off('revealRoles', onRevealRoles);
      socket.off('goToGame', onGoToGame);
      console.log(`Leaving lobby: ${joinedLobbyCode} as player ${playerId}`);
      socket.emit('leaveLobby', { lobbyCode: joinedLobbyCode, playerId });
      
      // Reset UI states only if we are leaving lobby screen explicitly
      // but we avoid resetting here to keep UI stable during transitions
    };
  }, [joinedLobbyCode, playerId, username, currentScreen]);

  // Join lobby button handler
  const handleJoinClick = () => {
    const code = inputLobbyCode.trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(code)) {
      alert('Please enter a valid 6-character lobby code.');
      return;
    }
    setJoinedLobbyCode(code);
  };

  // Leave lobby button handler
  const handleLeaveLobby = () => {
    setJoinedLobbyCode('');
    setPlayers([]);
    setMyRole(null);
    setCurrentScreen('join');
  };

  // ---- UI Rendering ----

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

  return null;
}


// ---- Styles ----
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
