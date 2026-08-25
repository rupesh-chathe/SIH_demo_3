import express from 'express'
import {
  getIncidents,
  getIncident,
  createIncident,
  updateIncident,
  deleteIncident,
  verifyIncident,
  rejectIncident,
  getDashboardStats,
} from '../controllers/incidentController.js'

const router = express.Router()

router.get('/stats', getDashboardStats)
router.get('/', getIncidents)
router.get('/:id', getIncident)
router.post('/', createIncident)
router.put('/:id', updateIncident)
router.delete('/:id', deleteIncident)
router.put('/:id/verify', verifyIncident)
router.put('/:id/reject', rejectIncident)

export default router
