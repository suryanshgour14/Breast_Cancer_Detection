import React from 'react'
import FeatureForm from '../components/FeatureForm'

export default function SinglePredict() {
  return (
    <div style={styles.container}>
      <div style={styles.heroSection}>
        <div style={styles.header}>
          <div style={styles.iconBadge}>🔬</div>
          <h1 style={styles.title}>Single Patient Prediction</h1>
          <p style={styles.subtitle}>
            Enter diagnostic features to estimate cancer probability
          </p>
          <div style={styles.warningBadge}>
            <span style={styles.warningIcon}>⚕️</span>
            <span>Educational use only - Not for medical diagnosis</span>
          </div>
        </div>
      </div>
      <div style={styles.content}>
        <FeatureForm />
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px',
  },
  heroSection: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    padding: '50px 30px',
    marginBottom: '30px',
    boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)',
  },
  header: {
    textAlign: 'center',
    color: 'white',
  },
  iconBadge: {
    fontSize: '48px',
    marginBottom: '15px',
  },
  title: {
    fontSize: '36px',
    fontWeight: '700',
    color: 'white',
    marginBottom: '15px',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  subtitle: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.95)',
    marginBottom: '20px',
  },
  warningBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '10px 20px',
    borderRadius: '25px',
    fontSize: '14px',
    fontWeight: '500',
    backdropFilter: 'blur(10px)',
  },
  warningIcon: {
    fontSize: '18px',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
  },
}
