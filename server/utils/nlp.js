// Simple keyword-based disaster classification.
// This is a prototype utility that can be replaced with a real ML/NLP model later.

const DISASTER_KEYWORDS = {
  Flood: ['flood', 'flooding', 'inundation', 'waterlogged', 'submerge', 'deluge', 'overflow'],
  Fire: ['fire', 'blaze', 'flame', 'burn', 'wildfire', 'inferno', 'smoke'],
  Landslide: ['landslide', 'mudslide', 'rockslide', 'landslide', 'slump', 'debris flow'],
  Cyclone: ['cyclone', 'storm', 'hurricane', 'typhoon', 'tropical cyclone'],
  Earthquake: ['earthquake', 'tremor', 'seismic', 'quake', 'aftershock', 'ground shaking'],
  'Heavy Rainfall': ['heavy rain', 'rainfall', 'downpour', 'monsoon', 'cloudburst'],
  Thunderstorm: ['thunderstorm', 'lightning', 'thunder', 'electrical storm'],
  Heatwave: ['heatwave', 'heat wave', 'extreme heat', 'heatstroke', 'scorching'],
  'Strong Wind': ['strong wind', 'gale', 'windstorm', 'high wind', 'squall'],
}

const SEVERITY_KEYWORDS = {
  Critical: ['critical', 'catastrophic', 'devastating', 'massive', 'severe', 'widespread', 'fatal', 'casualties', 'deaths'],
  High: ['high', 'major', 'serious', 'significant', 'heavy', 'severe'],
  Medium: ['medium', 'moderate', 'minor', 'some', 'partial'],
  Low: ['low', 'minor', 'small', 'light', 'slight'],
}

// Common Indian cities/districts for location extraction.
const KNOWN_LOCATIONS = [
  'Pune', 'Mumbai', 'Delhi', 'Chennai', 'Kolkata', 'Bengaluru', 'Hyderabad', 'Ahmedabad',
  'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal', 'Patna',
  'Kochi', 'Coimbatore', 'Guwahati', 'Chandigarh', 'Shimla', 'Dehradun', 'Rishikesh',
  'Haridwar', 'Nainital', 'Almora', 'Chamoli', 'Uttarkashi', 'Pithoragarh', 'Rudraprayag',
  'Tehri', 'Kedarnath', 'Badrinath', 'Joshimath', 'Srinagar', 'Gangtok', 'Darjeeling',
  'Siliguri', 'Malappuram', 'Kozhikode', 'Wayanad', 'Idukki', 'Alappuzha', 'Kottayam',
  'Thrissur', 'Ernakulam', 'Thiruvananthapuram', 'Kollam', 'Pathanamthitta',
  'Cuttack', 'Bhubaneswar', 'Puri', 'Konark', 'Paradip', 'Brahmapur',
]

function normalize(text) {
  return (text || '').toLowerCase().trim()
}

export function classifyDisaster(text) {
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

export function assessSeverity(text) {
  const lower = normalize(text)
  for (const level of ['Critical', 'High', 'Medium', 'Low']) {
    for (const kw of SEVERITY_KEYWORDS[level]) {
      if (lower.includes(kw)) return level
    }
  }
  return 'Medium'
}

export function extractLocation(text) {
  const lower = normalize(text)
  for (const loc of KNOWN_LOCATIONS) {
    if (lower.includes(loc.toLowerCase())) return loc
  }
  const nearMatch = text.match(/near\s+([A-Z][a-zA-Z\s]+)/)
  if (nearMatch) return nearMatch[1].trim()
  return null
}

// Confidence score for the NLP analysis itself (0-100).
// Based on keyword match strength.
export function nlpConfidence(text, matchCount) {
  if (matchCount >= 3) return 95
  if (matchCount === 2) return 85
  if (matchCount === 1) return 70
  return 40
}

export function analyzeReport(text) {
  const { disasterType, matchCount } = classifyDisaster(text)
  const severity = assessSeverity(text)
  const location = extractLocation(text)
  const confidenceScore = nlpConfidence(text, matchCount)
  return {
    detectedType: disasterType,
    extractedLocation: location,
    severityAssessment: severity,
    confidenceScore,
  }
}
