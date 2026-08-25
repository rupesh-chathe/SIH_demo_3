export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="state-container">
      <div className="spinner" />
      <p className="state-text">{message}</p>
    </div>
  )
}

export function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="state-container">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p className="state-text error">{message}</p>
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry}>Retry</button>
      )}
    </div>
  )
}

export function EmptyState({ message = 'No data available' }) {
  return (
    <div className="state-container">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
      </svg>
      <p className="state-text">{message}</p>
    </div>
  )
}
