import React from 'react'
import './footer.css'

const Footer = () => {
  return (
    <footer className="app-footer">
      <span>
        &copy; {new Date().getFullYear()} Field Agents Shadow Protocol &mdash; Created by <span className="footer-creator">Black Flash Builders</span>
      </span>
    </footer>
  )
}

export default Footer