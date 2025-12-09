import React, { useEffect, useState } from 'react'
import api from '../api/client'

export default function FeatureForm() {
  const [features, setFeatures] = useState([])
  const [values, setValues] = useState({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    api.get('/features').then(res => {
      setFeatures(res.data)
      const init = {}
      res.data.forEach(f => (init[f] = ''))
      setValues(init)
    }).catch(() => {})
  }, [])

  const onChange = (name, value) => setValues(prev => ({ ...prev, [name]: value }))

  const onSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const numericFeatures = {}
      for (const k of Object.keys(values)) numericFeatures[k] = parseFloat(values[k])
      const res = await api.post('/predict', { features: numericFeatures })
      setResult(res.data)
    } catch (err) {
      console.error(err)
      alert('Prediction failed: ' + (err?.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
    }
  }

  const categorizeFeatures = (features) => {
    const categories = {
      'Mean Values': [],
      'Standard Error': [],
      'Worst Values': []
    }
    
    features.forEach(name => {
      if (name.includes('error')) {
        categories['Standard Error'].push(name)
      } else if (name.includes('worst')) {
        categories['Worst Values'].push(name)
      } else {
        categories['Mean Values'].push(name)
      }
    })
    
    return categories
  }

  if (!features.length) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading features...</p>
      </div>
    )
  }

  const categorizedFeatures = categorizeFeatures(features)

  return (
    <div>
      <form onSubmit={onSubmit}>
        {Object.entries(categorizedFeatures).map(([category, categoryFeatures]) => (
          categoryFeatures.length > 0 && (
            <div key={category} style={styles.section}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>{category}</h3>
                <span style={styles.sectionBadge}>{categoryFeatures.length} features</span>
              </div>
              <div style={styles.grid}>
                {categoryFeatures.map(name => (
                  <div key={name} style={styles.inputGroup}>
                    <label style={styles.label}>
                      {name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                    <input
                      style={styles.input}
                      value={values[name] ?? ''}
                      onChange={e => onChange(name, e.target.value)}
                      type="number"
                      step="any"
                      placeholder="Enter value"
                      required
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
        
        <div style={styles.buttonContainer}>
          <button type="submit" disabled={loading} style={styles.submitButton}>
            {loading ? (
              <>
                <span style={styles.buttonSpinner}></span>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <span>🔬</span>
                <span>Run Prediction</span>
              </>
            )}
          </button>
        </div>
      </form>

      {result && (
        <div style={styles.resultContainer}>
          <div style={styles.resultHeader}>
            <h3 style={styles.resultTitle}>Prediction Results</h3>
          </div>
          <div style={styles.resultContent}>
            <div style={{
              ...styles.predictionCard,
              background: result.prediction === 1 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
            }}>
              <div style={styles.predictionIcon}>
                {result.prediction === 1 ? '✓' : '⚠'}
              </div>
              <div style={styles.predictionLabel}>Diagnosis</div>
              <div style={styles.predictionValue}>
                {result.prediction === 1 ? 'Benign' : 'Malignant'}
              </div>
            </div>
            
            <div style={styles.probabilitiesGrid}>
              <div style={styles.probabilityCard}>
                <div style={styles.probabilityHeader}>
                  <span style={styles.probabilityIcon}>💚</span>
                  <span style={styles.probabilityLabel}>Benign</span>
                </div>
                <div style={styles.probabilityValue}>
                  {(result.probability_benign * 100).toFixed(2)}%
                </div>
                <div style={styles.progressBar}>
                  <div style={{
                    ...styles.progressFill,
                    width: `${result.probability_benign * 100}%`,
                    backgroundColor: '#10b981'
                  }}></div>
                </div>
              </div>
              
              <div style={styles.probabilityCard}>
                <div style={styles.probabilityHeader}>
                  <span style={styles.probabilityIcon}>❤️</span>
                  <span style={styles.probabilityLabel}>Malignant</span>
                </div>
                <div style={styles.probabilityValue}>
                  {(result.probability_malignant * 100).toFixed(2)}%
                </div>
                <div style={styles.progressBar}>
                  <div style={{
                    ...styles.progressFill,
                    width: `${result.probability_malignant * 100}%`,
                    backgroundColor: '#ef4444'
                  }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div style={styles.disclaimer}>
            <span style={{fontSize: '16px'}}>⚕️</span>
            <span>This prediction is for educational purposes only and should not be used for medical diagnosis. Always consult with healthcare professionals.</span>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    gap: '20px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: '16px',
  },
  section: {
    marginBottom: '35px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    padding: '15px 20px',
    background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
    borderRadius: '10px',
    borderLeft: '4px solid #667eea',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
  },
  sectionBadge: {
    backgroundColor: '#667eea',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    padding: '12px 16px',
    fontSize: '14px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s',
    backgroundColor: '#ffffff',
  },
  buttonContainer: {
    marginTop: '40px',
    display: 'flex',
    justifyContent: 'center',
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 48px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  },
  buttonSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  resultContainer: {
    marginTop: '40px',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  },
  resultHeader: {
    background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
    padding: '20px 30px',
  },
  resultTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'white',
    margin: 0,
  },
  resultContent: {
    padding: '30px',
    backgroundColor: '#f9fafb',
  },
  predictionCard: {
    padding: '30px',
    borderRadius: '12px',
    textAlign: 'center',
    color: 'white',
    marginBottom: '30px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
  },
  predictionIcon: {
    fontSize: '48px',
    marginBottom: '10px',
  },
  predictionLabel: {
    fontSize: '14px',
    opacity: 0.9,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: '600',
  },
  predictionValue: {
    fontSize: '32px',
    fontWeight: '700',
    marginTop: '10px',
  },
  probabilitiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  probabilityCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  probabilityHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '15px',
  },
  probabilityIcon: {
    fontSize: '24px',
  },
  probabilityLabel: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151',
  },
  probabilityValue: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '15px',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    transition: 'width 0.6s ease',
    borderRadius: '4px',
  },
  disclaimer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px',
    backgroundColor: '#fef3c7',
    borderRadius: '0 0 16px 16px',
    fontSize: '14px',
    color: '#92400e',
    lineHeight: '1.6',
  },
}
