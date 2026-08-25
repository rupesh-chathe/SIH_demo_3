// Formatting and display helper functions.

export function formatTime(isoString) {
  if (!isoString) return '--'
  const d = new Date(isoString)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function formatDateTime(isoString) {
  if (!isoString) return '--'
  const d = new Date(isoString)
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function formatDate(isoString) {
  if (!isoString) return '--'
  const d = new Date(isoString)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function timeAgo(isoString) {
  if (!isoString) return '--'
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

export function formatSources(sources) {
  if (!sources || sources.length === 0) return '--'
  return sources.join(' + ')
}
