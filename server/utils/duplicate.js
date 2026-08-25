// Simple duplicate detection: compares disaster type, location, timestamp,
// and description similarity to find potential duplicate incidents.

function normalize(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

// Token-based Jaccard similarity for description comparison.
function textSimilarity(a, b) {
  const tokensA = new Set(normalize(a).split(' ').filter((w) => w.length > 2))
  const tokensB = new Set(normalize(b).split(' ').filter((w) => w.length > 2))
  if (tokensA.size === 0 || tokensB.size === 0) return 0
  const intersection = [...tokensA].filter((t) => tokensB.has(t)).length
  const union = new Set([...tokensA, ...tokensB]).size
  return intersection / union
}

// Time similarity: 1.0 if within 1 hour, decays to 0 over 24 hours.
function timeSimilarity(timeA, timeB) {
  const diffMs = Math.abs(new Date(timeA).getTime() - new Date(timeB).getTime())
  const hoursDiff = diffMs / (1000 * 60 * 60)
  if (hoursDiff < 1) return 1.0
  if (hoursDiff > 24) return 0
  return 1 - hoursDiff / 24
}

// Returns a duplicate match if overall similarity score >= threshold (0-1).
export function findDuplicate(report, incidents, threshold = 0.6) {
  let bestMatch = null
  let bestScore = 0

  for (const incident of incidents) {
    let score = 0

    // Disaster type match: 30%
    if (incident.disasterType === report.disasterType) score += 0.3

    // Location match: 25%
    const locA = normalize(incident.location)
    const locB = normalize(report.location)
    if (locA && locB && (locA.includes(locB) || locB.includes(locA))) {
      score += 0.25
    }

    // Time similarity: 20%
    score += timeSimilarity(incident.createdAt, report.timestamp || report.createdAt) * 0.2

    // Description similarity: 25%
    score += textSimilarity(incident.description, report.description) * 0.25

    if (score >= threshold && score > bestScore) {
      bestScore = score
      bestMatch = incident
    }
  }

  return { match: bestMatch, score: bestScore }
}
