import React from 'react'
import Link from 'next/link'
import './home.css'

const HomePage = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Field Agents: Shadow Protocol</h1>
        <p className="home-description">
          Step into the shadows as a covert agent. Unravel secrets, complete daring missions, and outsmart your rivals in this thrilling strategy game. Are you ready to join the protocol?
        </p>
        <div className="home-buttons">
          <Link href="/login" className="home-btn login-btn">Login</Link>
          <Link href="/signup" className="home-btn signup-btn">Sign Up</Link>
        </div>
      </div>
    </div>
  )
}

export default HomePage