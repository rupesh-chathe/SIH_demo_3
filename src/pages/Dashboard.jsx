import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'
import StatCard from '../components/StatCard.jsx'
import IncidentTable from '../components/IncidentTable.jsx'
import DisasterMap from '../components/DisasterMap.jsx'
import { LoadingState, ErrorState } from '../components/States.jsx'
import { fetchDashboardStats, fetchIncidents } from '../services/api.js'
import { FALLBACK_INCIDENTS } from '../utils/constants.js'
import { DISASTER_ICON_COLORS, SEVERITY_COLORS } from '../utils/constants.js'

const SEVERITY_CHART_COLORS = {
  Low: '#16a34a', Medium: '#eab308', High: '#ea580c', Critical: '#dc2626',
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [statsData, incData] = await Promise.all([fetchDashboardStats(), fetchIncidents()])
        setStats(statsData)
        setIncidents(incData.slice(0, 8))
      } catch (err) {
        setError('Unable to connect to server. Showing sample data.')
        setIncidents(FALLBACK_INCIDENTS.slice(0, 8))
        // Compute fallback stats
        setStats({
          total: FALLBACK_INCIDENTS.length,
          active: FALLBACK_INCIDENTS.filter((i) => i.status !== 'Rejected').length,
          critical: FALLBACK_INCIDENTS.filter((i) => i.severity === 'Critical').length,
          pending: FALLBACK_INCIDENTS.filter((i) => i.status === 'Pending').length,
          verified: FALLBACK_INCIDENTS.filter((i) => i.status === 'Verified').length,
          typeDistribution: aggregateBy(FALLBACK_INCIDENTS, 'disasterType'),
          severityDistribution: aggregateBy(FALLBACK_INCIDENTS, 'severity'),
          trend: generateTrend(FALLBACK_INCIDENTS),
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <LoadingState message="Loading dashboard..." />

  return (
    <div className="page">
      {error && <div className="banner banner-warning">{error}</div>}

      <div className="stat-grid">
        <StatCard label="Total Incidents" value={stats.total} accent="#1e3a8a" />
        <StatCard label="Active Incidents" value={stats.active} accent="#0369a1" />
        <StatCard label="Critical Incidents" value={stats.critical} accent="#dc2626" />
        <StatCard label="Pending Verification" value={stats.pending} accent="#ea580c" />
        <StatCard label="Verified Incidents" value={stats.verified} accent="#16a34a" />
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Disaster Type Distribution</h3>
          </div>
          <div className="card-body chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stats.typeDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {stats.typeDistribution.map((entry) => (
                    <Cell key={entry.name} fill={DISASTER_ICON_COLORS[entry.name] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Severity Distribution</h3>
          </div>
          <div className="card-body chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.severityDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stats.severityDistribution.map((entry) => (
                    <Cell key={entry.name} fill={SEVERITY_CHART_COLORS[entry.name] || '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card card-wide">
          <div className="card-header">
            <h3 className="card-title">Incident Trend Over Time</h3>
          </div>
          <div className="card-body chart-container">
            {stats.trend && stats.trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={stats.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#1e40af" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">No trend data available</div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Map Preview</h3>
            <Link to="/map" className="card-link">View full map</Link>
          </div>
          <div className="card-body">
            <DisasterMap incidents={incidents} height="250px" zoom={4} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Incidents</h3>
          <Link to="/incidents" className="card-link">View all</Link>
        </div>
        <div className="card-body no-padding">
          <IncidentTable incidents={incidents} />
        </div>
      </div>
    </div>
  )
}

function aggregateBy(items, key) {
  const map = {}
  for (const item of items) {
    const k = item[key]
    map[k] = (map[k] || 0) + 1
  }
  return Object.entries(map).map(([name, value]) => ({ name, value }))
}

function generateTrend(incidents) {
  const map = {}
  for (const inc of incidents) {
    const date = new Date(inc.createdAt).toISOString().split('T')[0]
    map[date] = (map[date] || 0) + 1
  }
  return Object.entries(map)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }))
}
