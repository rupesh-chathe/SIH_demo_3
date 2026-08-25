export default function StatCard({ label, value, icon, accent }) {
  return (
    <div className="stat-card">
      <div className="stat-card-body">
        <div className="stat-card-label">{label}</div>
        <div className="stat-card-value" style={{ color: accent || '#1e3a8a' }}>{value}</div>
      </div>
      {icon && (
        <div className="stat-card-icon" style={{ backgroundColor: (accent || '#1e3a8a') + '15', color: accent || '#1e3a8a' }}>
          {icon}
        </div>
      )}
    </div>
  )
}
