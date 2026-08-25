import { useState, useEffect } from 'react'
import DisasterMap from '../components/DisasterMap.jsx'
import { LoadingState } from '../components/States.jsx'
import { SeverityBadge } from '../components/Badges.jsx'
import { fetchIncidents } from '../services/api.js'
import { FALLBACK_INCIDENTS } from '../utils/constants.js'
import { DISASTER_TYPES, SEVERITY_LEVELS, SEVERITY_COLORS } from '../utils/constants.js'

export default function MapPage() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filterType, setFilterType] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await fetchIncidents()
        setIncidents(data)
      } catch (err) {
        setIncidents(FALLBACK_INCIDENTS)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = incidents.filter((inc) => {
    if (filterType && inc.disasterType !== filterType) return false
    if (filterSeverity && inc.severity !== filterSeverity) return false
    return true
  })

  if (loading) return <LoadingState message="Loading map..." />

  return (
    <div className="page">
      <div className="filter-bar">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All Disaster Types</option>
          {DISASTER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
          <option value="">All Severity Levels</option>
          {SEVERITY_LEVELS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="map-legend">
          {Object.entries(SEVERITY_COLORS).map(([level, color]) => (
            <div key={level} className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: color }} />
              <span>{level}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="map-layout">
        <div className="card no-padding map-card">
          <DisasterMap incidents={filtered} height="600px" zoom={5} onSelect={setSelected} />
        </div>

        {selected && (
          <div className="card map-detail-panel">
            <div className="card-header">
              <h3 className="card-title">{selected.incidentId}</h3>
            </div>
            <div className="card-body">
              <div className="detail-row"><span className="detail-label">Disaster Type</span><span>{selected.disasterType}</span></div>
              <div className="detail-row"><span className="detail-label">Location</span><span>{selected.location}</span></div>
              <div className="detail-row"><span className="detail-label">Severity</span><SeverityBadge severity={selected.severity} /></div>
              <div className="detail-row"><span className="detail-label">Confidence</span><span>{selected.confidence}%</span></div>
              <div className="detail-row"><span className="detail-label">Status</span><span>{selected.status}</span></div>
              <div className="detail-row"><span className="detail-label">Supporting Reports</span><span>{selected.supportingReports}</span></div>
              <p className="map-detail-desc">{selected.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
