'use client';

import { useEffect, useState } from 'react';

export default function Game({ socket, lobbyCode, playerId, username }) {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!socket || !lobbyCode) return;

    // Listen for lobby updates (player info) during the game
    const handleLobbyUpdate = (lobby) => {
      setPlayers(lobby.players || []);
    }; 

    socket.on('lobbyUpdate', handleLobbyUpdate);

    // Optionally listen for player movements and update UI accordingly
    socket.on('playerMoved', (data) => {
      setPlayers((prevPlayers) => {
        const index = prevPlayers.findIndex(p => p.id === data.player.id);
        if (index !== -1) {
          const updatedPlayers = [...prevPlayers];
          updatedPlayers[index] = { ...updatedPlayers[index], coordinates: data.coordinates };
          return updatedPlayers;
        }
        return prevPlayers;
      });
    });

    // Clean up listeners on unmount
    return () => {
      socket.off('lobbyUpdate', handleLobbyUpdate);
      socket.off('playerMoved');
    };
  }, [socket, lobbyCode]);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Game Started!</h1>
        <div style={styles.lobbyCode}>Lobby: {lobbyCode}</div>
        <div>Welcome, {username}!</div>
      </header>

      <div style={styles.gameArea}>
        {/* Replace this with your actual game map or UI */}
        <div style={styles.mapPlaceholder}>[Game map or area goes here]</div>

        <aside style={styles.playerListContainer}>
          <h2>Players:</h2>
          <ul style={styles.playerList}>
            {players.map((p) => (
              <li key={p.id} style={p.id === playerId ? styles.currentPlayer : null}>
                {p.name} {p.id === playerId && '(You)'}
                {p.coordinates ? (
                  <span style={styles.coordinates}>
                    {" "}
                    - ({p.coordinates.lat.toFixed(3)}, {p.coordinates.long.toFixed(3)})
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    minHeight: '100vh',
    padding: 20,
    backgroundColor: '#10151a',
    color: '#eee',
  },
  header: {
    marginBottom: 20,
  },
  lobbyCode: {
    fontWeight: '600',
    fontSize: 18,
    marginBottom: 4,
  },
  gameArea: {
    display: 'flex',
    gap: 20,
  },
  mapPlaceholder: {
    flex: 1,
    border: '2px solid #4fa1f2',
    borderRadius: 12,
    height: 400,
    backgroundColor: '#1a2330',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    color: '#4fa1f2',
    userSelect: 'none',
  },
  playerListContainer: {
    width: 200,
    backgroundColor: '#131b2b',
    borderRadius: 12,
    padding: 16,
  },
  playerList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  currentPlayer: {
    fontWeight: 'bold',
    color: '#7ecfff',
  },
  coordinates: {
    fontSize: 12,
    color: '#829bd9',
    fontWeight: '400',
  },
};
