'use client';

import { useEffect, useState, useRef } from 'react';

// You'll need to install these dependencies:
// npm install react-leaflet leaflet
// Also, add Leaflet CSS in your root layout or _app.js:
// import 'leaflet/dist/leaflet.css';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icon issue with webpack:
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function PhaseMap({ players }) {
  // players is an array of objects with structure like:
  // { playerName: 'Alice', coordinates: { lat: 12.34, long: 56.78 } }

  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by your browser');
      return;
    }
    const watcherId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          long: position.coords.longitude,
        });
      },
      (error) => console.error('Geolocation error:', error),
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000,
      }
    );
    return () => navigator.geolocation.clearWatch(watcherId);
  }, []);

  // Default center on user location if available or else fallback coordinates
  const center = userLocation
    ? [userLocation.lat, userLocation.long]
    : players.length > 0 && players[0].coordinates
    ? [players[0].coordinates.lat, players[0].coordinates.long]
    : [0, 0];

  return (
    <div style={{ height: '500px', width: '100%', marginTop: 24 }}>
      <MapContainer center={center} zoom={15} scrollWheelZoom style={{ height: 500 }}>
  <TileLayer
    attribution='&copy; OpenStreetMap contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />

  {/* All player markers */}
  {players.map((player, idx) => (
    player.coordinates ? (
      <Marker key={player.id} position={[player.coordinates.lat, player.coordinates.long]}>
        <Popup>{player.name}</Popup>
      </Marker>
    ) : null
  ))}

  {/* Objective markers and radius circles */}
  {objectives.map((obj, i) => (
    <Marker key={i} position={[obj.lat, obj.long]}>
      <Popup>Objective: {obj.label}</Popup>
    </Marker>
  ))}
  {objectives.map((obj, i) => (
    <Circle
      key={i}
      center={[obj.lat, obj.long]}
      radius={obj.radius} // in meters
      pathOptions={{ color: '#2196F3', fillOpacity: 0.2 }}
    />
  ))}
</MapContainer>

    </div>
  );
}
