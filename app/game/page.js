'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://server-field-agents.onrender.com';

export default function LobbyPage() {
  const router = useRouter();
  const [lobbyCode, setLobbyCode] = useState('ABC123'); // set dynamically as needed
  const [players, setPlayers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    // Join lobby and handle updates
    socket.emit('joinLobby', { lobbyCode, player: { id: 'player1', name: 'Agent Smith' } });

    socket.on('lobbyUpdate', (lobby) => {
      setPlayers(lobby.players || []);
    });

    return () => {
      socket.disconnect();
    };
  }, [lobbyCode]);

  const handleStartGame = () => {
    if (socketRef.current) {
      socketRef.current.emit('startGame', { lobbyCode });
    }
    // Navigate to Reveal page
    router.push('/reveal');
  };

  return (
    <div>
      <h1>Lobby</h1>
      <div>Lobby Code: {lobbyCode}</div>
      <h2>Players:</h2>
      <ul>
        {players.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>

      <button disabled={players.length < 2} onClick={handleStartGame}>
        Start Game
      </button>
    </div>
  );
}
