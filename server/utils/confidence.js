// Explainable confidence scoring based on source reliability and corroboration.

const SOURCE_RELIABILITY = {
  'Government Alert': 95,
  'Weather API': 85,
  'News': 70,
  'Public Report': 60,
  'Citizen': 50,
}

export function sourceReliability(source) {
  return SOURCE_RELIABILITY[source] || 45
}

// Calculate overall confidence (0-100) for an incident.
// Factors: source reliability, matching disaster type, matching location,
// matching time, and number of supporting reports.
export function calculateConfidence({
  sources = [],
  supportingReports = 1,
  typeMatch = true,
  locationMatch = true,
  timeMatch = true,
}) {
  let score = 0

  // Source reliability: average of all source reliability scores, weighted 40%
  if (sources.length > 0) {
    const avgReliability =
      sources.reduce((sum, s) => sum + sourceReliability(s), 0) / sources.length
    score += avgReliability * 0.4
  } else {
    score += 40 * 0.4
  }

  // Supporting reports: more corroboration = higher confidence, weighted 25%
  const reportFactor = Math.min(supportingReports / 5, 1) // cap at 5 reports
  score += reportFactor * 100 * 0.25

  // Type match: weighted 15%
  score += (typeMatch ? 100 : 40) * 0.15

  // Location match: weighted 12%
  score += (locationMatch ? 100 : 40) * 0.12

  // Time match: weighted 8%
  score += (timeMatch ? 100 : 50) * 0.08

  return Math.round(Math.min(score, 100))
}
