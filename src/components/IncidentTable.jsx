import { Link } from 'react-router-dom'
import { SeverityBadge, StatusBadge, ConfidenceBar, DisasterTypeBadge } from './Badges.jsx'
import { formatTime, formatSources } from '../utils/format.js'

export default function IncidentTable({ incidents, onRowClick }) {
  if (!incidents || incidents.length === 0) {
    return (
      <div className="table-empty">No incidents to display</div>
    )
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Incident ID</th>
            <th>Disaster Type</th>
            <th>Location</th>
            <th>Severity</th>
            <th>Confidence</th>
            <th>Source</th>
            <th>Time</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((incident) => (
            <tr
              key={incident.incidentId}
              className={onRowClick ? 'table-row-clickable' : ''}
              onClick={onRowClick ? () => onRowClick(incident) : undefined}
            >
              <td className="mono">{incident.incidentId}</td>
              <td><DisasterTypeBadge type={incident.disasterType} /></td>
              <td>{incident.location}</td>
              <td><SeverityBadge severity={incident.severity} /></td>
              <td><ConfidenceBar value={incident.confidence} /></td>
              <td className="source-cell">{formatSources(incident.sources)}</td>
              <td className="mono">{formatTime(incident.createdAt)}</td>
              <td><StatusBadge status={incident.status} /></td>
              <td>
                <Link to={`/incidents/${incident.incidentId}`} className="btn btn-small btn-primary" onClick={(e) => e.stopPropagation()}>
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
