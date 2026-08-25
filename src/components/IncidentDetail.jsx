import { Link } from 'react-router-dom'
import { SeverityBadge, StatusBadge, ConfidenceBar, DisasterTypeBadge } from './Badges.jsx'
import { formatDateTime, formatSources } from '../utils/format.js'

export default function IncidentDetail({ incident, onClose }) {
  if (!incident) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{incident.incidentId}</h2>
            <div className="modal-subtitle">{incident.disasterType} · {incident.location}</div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-section">
              <h3 className="detail-section-title">Incident Information</h3>
              <div className="detail-row"><span className="detail-label">Incident ID</span><span className="mono">{incident.incidentId}</span></div>
              <div className="detail-row"><span className="detail-label">Disaster Type</span><DisasterTypeBadge type={incident.disasterType} /></div>
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

            <div className="detail-section">
              <h3 className="detail-section-title">AI / NLP Analysis</h3>
              <div className="ai-analysis-box">
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

              <h3 className="detail-section-title">Evidence & Sources</h3>
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

              <div className="modal-actions">
                <Link to={`/incidents/${incident.incidentId}`} className="btn btn-primary">Open Full Page</Link>
                <Link to="/verification" className="btn btn-secondary">Go to Verification</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
