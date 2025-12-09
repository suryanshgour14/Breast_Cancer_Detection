import React, { useState, useEffect } from 'react'
import api from '../api/client'

export default function Dashboard() {
  const [metrics, setMetrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const response = await api.get('/models/metrics')
      setMetrics(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load metrics. Please ensure the backend is running.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceColor = (value) => {
    if (value >= 0.95) return '#10b981' // green
    if (value >= 0.90) return '#3b82f6' // blue
    if (value >= 0.85) return '#f59e0b' // orange
    return '#ef4444' // red
  }

  const formatPercent = (value) => (value * 100).toFixed(2) + '%'

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading model metrics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h3>⚠️ Error</h3>
          <p>{error}</p>
          <button onClick={fetchMetrics} style={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  const topModel = metrics[0]

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Model Performance Dashboard</h1>
        <p style={styles.subtitle}>
          Comprehensive analysis of {metrics.length} machine learning models
        </p>
      </div>

      {/* Best Model Highlight */}
      {topModel && (
        <div style={styles.bestModelCard}>
          <div style={styles.bestModelBadge}>🏆 Best Model</div>
          <h2 style={styles.bestModelName}>{topModel.model}</h2>
          <div style={styles.bestModelMetrics}>
            <div style={styles.bestMetric}>
              <span style={styles.metricValue}>{formatPercent(topModel.roc_auc)}</span>
              <span style={styles.metricLabel}>ROC-AUC</span>
            </div>
            <div style={styles.bestMetric}>
              <span style={styles.metricValue}>{formatPercent(topModel.f1)}</span>
              <span style={styles.metricLabel}>F1 Score</span>
            </div>
            <div style={styles.bestMetric}>
              <span style={styles.metricValue}>{formatPercent(topModel.accuracy)}</span>
              <span style={styles.metricLabel}>Accuracy</span>
            </div>
            <div style={styles.bestMetric}>
              <span style={styles.metricValue}>
                {formatPercent(topModel.cv_mean_roc_auc)} 
                <span style={{fontSize: '14px', color: '#888'}}>
                  {' '}±{formatPercent(topModel.cv_std_roc_auc)}
                </span>
              </span>
              <span style={styles.metricLabel}>CV ROC-AUC</span>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Comparison Table */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Performance Metrics Comparison</h2>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Rank</th>
                <th style={{...styles.th, textAlign: 'left'}}>Model</th>
                <th style={styles.th}>ROC-AUC</th>
                <th style={styles.th}>F1 Score</th>
                <th style={styles.th}>Accuracy</th>
                <th style={styles.th}>CV Mean</th>
                <th style={styles.th}>CV Std</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric, index) => (
                <tr key={metric.model} style={styles.tableRow}>
                  <td style={styles.td}>
                    <span style={styles.rank}>{index + 1}</span>
                  </td>
                  <td style={{...styles.td, textAlign: 'left', fontWeight: '600'}}>
                    {metric.model}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: getPerformanceColor(metric.roc_auc) + '20',
                      color: getPerformanceColor(metric.roc_auc)
                    }}>
                      {formatPercent(metric.roc_auc)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: getPerformanceColor(metric.f1) + '20',
                      color: getPerformanceColor(metric.f1)
                    }}>
                      {formatPercent(metric.f1)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: getPerformanceColor(metric.accuracy) + '20',
                      color: getPerformanceColor(metric.accuracy)
                    }}>
                      {formatPercent(metric.accuracy)}
                    </span>
                  </td>
                  <td style={styles.td}>{formatPercent(metric.cv_mean_roc_auc)}</td>
                  <td style={styles.td}>{formatPercent(metric.cv_std_roc_auc)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Comparisons */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Visual Performance Comparison</h2>
        <div style={styles.chartsGrid}>
          {/* ROC-AUC Bar Chart */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>ROC-AUC Scores</h3>
            <div style={styles.barChartContainer}>
              {metrics.map((metric) => (
                <div key={metric.model} style={styles.barRow}>
                  <span style={styles.barLabel}>{metric.model}</span>
                  <div style={styles.barWrapper}>
                    <div
                      style={{
                        ...styles.bar,
                        width: `${metric.roc_auc * 100}%`,
                        backgroundColor: getPerformanceColor(metric.roc_auc)
                      }}
                    >
                      <span style={styles.barValue}>{formatPercent(metric.roc_auc)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* F1 Score Bar Chart */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>F1 Scores</h3>
            <div style={styles.barChartContainer}>
              {metrics.map((metric) => (
                <div key={metric.model} style={styles.barRow}>
                  <span style={styles.barLabel}>{metric.model}</span>
                  <div style={styles.barWrapper}>
                    <div
                      style={{
                        ...styles.bar,
                        width: `${metric.f1 * 100}%`,
                        backgroundColor: getPerformanceColor(metric.f1)
                      }}
                    >
                      <span style={styles.barValue}>{formatPercent(metric.f1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accuracy Bar Chart */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Accuracy Scores</h3>
            <div style={styles.barChartContainer}>
              {metrics.map((metric) => (
                <div key={metric.model} style={styles.barRow}>
                  <span style={styles.barLabel}>{metric.model}</span>
                  <div style={styles.barWrapper}>
                    <div
                      style={{
                        ...styles.bar,
                        width: `${metric.accuracy * 100}%`,
                        backgroundColor: getPerformanceColor(metric.accuracy)
                      }}
                    >
                      <span style={styles.barValue}>{formatPercent(metric.accuracy)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ROC Curves */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>ROC Curves</h2>
        <div style={styles.imageCard}>
          <img
            src="http://localhost:8000/static/roc_curves.png"
            alt="ROC Curves Comparison"
            style={styles.image}
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'block'
            }}
          />
          <div style={{...styles.imageError, display: 'none'}}>
            <p>⚠️ ROC curves image not available. Please train the models first.</p>
          </div>
        </div>
      </div>

      {/* Confusion Matrices */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Confusion Matrices</h2>
        <div style={styles.confusionMatrixGrid}>
          {metrics.map((metric) => {
            const safeName = metric.model.replace(/ /g, '_')
            return (
              <div key={metric.model} style={styles.confusionMatrixCard}>
                <h4 style={styles.confusionMatrixTitle}>{metric.model}</h4>
                <img
                  src={`http://localhost:8000/static/confusion_matrices/${safeName}.png`}
                  alt={`${metric.model} Confusion Matrix`}
                  style={styles.confusionMatrixImage}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div style={{...styles.imageError, display: 'none'}}>
                  <p style={{fontSize: '12px'}}>Image not available</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Metrics Legend */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Metrics Explanation</h2>
        <div style={styles.legendGrid}>
          <div style={styles.legendCard}>
            <h4 style={styles.legendTitle}>ROC-AUC</h4>
            <p style={styles.legendText}>
              Receiver Operating Characteristic - Area Under Curve. Measures the model's ability
              to distinguish between classes. Higher is better (0.5 = random, 1.0 = perfect).
            </p>
          </div>
          <div style={styles.legendCard}>
            <h4 style={styles.legendTitle}>F1 Score</h4>
            <p style={styles.legendText}>
              Harmonic mean of precision and recall. Balances false positives and false negatives.
              Range: 0-1, where 1 is perfect.
            </p>
          </div>
          <div style={styles.legendCard}>
            <h4 style={styles.legendTitle}>Accuracy</h4>
            <p style={styles.legendText}>
              Percentage of correct predictions. Simple overall performance metric.
              Can be misleading with imbalanced datasets.
            </p>
          </div>
          <div style={styles.legendCard}>
            <h4 style={styles.legendTitle}>CV Mean/Std</h4>
            <p style={styles.legendText}>
              Cross-validation mean and standard deviation. Indicates model stability
              across different data splits. Lower std = more stable.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '20px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    border: '1px solid #fca5a5',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: '10px',
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  header: {
    marginBottom: '30px',
    textAlign: 'center',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
  },
  bestModelCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    padding: '30px',
    marginBottom: '30px',
    color: 'white',
    position: 'relative',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  },
  bestModelBadge: {
    display: 'inline-block',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '10px',
  },
  bestModelName: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '20px',
  },
  bestModelMetrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px',
  },
  bestMetric: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  metricValue: {
    fontSize: '24px',
    fontWeight: '700',
  },
  metricLabel: {
    fontSize: '14px',
    opacity: 0.9,
  },
  section: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '2px solid #e5e7eb',
  },
  tableContainer: {
    overflowX: 'auto',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
  },
  th: {
    padding: '12px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '600',
    color: '#6b7280',
    borderBottom: '2px solid #e5e7eb',
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb',
  },
  td: {
    padding: '12px',
    textAlign: 'center',
    fontSize: '14px',
  },
  rank: {
    display: 'inline-block',
    width: '30px',
    height: '30px',
    lineHeight: '30px',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '50%',
    fontWeight: '600',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '13px',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px',
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  chartTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '15px',
    color: '#1f2937',
  },
  barChartContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  barRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  barLabel: {
    fontSize: '12px',
    minWidth: '140px',
    fontWeight: '500',
    color: '#4b5563',
  },
  barWrapper: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: '4px',
    height: '24px',
    position: 'relative',
  },
  bar: {
    height: '100%',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: '8px',
    transition: 'width 0.3s ease',
  },
  barValue: {
    color: 'white',
    fontSize: '11px',
    fontWeight: '600',
  },
  imageCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  image: {
    width: '100%',
    height: 'auto',
    borderRadius: '4px',
  },
  imageError: {
    textAlign: 'center',
    padding: '40px',
    color: '#6b7280',
  },
  confusionMatrixGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  confusionMatrixCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '15px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  confusionMatrixTitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '10px',
    color: '#1f2937',
    textAlign: 'center',
  },
  confusionMatrixImage: {
    width: '100%',
    height: 'auto',
    borderRadius: '4px',
  },
  legendGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  legendCard: {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '20px',
    border: '1px solid #e5e7eb',
  },
  legendTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '10px',
  },
  legendText: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.6',
  },
}
