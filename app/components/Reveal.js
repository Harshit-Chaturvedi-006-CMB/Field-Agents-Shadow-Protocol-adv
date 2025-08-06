'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://server-field-agents.onrender.com';

export default function Reveal({ lobbyCode, playerId, socket: passedSocket }) {
  const router = useRouter();
  const [role, setRole] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!lobbyCode || !playerId) return;

    const socket = passedSocket || io(SOCKET_URL, { transports: ['websocket'] });

    console.log('Reveal: joining lobby', lobbyCode);

    socket.emit('joinLobby', { lobbyCode, player: { id: playerId } });

    socket.on('connect', () => {
      console.log('Reveal socket connected:', socket.id);
    });

    socket.on('revealRoles', ({ roles }) => {
      console.log('RevealRoles received:', roles);
      const myRole = roles.find(r => r.id === playerId);
      setRole(myRole ? myRole.role : 'Unknown Role');
      setShow(true);

      setTimeout(() => {
        socket.emit('revealDone', { lobbyCode });
      }, 2500);
    });

    socket.on('goToGame', () => {
      console.log('GoToGame received; routing');
      router.push('/game');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socket.off('revealRoles');
      socket.off('goToGame');
      socket.off('disconnect');
      if (!passedSocket) socket.disconnect();
    };
  }, [lobbyCode, playerId, router, passedSocket]);

  return (
    <div
      style={{
        background: 'black',
        color: '#f5e952',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        fontSize: '6vw',
        letterSpacing: 8,
      }}
    >
      {show ? <span style={{ fontSize: 72 }}>{role.toUpperCase()}</span> : <span>Waiting for role...</span>}
    </div>
  );
}
