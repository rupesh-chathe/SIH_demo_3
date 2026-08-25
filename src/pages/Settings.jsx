export default function Settings() {
  return (
    <div className="page">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">System Settings</h3>
        </div>
        <div className="card-body">
          <div className="settings-section">
            <h4 className="settings-title">Data Sources</h4>
            <p className="settings-desc">
              The system aggregates data from the following sources. Real API integrations can be added in the backend configuration.
            </p>
            <div className="settings-list">
              <div className="settings-item">
                <div className="settings-item-name">Citizen Reports</div>
                <div className="settings-item-status active">Active</div>
              </div>
              <div className="settings-item">
                <div className="settings-item-name">Mock Weather API</div>
                <div className="settings-item-status active">Active (Mock)</div>
              </div>
              <div className="settings-item">
                <div className="settings-item-name">Mock News Feed</div>
                <div className="settings-item-status active">Active (Mock)</div>
              </div>
              <div className="settings-item">
                <div className="settings-item-name">Mock Government Alerts</div>
                <div className="settings-item-status active">Active (Mock)</div>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h4 className="settings-title">NLP / Classification Engine</h4>
            <p className="settings-desc">
              Currently using a prototype keyword-based classification engine. This can be replaced with a real ML/NLP model in the server utils module without changing the rest of the application.
            </p>
            <div className="settings-item">
              <div className="settings-item-name">Classification Engine</div>
              <div className="settings-item-value">Keyword-based (Prototype)</div>
            </div>
            <div className="settings-item">
              <div className="settings-item-name">Duplicate Detection</div>
              <div className="settings-item-value">Jaccard similarity + time matching</div>
            </div>
            <div className="settings-item">
              <div className="settings-item-name">Confidence Scoring</div>
              <div className="settings-item-value">Source reliability + corroboration weighted</div>
            </div>
          </div>

          <div className="settings-section">
            <h4 className="settings-title">Verification Policy</h4>
            <p className="settings-desc">
              The AI assists officers by classifying, locating, and scoring incidents. Final verification is always performed by an authorized human officer. No incident is automatically marked as verified by the system.
            </p>
          </div>

          <div className="settings-section">
            <h4 className="settings-title">Environment Configuration</h4>
            <p className="settings-desc">
              The following environment variables are used by the system:
            </p>
            <div className="settings-env">
              <div className="settings-env-item"><code>MONGODB_URI</code> — MongoDB connection string (Atlas or local)</div>
              <div className="settings-env-item"><code>PORT</code> — Backend server port (default: 5000)</div>
              <div className="settings-env-item"><code>VITE_API_BASE_URL</code> — Backend API URL for frontend (optional in dev)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
