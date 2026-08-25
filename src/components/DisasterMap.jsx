import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import { SEVERITY_COLORS } from '../utils/constants.js'
import { ConfidenceBar, StatusBadge } from './Badges.jsx'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function createIcon(color) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

export default function DisasterMap({ incidents, center = [22.5, 80], zoom = 5, height = '500px', onSelect }) {
  return (
    <div style={{ height, width: '100%' }} className="map-container">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {incidents && incidents.map((incident) => {
          const color = SEVERITY_COLORS[incident.severity] || '#6b7280'
          return (
            <Marker
              key={incident.incidentId}
              position={[incident.latitude, incident.longitude]}
              icon={createIcon(color)}
              eventHandlers={onSelect ? { click: () => onSelect(incident) } : undefined}
            >
              <Popup>
                <div className="map-popup">
                  <div className="map-popup-title">{incident.disasterType}</div>
                  <div className="map-popup-row"><strong>Location:</strong> {incident.location}</div>
                  <div className="map-popup-row"><strong>Severity:</strong> <span style={{ color }}>{incident.severity}</span></div>
                  <div className="map-popup-row"><strong>Confidence:</strong> {incident.confidence}%</div>
                  <div className="map-popup-row"><strong>Status:</strong> {incident.status}</div>
                  <div className="map-popup-row mono">{incident.incidentId}</div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
