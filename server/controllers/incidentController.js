import Incident from '../models/Incident.js'
import { calculateConfidence } from '../utils/confidence.js'

export async function getIncidents(req, res) {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 })
    res.json(incidents)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch incidents' })
  }
}

export async function getIncident(req, res) {
  try {
    const incident = await Incident.findOne({ incidentId: req.params.id })
    if (!incident) return res.status(404).json({ error: 'Incident not found' })
    res.json(incident)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch incident' })
  }
}

export async function createIncident(req, res) {
  try {
    const incident = new Incident(req.body)
    await incident.save()
    res.status(201).json(incident)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

export async function updateIncident(req, res) {
  try {
    const incident = await Incident.findOneAndUpdate(
      { incidentId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    )
    if (!incident) return res.status(404).json({ error: 'Incident not found' })
    res.json(incident)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

export async function deleteIncident(req, res) {
  try {
    const incident = await Incident.findOneAndDelete({ incidentId: req.params.id })
    if (!incident) return res.status(404).json({ error: 'Incident not found' })
    res.json({ message: 'Incident deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete incident' })
  }
}

export async function verifyIncident(req, res) {
  try {
    const incident = await Incident.findOneAndUpdate(
      { incidentId: req.params.id },
      { status: 'Verified' },
      { new: true }
    )
    if (!incident) return res.status(404).json({ error: 'Incident not found' })
    res.json(incident)
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify incident' })
  }
}

export async function rejectIncident(req, res) {
  try {
    const incident = await Incident.findOneAndUpdate(
      { incidentId: req.params.id },
      { status: 'Rejected' },
      { new: true }
    )
    if (!incident) return res.status(404).json({ error: 'Incident not found' })
    res.json(incident)
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject incident' })
  }
}

export async function getDashboardStats(req, res) {
  try {
    const total = await Incident.countDocuments()
    const active = await Incident.countDocuments({ status: { $ne: 'Rejected' } })
    const critical = await Incident.countDocuments({ severity: 'Critical' })
    const pending = await Incident.countDocuments({ status: 'Pending' })
    const verified = await Incident.countDocuments({ status: 'Verified' })

    // Disaster type distribution
    const typeAgg = await Incident.aggregate([
      { $group: { _id: '$disasterType', count: { $sum: 1 } } },
    ])
    const typeDistribution = typeAgg.map((t) => ({ name: t._id, value: t.count }))

    // Severity distribution
    const severityAgg = await Incident.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } },
    ])
    const severityDistribution = severityAgg.map((s) => ({ name: s._id, value: s.count }))

    // Incident trend over time (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const trendAgg = await Incident.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])
    const trend = trendAgg.map((t) => ({ date: t._id, count: t.count }))

    res.json({
      total,
      active,
      critical,
      pending,
      verified,
      typeDistribution,
      severityDistribution,
      trend,
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' })
  }
}
