import { useState, useEffect, useMemo } from 'react'
import { SeverityBadge, ConfidenceBar, DisasterTypeBadge } from '../components/Badges.jsx'
import IncidentDetail from '../components/IncidentDetail.jsx'
import { LoadingState, ErrorState } from '../components/States.jsx'
import { fetchIncidents, verifyIncident, rejectIncident } from '../services/api.js'
import { FALLBACK_INCIDENTS } from '../utils/constants.js'
import { formatDateTime, formatSources } from '../utils/format.js'

export default function Verification() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('Pending')
  const [selected, setSelected] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchIncidents()
      setIncidents(data)
    } catch (err) {
      setError('Unable to connect to server. Showing sample data.')
      setIncidents(FALLBACK_INCIDENTS)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    return incidents
      .filter((inc) => inc.status === tab)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [incidents, tab])

  const counts = useMemo(() => ({
    Pending: incidents.filter((i) => i.status === 'Pending').length,
    Verified: incidents.filter((i) => i.status === 'Verified').length,
    Rejected: incidents.filter((i) => i.status === 'Rejected').length,
  }), [incidents])

  async function handleVerify(id) {
    setActionLoading(id)
    try {
      await verifyIncident(id)
      setIncidents((prev) => prev.map((inc) => inc.incidentId === id ? { ...inc, status: 'Verified' } : inc))
      setToast({ type: 'success', message: `Incident ${id} verified by authorized officer.` })
    } catch (err) {
      setToast({ type: 'error', message: `Failed to verify ${id}. Is the server running?` })
    } finally {
      setActionLoading(null)
      setTimeout(() => setToast(null), 4000)
    }
  }

  async function handleReject(id) {
    setActionLoading(id)
    try {
      await rejectIncident(id)
      setIncidents((prev) => prev.map((inc) => inc.incidentId === id ? { ...inc, status: 'Rejected' } : inc))
      setToast({ type: 'success', message: `Incident ${id} rejected by authorized officer.` })
    } catch (err) {
      setToast({ type: 'error', message: `Failed to reject ${id}. Is the server running?` })
    } finally {
      setActionLoading(null)
      setTimeout(() => setToast(null), 4000)
    }
  }

  if (loading) return <LoadingState message="Loading verification queue..." />

  return (
    <div className="page">
      {error && <div className="banner banner-warning">{error}</div>}
      {toast && <div className={`banner banner-${toast.type === 'success' ? 'success' : 'error'}`}>{toast.message}</div>}

      <div className="verification-note">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>AI assists the officer by classifying and scoring incidents. Final verification is performed by an authorized human officer only. The AI does not automatically declare any incident as fully verified.</span>
      </div>

      <div className="tab-bar">
        {['Pending', 'Verified', 'Rejected'].map((status) => (
          <button
            key={status}
            className={`tab ${tab === status ? 'active' : ''}`}
            onClick={() => setTab(status)}
          >
            {status} ({counts[status]})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <div className="state-container">
              <p className="state-text">No {tab.toLowerCase()} incidents</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="verification-list">
          {filtered.map((incident) => (
            <div key={incident.incidentId} className="card verification-card">
              <div className="verification-card-header">
                <div className="verification-card-id">
                  <span className="mono">{incident.incidentId}</span>
                  <DisasterTypeBadge type={incident.disasterType} />
                </div>
                <SeverityBadge severity={incident.severity} />
              </div>
              <div className="verification-card-body">
                <p className="verification-desc">{incident.description}</p>
                <div className="verification-meta">
                  <div><strong>Location:</strong> {incident.location}</div>
                  <div><strong>Sources:</strong> {formatSources(incident.sources)}</div>
                  <div><strong>Supporting Reports:</strong> {incident.supportingReports}</div>
                  <div><strong>Time:</strong> {formatDateTime(incident.createdAt)}</div>
                </div>
                <div className="verification-confidence">
                  <span>Confidence Score</span>
                  <ConfidenceBar value={incident.confidence} />
                </div>
                {incident.aiAnalysis && (
                  <div className="verification-ai">
                    <strong>AI Assessment:</strong> {incident.aiAnalysis.detectedType} · {incident.aiAnalysis.severityAssessment} · {incident.aiAnalysis.confidenceScore}% NLP confidence
                  </div>
                )}
              </div>
              <div className="verification-card-actions">
                <button className="btn btn-secondary btn-small" onClick={() => setSelected(incident)}>
                  View Evidence
                </button>
                {tab === 'Pending' && (
                  <>
                    <button
                      className="btn btn-success btn-small"
                      onClick={() => handleVerify(incident.incidentId)}
                      disabled={actionLoading === incident.incidentId}
                    >
                      {actionLoading === incident.incidentId ? 'Processing...' : 'Verify'}
                    </button>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleReject(incident.incidentId)}
                      disabled={actionLoading === incident.incidentId}
                    >
                      {actionLoading === incident.incidentId ? 'Processing...' : 'Reject'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && <IncidentDetail incident={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
