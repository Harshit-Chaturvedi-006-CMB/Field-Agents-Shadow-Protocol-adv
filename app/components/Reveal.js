import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://server-field-agents.onrender.com';

export default function RevealPage({ lobbyCode, playerId }) {
  const router = useRouter();
  const [role, setRole] = useState('');
  const [task, setTask] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });

    socket.emit('joinLobby', { lobbyCode, player: { id: playerId } });

    socket.on('revealRoles', ({ roles }) => {
      const me = roles.find(r => r.id === playerId);
      setRole(me?.role || 'Agent');
      setTask(me?.task || 'No task');
      setShow(true);

      setTimeout(() => {
        socket.emit('revealDone', { lobbyCode });
      }, 2500);
    });

    socket.on('goToGame', () => {
      router.push('/game');
    });

    return () => {
      socket.disconnect();
    };
  }, [lobbyCode, playerId, router]);

  return (
    <div style={{
      background: 'black',
      color: '#f5e952',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '3vw',
      fontFamily: 'monospace',
      fontWeight: 'bold',
      letterSpacing: 6
    }}>
      {show ? (
        <>
          <div style={{ fontSize: '5vw' }}>
            {role.toUpperCase()}
          </div>
          <div style={{ marginTop: 40, color: '#fff78e', fontSize: '2.5vw' }}>
            Task: {task}
          </div>
        </>
      ) : <span>Waiting for assignment...</span>}
    </div>
  );
}
