import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // or useHistory/useNavigate for SPA
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://server-field-agents.onrender.com';

export default function Reveal({ lobbyCode, playerId }) {
  const router = useRouter();
  const [role, setRole] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });

    socket.emit('joinLobby', { lobbyCode, player: { id: playerId } });

    // Listen for revealRoles event and get your role
    socket.on('revealRoles', ({ roles }) => {
      const myRole = roles.find(r => r.id === playerId);
      setRole(myRole ? myRole.role : '');
      setShow(true);

      // After delay, signal reveal done
      setTimeout(() => {
        socket.emit('revealDone', { lobbyCode });
      }, 2500); // 2.5s, can adjust to match animation
    });

    // Listen for goToGame event to route to /game
    socket.on('goToGame', () => {
      router.push('/game');
    });

    return () => socket.disconnect();
  }, [lobbyCode, playerId, router]);

  return (
    <div style={{
      background: 'black',
      color: '#f5e952',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'opacity 0.6s',
      fontFamily: 'monospace',
      fontWeight: 'bold',
      fontSize: '6vw',
      letterSpacing: 8
    }}>
      {show ? <span style={{ fontSize: 72 }}>{role.toUpperCase()}</span> : null}
    </div>
  );
}
