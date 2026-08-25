// Client-side NLP utility — mirrors the server-side analysis for instant UI preview.
// This is a simple keyword-based prototype. It can be replaced with a real ML/NLP model.

const DISASTER_KEYWORDS = {
  Flood: ['flood', 'flooding', 'inundation', 'waterlogged', 'submerge', 'deluge', 'overflow'],
  Fire: ['fire', 'blaze', 'flame', 'burn', 'wildfire', 'inferno', 'smoke'],
  Landslide: ['landslide', 'mudslide', 'rockslide', 'slump', 'debris flow'],
  Cyclone: ['cyclone', 'hurricane', 'typhoon', 'tropical cyclone'],
  Earthquake: ['earthquake', 'tremor', 'seismic', 'quake', 'aftershock', 'ground shaking'],
  'Heavy Rainfall': ['heavy rain', 'rainfall', 'downpour', 'monsoon', 'cloudburst'],
  Thunderstorm: ['thunderstorm', 'lightning', 'thunder', 'electrical storm'],
  Heatwave: ['heatwave', 'heat wave', 'extreme heat', 'heatstroke', 'scorching'],
  'Strong Wind': ['strong wind', 'gale', 'windstorm', 'high wind', 'squall'],
}

const SEVERITY_KEYWORDS = {
  Critical: ['critical', 'catastrophic', 'devastating', 'massive', 'widespread', 'fatal', 'casualties', 'deaths'],
  High: ['high', 'major', 'serious', 'significant', 'heavy', 'severe'],
  Medium: ['medium', 'moderate', 'partial'],
  Low: ['low', 'small', 'light', 'slight'],
}

const KNOWN_LOCATIONS = [
  'Pune', 'Mumbai', 'Delhi', 'Chennai', 'Kolkata', 'Bengaluru', 'Hyderabad', 'Ahmedabad',
  'Jaipur', 'Surat', 'Lucknow', 'Nagpur', 'Indore', 'Bhopal', 'Patna', 'Guwahati',
  'Chandigarh', 'Shimla', 'Dehradun', 'Nainital', 'Chamoli', 'Uttarkashi', 'Wayanad',
  'Kochi', 'Cuttack', 'Bhubaneswar', 'Puri', 'Siliguri', 'Darjeeling',
]

function normalize(text) {
  return (text || '').toLowerCase().trim()
}

function classifyDisaster(text) {
  const lower = normalize(text)
  let bestMatch = 'Other'
  let bestScore = 0
  for (const [type, keywords] of Object.entries(DISASTER_KEYWORDS)) {
    let score = 0
    for (const kw of keywords) {
      if (lower.includes(kw)) score += 1
    }
    if (score > bestScore) {
      bestScore = score
      bestMatch = type
    }
  }
  return { disasterType: bestMatch, matchCount: bestScore }
}

function assessSeverity(text) {
  const lower = normalize(text)
  for (const level of ['Critical', 'High', 'Medium', 'Low']) {
    for (const kw of SEVERITY_KEYWORDS[level]) {
      if (lower.includes(kw)) return level
    }
  }
  return 'Medium'
}

function extractLocation(text) {
  const lower = normalize(text)
  for (const loc of KNOWN_LOCATIONS) {
    if (lower.includes(loc.toLowerCase())) return loc
  }
  const nearMatch = text.match(/near\s+([A-Z][a-zA-Z\s]+)/)
  if (nearMatch) return nearMatch[1].trim()
  return null
}

function nlpConfidence(matchCount) {
  if (matchCount >= 3) return 95
  if (matchCount === 2) return 85
  if (matchCount === 1) return 70
  return 40
}

export function analyzeText(text) {
  const { disasterType, matchCount } = classifyDisaster(text)
  const severity = assessSeverity(text)
  const location = extractLocation(text)
  const confidenceScore = nlpConfidence(matchCount)
  return {
    detectedType: disasterType,
    extractedLocation: location,
    severityAssessment: severity,
    confidenceScore,
  }
}
