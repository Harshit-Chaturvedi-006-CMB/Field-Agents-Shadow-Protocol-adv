'use client';

import { useState } from 'react';
import Lobby from './Lobby';
import Joinlobby from './Jlobby';


// For demo, get user name (could be from auth or localStorage in real app)
const getUserName = () => {
  // Replace with your actual logic
  return typeof window !== "undefined" ? (JSON.parse(localStorage.getItem('fieldAgentsUser'))).username || 'Player' : 'Player';
};

export default function GamePhasor() {
  const [view, setView] = useState('menu');
  const userName = getUserName();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#111',
        color: '#eee',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Top Centered Username */}
      <div
        style={{
          padding: '32px 0 40px',
          textAlign: 'center',
          fontSize: 26,
          fontWeight: 'bold',
          letterSpacing: '2px'
        }}
      >
        {userName}
      </div>

      {/* Central Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {view === 'menu' && (
          <div style={{ display: 'flex', gap: 40 }}>
            {/* Animated Buttons */}
            <button
              onClick={() => setView('create')}
              style={{
                fontSize: 22,
                padding: '20px 40px',
                margin: '0 12px',
                border: 'none',
                borderRadius: 16,
                background: 'linear-gradient(90deg,#4286f4,#373B44)',
                color: 'white',
                cursor: 'pointer',
                boxShadow: '0 6px 24px #222',
                transition: 'transform 0.2s',
                animation: 'bounce 1.5s infinite'
              }}
            >
              Create Lobby
            </button>
            <button
              onClick={() => setView('join')}
              style={{
                fontSize: 22,
                padding: '20px 40px',
                margin: '0 12px',
                border: 'none',
                borderRadius: 16,
                background: 'linear-gradient(90deg,#56CCF2,#2F80ED)',
                color: 'white',
                cursor: 'pointer',
                boxShadow: '0 6px 24px #222',
                transition: 'transform 0.2s',
                animation: 'bounce 1.8s infinite'
              }}
            >
              Join Lobby
            </button>
            {/* Add keyframes for bounce animation */}
            <style>
              {`
                @keyframes bounce {
                  0%, 100% { transform: translateY(0);}
                  50% { transform: translateY(-16px);}
                }
              `}
            </style>
          </div>
        )}
        {view === 'create' && <Lobby />}
        {view === 'join' && <Joinlobby />}
      </div>
    </div>
  );
}
