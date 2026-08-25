import { SEVERITY_COLORS, SEVERITY_BG, STATUS_COLORS } from '../utils/constants.js'

export function SeverityBadge({ severity }) {
  const color = SEVERITY_COLORS[severity] || '#6b7280'
  const bg = SEVERITY_BG[severity] || '#f3f4f6'
  return (
    <span className="badge" style={{ backgroundColor: bg, color }}>
      {severity}
    </span>
  )
}

export function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || { bg: '#f3f4f6', text: '#6b7280' }
  return (
    <span className="badge" style={{ backgroundColor: colors.bg, color: colors.text }}>
      {status}
    </span>
  )
}

export function ConfidenceBar({ value }) {
  const color = value >= 80 ? '#16a34a' : value >= 60 ? '#eab308' : value >= 40 ? '#ea580c' : '#dc2626'
  return (
    <div className="confidence-bar">
      <div className="confidence-bar-track">
        <div className="confidence-bar-fill" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="confidence-bar-value" style={{ color }}>{value}%</span>
    </div>
  )
}

export function DisasterTypeBadge({ type }) {
  const colors = {
    Flood: '#0369a1', Fire: '#dc2626', Landslide: '#a16207', Cyclone: '#7c3aed',
    Earthquake: '#b45309', 'Heavy Rainfall': '#0284c7', Thunderstorm: '#6d28d9',
    Heatwave: '#ea580c', 'Strong Wind': '#0891b2', Other: '#6b7280',
  }
  const color = colors[type] || '#6b7280'
  return (
    <span className="disaster-type-badge" style={{ color, borderColor: color }}>
      {type}
    </span>
  )
}
