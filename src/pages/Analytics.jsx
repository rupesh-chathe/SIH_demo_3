import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts'
import { LoadingState } from '../components/States.jsx'
import StatCard from '../components/StatCard.jsx'
import { fetchDashboardStats, fetchIncidents } from '../services/api.js'
import { FALLBACK_INCIDENTS } from '../utils/constants.js'
import { DISASTER_ICON_COLORS, SEVERITY_COLORS } from '../utils/constants.js'

export default function Analytics() {
  const [stats, setStats] = useState(null)
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [statsData, incData] = await Promise.all([fetchDashboardStats(), fetchIncidents()])
        setStats(statsData)
        setIncidents(incData)
      } catch (err) {
        setIncidents(FALLBACK_INCIDENTS)
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

  if (loading) return <LoadingState message="Loading analytics..." />
  if (!stats) return <LoadingState />

  const locationData = aggregateBy(incidents, 'location').sort((a, b) => b.value - a.value).slice(0, 8)
  const sourceData = aggregateBySources(incidents)

  return (
    <div className="page">
      <div className="stat-grid">
        <StatCard label="Total Incidents" value={stats.total} accent="#1e3a8a" />
        <StatCard label="Verification Rate" value={`${Math.round((stats.verified / Math.max(stats.total, 1)) * 100)}%`} accent="#16a34a" />
        <StatCard label="Critical Rate" value={`${Math.round((stats.critical / Math.max(stats.total, 1)) * 100)}%`} accent="#dc2626" />
        <StatCard label="Avg Confidence" value={`${Math.round(incidents.reduce((s, i) => s + (i.confidence || 0), 0) / Math.max(incidents.length, 1))}%`} accent="#0369a1" />
      </div>

      <div className="dashboard-grid">
        <div className="card card-wide">
          <div className="card-header">
            <h3 className="card-title">Incident Trend Over Time</h3>
          </div>
          <div className="card-body chart-container">
            {stats.trend && stats.trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.trend}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e40af" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1e40af" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#1e40af" strokeWidth={2} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">No trend data available</div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Incidents by Location</h3>
          </div>
          <div className="card-body chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={locationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#1e40af" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Disaster Type Distribution</h3>
          </div>
          <div className="card-body chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.typeDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
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
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Severity Distribution</h3>
          </div>
          <div className="card-body chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.severityDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stats.severityDistribution.map((entry) => (
                    <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] || '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Reports by Source Type</h3>
          </div>
          <div className="card-body chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#0369a1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
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

function aggregateBySources(incidents) {
  const map = {}
  for (const inc of incidents) {
    if (inc.sources) {
      for (const s of inc.sources) {
        map[s] = (map[s] || 0) + 1
      }
    }
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
