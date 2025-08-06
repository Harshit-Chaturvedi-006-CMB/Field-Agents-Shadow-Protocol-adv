'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://server-field-agents.onrender.com';

// Optional: Custom marker style (a yellow dot)
const playerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
  shadowSize: [41, 41]
});

export default function PlayerMap({ lobbyCode, playerId, playerName }) {
  const [myCoords, setMyCoords] = useState(null);
  const socketRef = useRef();

  // Initiate geolocation and socket connection
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;
    socket.emit('joinLobby', { lobbyCode, player: { id: playerId, name: playerName } });

    // Watch geolocation
    let watchId;
    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            long: position.coords.longitude
          };
          setMyCoords(coords); // Update local state (for marker movement)
          socket.emit('playerMove', {
            lobbyCode,
            player: { id: playerId, name: playerName },
            coordinates: coords
          });
        },
        (err) => console.error('Geolocation error:', err),
        { enableHighAccuracy: true }
      );
    } else {
      console.warn('Geolocation not available.');
    }

    // Optionally update from server echo (if needed)
    socket.on('playerMoved', ({ player, coordinates }) => {
      if (player.id === playerId) {
        setMyCoords(coordinates);
      }
    });

    return () => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
      socket.disconnect();
    };
  }, [lobbyCode, playerId, playerName]);

  // Don't render map until we have a position
  if (!myCoords) {
    return (
      <div style={{ color: '#aaa', fontFamily: 'monospace', textAlign: 'center', marginTop: 40 }}>
        Getting your location…
      </div>
    );
  }

  return (
    <div style={{ height: 420, width: '100%', margin: '0 auto', maxWidth: 600 }}>
      <MapContainer
        center={[myCoords.lat, myCoords.long]}
        zoom={17}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', borderRadius: 14 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <Marker
          position={[myCoords.lat, myCoords.long]}
          icon={playerIcon}
        />
        <Circle
          center={[myCoords.lat, myCoords.long]}
          radius={12}
          pathOptions={{ fillColor: 'yellow', fillOpacity: 0.2, color: '#e7e91d' }}
        />
      </MapContainer>
      <div style={{ 
        color: '#f5e952', fontFamily: 'monospace', marginTop: 10, textAlign: 'center', letterSpacing: 2
      }}>
        {playerName}: 
        <span style={{ color: '#fff' }}> 
          {myCoords.lat.toFixed(5)}, {myCoords.long.toFixed(5)}
        </span>
      </div>
    </div>
  );
}
