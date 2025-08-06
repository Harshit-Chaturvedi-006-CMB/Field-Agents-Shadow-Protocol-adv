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

  console.log('Reveal: joining lobby', lobbyCode);

  socket.emit('joinLobby', { lobbyCode, player: { id: playerId } });

  socket.on('connect', () => {
    console.log('Reveal socket connected:', socket.id);
  });

  socket.on('revealRoles', ({ roles }) => {
    console.log('RevealRoles received:', roles);
    const myRole = roles.find(r => r.id === playerId);
    setRole(myRole ? myRole.role : '');
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

  return () => socket.disconnect();
}, [lobbyCode, playerId, router]);
    
}
