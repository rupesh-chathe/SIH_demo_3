import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { SeverityBadge, StatusBadge, ConfidenceBar, DisasterTypeBadge } from '../components/Badges.jsx'
import DisasterMap from '../components/DisasterMap.jsx'
import { LoadingState, ErrorState } from '../components/States.jsx'
import { fetchIncident } from '../services/api.js'
import { FALLBACK_INCIDENTS } from '../utils/constants.js'
import { formatDateTime, formatSources } from '../utils/format.js'

export default function IncidentDetailPage() {
  const { id } = useParams()
  const [incident, setIncident] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchIncident(id)
        setIncident(data)
      } catch (err) {
        const fallback = FALLBACK_INCIDENTS.find((i) => i.incidentId === id)
        if (fallback) {
          setError('Unable to connect to server. Showing sample data.')
          setIncident(fallback)
        } else {
          setError('Incident not found')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return <LoadingState message="Loading incident..." />
  if (!incident) return <ErrorState message={error || 'Incident not found'} />

  return (
    <div className="page">
      {error && <div className="banner banner-warning">{error}</div>}

      <div className="detail-page-header">
        <div>
          <Link to="/incidents" className="back-link">&larr; Back to Live Incidents</Link>
          <h2 className="page-title">{incident.incidentId}</h2>
          <div className="page-subtitle">
            <DisasterTypeBadge type={incident.disasterType} />
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
          </div>
        </div>
      </div>

      <div className="detail-page-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Incident Information</h3>
          </div>
          <div className="card-body">
            <div className="detail-row"><span className="detail-label">Incident ID</span><span className="mono">{incident.incidentId}</span></div>
            <div className="detail-row"><span className="detail-label">Disaster Type</span><span>{incident.disasterType}</span></div>
            <div className="detail-row"><span className="detail-label">Description</span><span>{incident.description}</span></div>
            <div className="detail-row"><span className="detail-label">Location</span><span>{incident.location}</span></div>
            <div className="detail-row"><span className="detail-label">Latitude</span><span className="mono">{incident.latitude}</span></div>
            <div className="detail-row"><span className="detail-label">Longitude</span><span className="mono">{incident.longitude}</span></div>
            <div className="detail-row"><span className="detail-label">Date & Time</span><span>{formatDateTime(incident.createdAt)}</span></div>
            <div className="detail-row"><span className="detail-label">Severity</span><SeverityBadge severity={incident.severity} /></div>
            <div className="detail-row"><span className="detail-label">Confidence Score</span><ConfidenceBar value={incident.confidence} /></div>
            <div className="detail-row"><span className="detail-label">Sources</span><span>{formatSources(incident.sources)}</span></div>
            <div className="detail-row"><span className="detail-label">Supporting Reports</span><span>{incident.supportingReports}</span></div>
            <div className="detail-row"><span className="detail-label">Status</span><StatusBadge status={incident.status} /></div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">AI / NLP Analysis</h3>
          </div>
          <div className="card-body">
            <div className="ai-note">
              AI assists the officer. Final verification is performed by an authorized human.
            </div>
            {incident.aiAnalysis && (
              <>
                <div className="detail-row"><span className="detail-label">Detected Disaster Type</span><span>{incident.aiAnalysis.detectedType}</span></div>
                <div className="detail-row"><span className="detail-label">Extracted Location</span><span>{incident.aiAnalysis.extractedLocation || 'N/A'}</span></div>
                <div className="detail-row"><span className="detail-label">Severity Assessment</span><span>{incident.aiAnalysis.severityAssessment}</span></div>
                <div className="detail-row"><span className="detail-label">NLP Confidence</span><span>{incident.aiAnalysis.confidenceScore}%</span></div>
              </>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Evidence & Sources</h3>
          </div>
          <div className="card-body">
            {incident.evidence && incident.evidence.length > 0 ? (
              <div className="evidence-list">
                {incident.evidence.map((ev, idx) => (
                  <div key={idx} className="evidence-item">
                    <div className="evidence-source">{ev.source}</div>
                    <div className="evidence-desc">{ev.description}</div>
                    {ev.url && <a href={ev.url} target="_blank" rel="noopener noreferrer" className="evidence-link">View evidence</a>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="detail-empty">No evidence available</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Location Map</h3>
          </div>
          <div className="card-body no-padding">
            <DisasterMap incidents={[incident]} center={[incident.latitude, incident.longitude]} zoom={10} height="300px" />
          </div>
        </div>
      </div>
    </div>
  )
}
