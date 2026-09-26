import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Incident } from '../types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { MapPin, Navigation } from 'lucide-react';

// Custom Colored Leaflet SVG Icon Builder
const createCustomMarker = (severity: string) => {
  let color = '#24875D'; // low
  if (severity === 'CRITICAL') color = '#C64646';
  else if (severity === 'HIGH') color = '#D97824';
  else if (severity === 'MEDIUM') color = '#C99A28';

  const svg = 
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24c0-6.627-5.373-12-12-12z" fill="" stroke="#ffffff" stroke-width="2"/>
      <circle cx="12" cy="12" r="5" fill="#ffffff"/>
    </svg>
  ;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: svg,
    iconSize: [28, 42],
    iconAnchor: [14, 42],
    popupAnchor: [0, -38],
  });
};

interface IncidentMapProps {
  incidents: Incident[];
  selectedIncident?: Incident | null;
  onSelectIncident?: (incident: Incident) => void;
  center?: [number, number];
  zoom?: number;
  interactiveSelect?: boolean;
  onLocationSelect?: (lat: number, lon: number) => void;
  height?: string;
}

// Helper to auto center when selectedIncident changes
const MapRecenter: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

// Helper for clickable location picking
const LocationPicker: React.FC<{ onPick: (lat: number, lon: number) => void }> = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const IncidentMap: React.FC<IncidentMapProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  center = [13.0382, 80.1565], // Chennai default
  zoom = 12,
  interactiveSelect = false,
  onLocationSelect,
  height = '480px',
}) => {
  const activeCenter: [number, number] = selectedIncident
    ? [selectedIncident.latitude, selectedIncident.longitude]
    : center;

  return (
    <div style={{ height, width: '100%' }} className="relative rounded-lg overflow-hidden border border-[#C8D3D9] shadow-xs">
      <MapContainer
        center={activeCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter center={activeCenter} />

        {interactiveSelect && onLocationSelect && (
          <LocationPicker onPick={onLocationSelect} />
        )}

        {incidents.map((inc) => (
          <Marker
            key={inc.id}
            position={[inc.latitude, inc.longitude]}
            icon={createCustomMarker(inc.severity)}
            eventHandlers={{
              click: () => onSelectIncident && onSelectIncident(inc),
            }}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-[200px] text-[#24333D]">
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <span className="font-mono font-bold text-xs text-[#173B57]">{inc.id}</span>
                  <PriorityBadge severity={inc.severity} score={inc.priority_score} size="sm" />
                </div>
                <h4 className="font-bold text-xs text-[#24333D] mb-1">{inc.category}</h4>
                <p className="text-[11px] text-[#5C6971] line-clamp-2 mb-2">{inc.description}</p>
                <div className="flex items-center justify-between pt-1 border-t border-[#C8D3D9] text-[10px]">
                  <span className="text-[#5C6971]">{inc.ward || 'Chennai'}</span>
                  <StatusBadge status={inc.status} size="sm" />
                </div>
                {onSelectIncident && (
                  <button
                    onClick={() => onSelectIncident(inc)}
                    className="mt-2 w-full py-1 bg-[#173B57] text-white text-[11px] font-semibold rounded hover:bg-[#246B8E] transition-colors"
                  >
                    View Details
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
