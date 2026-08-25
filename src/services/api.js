import axios from 'axios'
import { ENDPOINTS } from './apiConfig.js'

const api = axios.create({
  timeout: 15000,
})

export async function fetchIncidents() {
  const { data } = await api.get(ENDPOINTS.incidents)
  return data
}

export async function fetchIncident(id) {
  const { data } = await api.get(`${ENDPOINTS.incidents}/${id}`)
  return data
}

export async function createIncident(incident) {
  const { data } = await api.post(ENDPOINTS.incidents, incident)
  return data
}

export async function updateIncident(id, updates) {
  const { data } = await api.put(`${ENDPOINTS.incidents}/${id}`, updates)
  return data
}

export async function deleteIncident(id) {
  const { data } = await api.delete(`${ENDPOINTS.incidents}/${id}`)
  return data
}

export async function verifyIncident(id) {
  const { data } = await api.put(`${ENDPOINTS.incidents}/${id}/verify`)
  return data
}

export async function rejectIncident(id) {
  const { data } = await api.put(`${ENDPOINTS.incidents}/${id}/reject`)
  return data
}

export async function fetchDashboardStats() {
  const { data } = await api.get(`${ENDPOINTS.incidents}/stats`)
  return data
}

export async function fetchReports() {
  const { data } = await api.get(ENDPOINTS.reports)
  return data
}

export async function submitReport(report) {
  const { data } = await api.post(ENDPOINTS.reports, report)
  return data
}
