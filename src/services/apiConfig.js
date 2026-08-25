// Central API configuration. Change API_BASE_URL here in one place.
// In development, Vite proxies /api to the backend so we use a relative path.
// In production, set VITE_API_BASE_URL to your deployed backend URL.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const ENDPOINTS = {
  incidents: `${API_BASE_URL}/incidents`,
  reports: `${API_BASE_URL}/reports`,
  health: `${API_BASE_URL}/health`,
}
