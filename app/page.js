import React from 'react'
import Link from 'next/link'
import './welcome.css'


export default function Home() {
  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1 className="welcome-title">Welcome to Field Agents: Shadow Protocol</h1>
        <p className="welcome-description">
          Enter a world of espionage, strategy, and intrigue. Prepare to step into the shadows and become a legend among agents.
        </p>
        <Link href="/home" className="welcome-link">Ready !</Link>
      </div>
    </div>
  );
}
