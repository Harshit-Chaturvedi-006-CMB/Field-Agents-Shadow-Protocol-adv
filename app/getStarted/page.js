import React from 'react'
import Link from 'next/link'
import './getStarted.css'

const GetStartedPage = () => {
  return (
    <div className="getstarted-container">
      <div className="getstarted-content">
        <h2 className="getstarted-title">Get Started</h2>
        <div className="getstarted-links">
          <Link href="/Lobbyc" className="getstarted-link">Create Lobby</Link>
          <Link href="/lobbyj" className="getstarted-link">Join Lobby</Link>
        </div>
      </div>
    </div>
  )
}

export default GetStartedPage