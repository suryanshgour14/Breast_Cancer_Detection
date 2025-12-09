import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import SinglePredict from './pages/SinglePredict'
import Dashboard from './pages/Dashboard'

export default function App() {
  const location = useLocation()

  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 30px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '30px',
  }

  const logoStyle = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    textDecoration: 'none',
  }

  const navLinksStyle = {
    display: 'flex',
    gap: '20px',
  }

  const linkStyle = (path) => ({
    padding: '10px 20px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'all 0.2s',
    backgroundColor: location.pathname === path ? '#3b82f6' : 'transparent',
    color: location.pathname === path ? 'white' : '#4b5563',
  })

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <nav style={navStyle}>
        <Link to="/" style={logoStyle}>
          🎗️ Breast Cancer Detection
        </Link>
        <div style={navLinksStyle}>
          <Link to="/dashboard" style={linkStyle('/dashboard')}>
            📊 Dashboard
          </Link>
          <Link to="/predict" style={linkStyle('/predict')}>
            🔍 Predict
          </Link>
        </div>
      </nav>
      <main style={{ padding: '0 20px', maxWidth: '1600px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/predict" element={<SinglePredict />} />
        </Routes>
      </main>
    </div>
  )
}
