import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import Dashboard from './pages/Dashboard.jsx'
import LiveIncidents from './pages/LiveIncidents.jsx'
import IncidentDetailPage from './pages/IncidentDetailPage.jsx'
import MapPage from './pages/MapPage.jsx'
import Reports from './pages/Reports.jsx'
import Verification from './pages/Verification.jsx'
import Analytics from './pages/Analytics.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="main-area">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/incidents" element={<LiveIncidents />} />
              <Route path="/incidents/:id" element={<IncidentDetailPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/verification" element={<Verification />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}
