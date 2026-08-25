import Report from '../models/Report.js'
import Incident from '../models/Incident.js'
import { analyzeReport } from '../utils/nlp.js'
import { calculateConfidence } from '../utils/confidence.js'
import { findDuplicate } from '../utils/duplicate.js'

let reportCounter = 100

async function getNextReportId() {
  const last = await Report.findOne().sort({ reportId: -1 })
  if (last && last.reportId) {
    const num = parseInt(last.reportId.replace('RPT-', ''), 10)
    reportCounter = num
  }
  reportCounter += 1
  return `RPT-${reportCounter}`
}

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

export async function getReports(req, res) {
  try {
    const reports = await Report.find().sort({ createdAt: -1 })
    res.json(reports)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports' })
  }
}

export async function createReport(req, res) {
  try {
    const {
      source = 'Citizen',
      description,
      location,
      latitude,
      longitude,
      disasterType,
      severity,
      imageUrl,
      reporterName,
    } = req.body

    if (!description || !location || latitude == null || longitude == null) {
      return res.status(400).json({ error: 'Missing required fields: description, location, latitude, longitude' })
    }

    // NLP analysis of the report
    const analysis = analyzeReport(description)
    const finalType = analysis.detectedType !== 'Other' ? analysis.detectedType : (disasterType || 'Other')
    const finalLocation = analysis.extractedLocation || location

    const reportId = await getNextReportId()

    // Save the report
    const report = new Report({
      reportId,
      source,
      description,
      location: finalLocation,
      latitude,
      longitude,
      disasterType: finalType,
      severity: severity || analysis.severityAssessment,
      imageUrl: imageUrl || '',
      reporterName: reporterName || '',
    })
    await report.save()

    // Check for duplicate incidents
    const existingIncidents = await Incident.find().sort({ createdAt: -1 })
    const dup = findDuplicate(
      { ...report.toObject(), timestamp: report.createdAt },
      existingIncidents
    )

    if (dup.match) {
      // Merge into existing incident
      const incident = dup.match
      if (!incident.sources.includes(source)) {
        incident.sources.push(source)
      }
      incident.supportingReports += 1
      incident.evidence.push({
        source,
        description,
        url: imageUrl || '',
      })
      incident.confidence = calculateConfidence({
        sources: incident.sources,
        supportingReports: incident.supportingReports,
        typeMatch: true,
        locationMatch: true,
        timeMatch: true,
      })
      await incident.save()
      return res.status(201).json({ report, incident, merged: true })
    }

    // Create new incident
    const incidentId = await getNextIncidentId()
    const sources = [source]
    const confidence = calculateConfidence({
      sources,
      supportingReports: 1,
      typeMatch: true,
      locationMatch: true,
      timeMatch: true,
    })

    const incident = new Incident({
      incidentId,
      disasterType: finalType,
      description,
      location: finalLocation,
      latitude,
      longitude,
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
          source,
          description,
          url: imageUrl || '',
        },
      ],
    })
    await incident.save()

    res.status(201).json({ report, incident, merged: false })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}
