// components/CoordinateSender.js
import { useEffect, useRef } from 'react';

export default function CoordinateSender({ lobbyCode, playerId, playerName, socket }) {
  useEffect(() => {
    if (!socket || !lobbyCode || !playerId) return;

    let watchId;

    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          socket.emit('playerMove', {
            lobbyCode,
            player: { id: playerId, name: playerName },
            coordinates: {
              lat: position.coords.latitude,
              long: position.coords.longitude,
            },
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        { enableHighAccuracy: true }
      );
    } else {
      console.warn('Geolocation is not supported by your browser.');
    }

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [socket, lobbyCode, playerId, playerName]);

  // This component does not render anything visible
  return null;
}
