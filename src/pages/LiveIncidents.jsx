import { useState, useEffect, useMemo } from 'react'
import IncidentTable from '../components/IncidentTable.jsx'
import IncidentDetail from '../components/IncidentDetail.jsx'
import { LoadingState, ErrorState } from '../components/States.jsx'
import { fetchIncidents } from '../services/api.js'
import { FALLBACK_INCIDENTS } from '../utils/constants.js'
import { DISASTER_TYPES, SEVERITY_LEVELS, VERIFICATION_STATUS } from '../utils/constants.js'

export default function LiveIncidents() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    disasterType: '',
    severity: '',
    location: '',
    status: '',
  })

  useEffect(() => {
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
    load()
  }, [])

  const filtered = useMemo(() => {
    return incidents
      .filter((inc) => {
        if (filters.search) {
          const q = filters.search.toLowerCase()
          const match =
            inc.incidentId.toLowerCase().includes(q) ||
            inc.description.toLowerCase().includes(q) ||
            inc.location.toLowerCase().includes(q) ||
            inc.disasterType.toLowerCase().includes(q)
          if (!match) return false
        }
        if (filters.disasterType && inc.disasterType !== filters.disasterType) return false
        if (filters.severity && inc.severity !== filters.severity) return false
        if (filters.location && !inc.location.toLowerCase().includes(filters.location.toLowerCase())) return false
        if (filters.status && inc.status !== filters.status) return false
        return true
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [incidents, filters])

  if (loading) return <LoadingState message="Loading incidents..." />

  return (
    <div className="page">
      {error && <div className="banner banner-warning">{error}</div>}

      <div className="filter-bar">
        <div className="filter-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by ID, description, location..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select value={filters.disasterType} onChange={(e) => setFilters({ ...filters, disasterType: e.target.value })}>
          <option value="">All Types</option>
          {DISASTER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filters.severity} onChange={(e) => setFilters({ ...filters, severity: e.target.value })}>
          <option value="">All Severity</option>
          {SEVERITY_LEVELS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input
          type="text"
          placeholder="Filter by location"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          className="filter-location"
        />
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          {VERIFICATION_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="filter-summary">
        Showing {filtered.length} of {incidents.length} incidents
        {(filters.search || filters.disasterType || filters.severity || filters.location || filters.status) && (
          <button className="btn btn-link" onClick={() => setFilters({ search: '', disasterType: '', severity: '', location: '', status: '' })}>
            Clear filters
          </button>
        )}
      </div>

      <div className="card">
        <div className="card-body no-padding">
          <IncidentTable incidents={filtered} onRowClick={setSelected} />
        </div>
      </div>

      {selected && <IncidentDetail incident={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
