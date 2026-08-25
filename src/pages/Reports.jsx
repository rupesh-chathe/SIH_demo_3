import { useState } from 'react'
import { submitReport } from '../services/api.js'
import { analyzeText } from '../utils/nlp.js'
import { DISASTER_TYPES, SEVERITY_LEVELS } from '../utils/constants.js'

const SOURCE_OPTIONS = ['Citizen', 'Public Report', 'News', 'Weather API', 'Government Alert']

export default function Reports() {
  const [form, setForm] = useState({
    source: 'Citizen',
    description: '',
    location: '',
    latitude: '',
    longitude: '',
    disasterType: 'Flood',
    severity: 'Medium',
    imageUrl: '',
    reporterName: '',
  })
  const [preview, setPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const [errors, setErrors] = useState({})

  function handleChange(field, value) {
    setForm({ ...form, [field]: value })
    if (field === 'description') {
      if (value.trim().length > 10) {
        setPreview(analyzeText(value))
      } else {
        setPreview(null)
      }
    }
  }

  function validate() {
    const e = {}
    if (!form.description.trim()) e.description = 'Description is required'
    if (!form.location.trim()) e.location = 'Location is required'
    if (form.latitude === '' || isNaN(form.latitude)) e.latitude = 'Valid latitude is required'
    if (form.longitude === '' || isNaN(form.longitude)) e.longitude = 'Valid longitude is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSuccess(null)
    setError(null)
    if (!validate()) return

    setSubmitting(true)
    try {
      const result = await submitReport({
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      })
      setSuccess(result.merged
        ? `Report submitted and merged into existing incident ${result.incident.incidentId} (${result.incident.supportingReports} supporting reports).`
        : `Report submitted. New incident ${result.incident.incidentId} created.`
      )
      setForm({
        source: 'Citizen', description: '', location: '', latitude: '', longitude: '',
        disasterType: 'Flood', severity: 'Medium', imageUrl: '', reporterName: '',
      })
      setPreview(null)
    } catch (err) {
      setError('Failed to submit report. Please check that the backend server is running.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="reports-layout">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Submit Citizen Report</h3>
          </div>
          <div className="card-body">
            {success && <div className="banner banner-success">{success}</div>}
            {error && <div className="banner banner-error">{error}</div>}

            <form onSubmit={handleSubmit} className="report-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Source</label>
                  <select value={form.source} onChange={(e) => handleChange('source', e.target.value)}>
                    {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Disaster Type</label>
                  <select value={form.disasterType} onChange={(e) => handleChange('disasterType', e.target.value)}>
                    {DISASTER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description <span className="required">*</span></label>
                <textarea
                  rows="4"
                  placeholder="Describe the disaster event in detail..."
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
                {errors.description && <span className="form-error">{errors.description}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Location <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Pune"
                    value={form.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                  />
                  {errors.location && <span className="form-error">{errors.location}</span>}
                </div>
                <div className="form-group">
                  <label>Severity</label>
                  <select value={form.severity} onChange={(e) => handleChange('severity', e.target.value)}>
                    {SEVERITY_LEVELS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Latitude <span className="required">*</span></label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 18.5204"
                    value={form.latitude}
                    onChange={(e) => handleChange('latitude', e.target.value)}
                  />
                  {errors.latitude && <span className="form-error">{errors.latitude}</span>}
                </div>
                <div className="form-group">
                  <label>Longitude <span className="required">*</span></label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 73.8567"
                    value={form.longitude}
                    onChange={(e) => handleChange('longitude', e.target.value)}
                  />
                  {errors.longitude && <span className="form-error">{errors.longitude}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Image URL (optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={form.imageUrl}
                    onChange={(e) => handleChange('imageUrl', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Reporter Name (optional)</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={form.reporterName}
                    onChange={(e) => handleChange('reporterName', e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">AI / NLP Live Preview</h3>
          </div>
          <div className="card-body">
            {preview ? (
              <div className="nlp-preview">
                <div className="ai-note">This is a prototype keyword-based analysis. It can be replaced with a real ML/NLP model later.</div>
                <div className="detail-row"><span className="detail-label">Detected Disaster Type</span><span className="nlp-result">{preview.detectedType}</span></div>
                <div className="detail-row"><span className="detail-label">Extracted Location</span><span className="nlp-result">{preview.extractedLocation || 'N/A'}</span></div>
                <div className="detail-row"><span className="detail-label">Severity Assessment</span><span className="nlp-result">{preview.severityAssessment}</span></div>
                <div className="detail-row"><span className="detail-label">NLP Confidence</span><span className="nlp-result">{preview.confidenceScore}%</span></div>
              </div>
            ) : (
              <div className="nlp-placeholder">
                <p>Start typing a description to see the NLP analysis in real time.</p>
                <p className="nlp-example">Example: "Heavy rainfall has flooded roads near Pune station."</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
