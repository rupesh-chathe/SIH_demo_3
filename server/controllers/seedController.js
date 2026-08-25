import Incident from '../models/Incident.js'
import Report from '../models/Report.js'
import { analyzeReport } from '../utils/nlp.js'
import { calculateConfidence } from '../utils/confidence.js'
import { findDuplicate } from '../utils/duplicate.js'
import { SEED_REPORTS } from '../utils/seedData.js'

let incidentCounter = 1000

async function getNextIncidentId() {
  const lastIncident = await Incident.findOne().sort({ incidentId: -1 })
  if (lastIncident && lastIncident.incidentId) {
    const num = parseInt(lastIncident.incidentId.replace('INC-', ''), 10)
    incidentCounter = num
  }
  incidentCounter += 1
  return `INC-${incidentCounter}`
}

export async function seedDatabase() {
  const count = await Incident.countDocuments()
  if (count > 0) return

  const reportCount = await Report.countDocuments()
  if (reportCount === 0) {
    await Report.insertMany(SEED_REPORTS)
  }

  // Group seed reports into incidents using duplicate detection
  const incidents = []
  for (const report of SEED_REPORTS) {
    const analysis = analyzeReport(report.description)
    const dup = findDuplicate(report, incidents)
    if (dup.match) {
      // Merge into existing incident
      const idx = incidents.findIndex((i) => i.incidentId === dup.match.incidentId)
      if (!incidents[idx].sources.includes(report.source)) {
        incidents[idx].sources.push(report.source)
      }
      incidents[idx].supportingReports += 1
      incidents[idx].evidence.push({
        source: report.source,
        description: report.description,
        url: report.imageUrl || '',
      })
      incidents[idx].confidence = calculateConfidence({
        sources: incidents[idx].sources,
        supportingReports: incidents[idx].supportingReports,
        typeMatch: true,
        locationMatch: true,
        timeMatch: true,
      })
      incidents[idx].linkedReportIds.push(report.reportId)
    } else {
      const id = await getNextIncidentId()
      const sources = [report.source]
      const confidence = calculateConfidence({
        sources,
        supportingReports: 1,
        typeMatch: true,
        locationMatch: true,
        timeMatch: true,
      })
      incidents.push({
        incidentId: id,
        disasterType: analysis.detectedType !== 'Other' ? analysis.detectedType : report.disasterType,
        description: report.description,
        location: analysis.extractedLocation || report.location,
        latitude: report.latitude,
        longitude: report.longitude,
        severity: analysis.severityAssessment,
        confidence,
        sources,
        supportingReports: 1,
        status: 'Pending',
        aiAnalysis: {
          detectedType: analysis.detectedType,
          extractedLocation: analysis.extractedLocation,
          severityAssessment: analysis.severityAssessment,
          confidenceScore: analysis.confidenceScore,
        },
        evidence: [
          {
            source: report.source,
            description: report.description,
            url: report.imageUrl || '',
          },
        ],
        linkedReportIds: [report.reportId],
        createdAt: new Date(),
      })
    }
  }

  // Remove the temporary linkedReportIds field before saving
  const cleanIncidents = incidents.map(({ linkedReportIds, ...rest }) => rest)
  await Incident.insertMany(cleanIncidents)
  console.log(`Seeded ${cleanIncidents.length} incidents and ${SEED_REPORTS.length} reports`)
}
