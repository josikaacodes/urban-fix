import React, { useState } from 'react';
import { Ticket, FieldUnit } from '../types';

interface SpatialMapProps {
  tickets: Ticket[];
  crews: FieldUnit[];
  selectedTicketId: string;
  onSelectTicket: (id: string) => void;
  onToast: (msg: string) => void;
  fullScreen?: boolean;
}

export const SpatialMap: React.FC<SpatialMapProps> = ({
  tickets,
  crews,
  selectedTicketId,
  onSelectTicket,
  onToast,
  fullScreen = false,
}) => {
  const [activeLayer, setActiveLayer] = useState<'pointers' | 'crews' | 'heatmap'>('pointers');
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);

  const handleLayerToggle = (layer: 'pointers' | 'crews' | 'heatmap') => {
    setActiveLayer(layer);
    onToast(`GIS Layer toggled: ${layer.charAt(0).toUpperCase() + layer.slice(1)}`);
  };

  return (
    <div className={`bg-white rounded-xl border border-[#c2c8c2]/30 p-4 shadow-xs flex flex-col ${fullScreen ? 'h-full' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-headline text-base sm:text-lg text-[#051c11] font-semibold">
            Ward 42 Spatial Telemetry
          </h2>
          <p className="font-body text-xs text-[#424844]">
            Sector 4B • GNSS Live Triage Canvas
          </p>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-1 bg-[#f2ede4] p-1 rounded-lg border border-[#c2c8c2]/20">
          <button
            onClick={() => handleLayerToggle('pointers')}
            className={`px-2 py-0.5 text-xs font-mono rounded transition-colors ${
              activeLayer === 'pointers'
                ? 'bg-white text-[#051c11] shadow-xs font-semibold'
                : 'text-[#424844] hover:text-[#051c11]'
            }`}
          >
            Pointers
          </button>
          <button
            onClick={() => handleLayerToggle('crews')}
            className={`px-2 py-0.5 text-xs font-mono rounded transition-colors ${
              activeLayer === 'crews'
                ? 'bg-white text-[#051c11] shadow-xs font-semibold'
                : 'text-[#424844] hover:text-[#051c11]'
            }`}
          >
            Crews
          </button>
          <button
            onClick={() => handleLayerToggle('heatmap')}
            className={`px-2 py-0.5 text-xs font-mono rounded transition-colors ${
              activeLayer === 'heatmap'
                ? 'bg-white text-[#051c11] shadow-xs font-semibold'
                : 'text-[#424844] hover:text-[#051c11]'
            }`}
          >
            Heatmap
          </button>
        </div>
      </div>

      {/* Abstract Geometric Map Canvas */}
      <div className={`relative w-full ${fullScreen ? 'flex-1 min-h-[500px]' : 'h-[360px]'} bg-[#f4efe6] rounded-lg border border-[#c2c8c2]/40 overflow-hidden select-none`}>
        {/* Road Vector Base Map */}
        <svg 
          viewBox="0 0 560 380" 
          className="absolute inset-0 w-full h-full object-cover" 
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e3ded5" strokeWidth="0.7" />
            </pattern>

            {/* Heatmap gradients */}
            <radialGradient id="heatAvenue" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ba1a1a" stopOpacity="0.65" />
              <stop offset="60%" stopColor="#ffb59c" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ffb59c" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="heatSchool" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#d97706" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#c9e4cc" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#c9e4cc" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background fill */}
          <rect width="100%" height="100%" fill="#f7f3ea" />
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Ward Boundary Polygon */}
          <polygon
            points="20,40 480,20 540,280 320,340 40,310"
            fill="#c9e4cc"
            fillOpacity="0.12"
            stroke="#4c6451"
            strokeDasharray="4 2"
            strokeWidth="1.5"
          />

          {/* Heatmap Layer if active */}
          {activeLayer === 'heatmap' && (
            <g className="animate-in fade-in duration-300">
              <circle cx="265" cy="180" r="90" fill="url(#heatAvenue)" />
              <circle cx="150" cy="110" r="60" fill="url(#heatSchool)" />
              <circle cx="390" cy="240" r="50" fill="url(#heatSchool)" />
              <ellipse cx="200" cy="170" rx="140" ry="40" fill="#ba1a1a" fillOpacity="0.15" />
            </g>
          )}

          {/* Sector Roads */}
          {/* Avenue Road Corridor */}
          <path d="M -20,180 Q 200,160 560,220" fill="none" stroke="#ffffff" strokeWidth="16" />
          <path d="M -20,180 Q 200,160 560,220" fill="none" stroke="#d5d0c7" strokeWidth="1.5" />
          <path d="M -20,180 Q 200,160 560,220" fill="none" opacity="0.4" stroke="#ffb59c" strokeDasharray="8 6" strokeWidth="2" />

          {/* Metro Line 2 Elevated Corridor */}
          <line x1="80" y1="-10" x2="440" y2="380" stroke="#727973" strokeWidth="6" opacity="0.3" strokeLinecap="round" />
          <line x1="80" y1="-10" x2="440" y2="380" stroke="#1a3125" strokeWidth="2" strokeDasharray="4 8" opacity="0.6" />

          {/* Cross Streets */}
          <path d="M 160,20 L 140,340" fill="none" stroke="#ffffff" strokeWidth="10" />
          <path d="M 160,20 L 140,340" fill="none" stroke="#d5d0c7" strokeWidth="1.2" />

          <path d="M 380,30 L 350,330" fill="none" stroke="#ffffff" strokeWidth="8" />
          <path d="M 380,30 L 350,330" fill="none" stroke="#d5d0c7" strokeWidth="1.2" />

          {/* Civic Zones / Landmarks */}
          <rect x="50" y="70" width="80" height="50" rx="4" fill="#ece8df" stroke="#c2c8c2" strokeWidth="1" />
          <text x="56" y="90" fill="#424844" fontFamily="Plus Jakarta Sans" fontSize="8" fontWeight="600">
            Govt High School
          </text>
          <text x="56" y="104" fill="#727973" fontFamily="JetBrains Mono" fontSize="7">
            Zone #42-EDU
          </text>

          <rect x="360" y="90" width="90" height="60" rx="4" fill="#ece8df" stroke="#c2c8c2" strokeWidth="1" />
          <text x="368" y="112" fill="#424844" fontFamily="Plus Jakarta Sans" fontSize="8" fontWeight="600">
            Primary Health Ctr
          </text>
          <text x="368" y="126" fill="#727973" fontFamily="JetBrains Mono" fontSize="7">
            Ward 42 Clinic
          </text>
        </svg>

        {/* Metro Pillar 18 Landmark Marker */}
        <div 
          className="absolute left-[42.8%] top-[39.5%] -translate-x-1/2 -translate-y-1/2 bg-[#ece8df] px-2 py-0.5 rounded border border-[#c2c8c2] text-[9px] font-mono text-[#1c1c16] shadow-xs pointer-events-none"
        >
          Metro Pillar 18
        </div>

        {/* Road Corridor Name Floating Badges */}
        <div className="absolute left-[70%] top-[56%] -translate-x-1/2 text-[8px] font-mono text-[#727973] uppercase tracking-wider bg-white/70 px-1 rounded pointer-events-none">
          Avenue Road Corridor
        </div>

        {/* POINTERS LAYER (Tickets) */}
        {(activeLayer === 'pointers' || activeLayer === 'heatmap') && tickets.map((t) => {
          const isSelected = t.id === selectedTicketId;
          const isHovered = hoveredPin === t.id;
          const leftPercent = `${(t.mapCoords.x / 560) * 100}%`;
          const topPercent = `${(t.mapCoords.y / 380) * 100}%`;

          // Pin style based on status
          let pinBg = 'bg-[#1a3125] text-white';
          let iconName = 'report_problem';
          let pingColor = 'bg-[#ba1a1a]';

          if (t.status === 'critical') {
            pinBg = 'bg-[#320a00] text-[#ffdbcf]';
            iconName = 'report_problem';
            pingColor = 'bg-[#ba1a1a]';
          } else if (t.status === 'assigned') {
            pinBg = 'bg-[#4c6451] text-white';
            iconName = 'lightbulb';
            pingColor = 'bg-[#4c6451]';
          } else if (t.status === 'pending') {
            pinBg = 'bg-[#1a3125] text-white';
            iconName = 'check';
            pingColor = 'bg-[#cee9d1]';
          }

          return (
            <div
              key={t.id}
              style={{ left: leftPercent, top: topPercent }}
              onClick={() => onSelectTicket(t.id)}
              onMouseEnter={() => setHoveredPin(t.id)}
              onMouseLeave={() => setHoveredPin(null)}
              className={`map-pin cursor-pointer absolute -translate-x-1/2 -translate-y-1/2 group transition-all z-20 ${
                isSelected ? 'scale-110 z-30' : ''
              }`}
              title={`${t.docketNumber} (${t.statusLabel})`}
            >
              <div className="relative flex items-center justify-center">
                {t.status === 'critical' && (
                  <span className={`animate-ping absolute inline-flex h-8 w-8 rounded-full ${pingColor} opacity-60`} />
                )}
                {isSelected && (
                  <span className="absolute -inset-1.5 rounded-full border-2 border-[#1a3125] animate-pulse" />
                )}
                <div
                  className={`relative w-8 h-8 rounded-full ${pinBg} flex items-center justify-center font-bold text-xs shadow-md border-2 border-white group-hover:scale-110 transition-transform`}
                >
                  <span className="material-symbols-outlined text-[16px]">{iconName}</span>
                </div>
              </div>

              {/* Monospace Badge Label */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 text-[9px] font-mono rounded whitespace-nowrap shadow transition-opacity ${
                  t.status === 'critical'
                    ? 'bg-[#320a00] text-[#ffdbcf]'
                    : t.status === 'assigned'
                    ? 'bg-[#e6e2d9] text-[#051c11] border border-[#c2c8c2]/40'
                    : 'bg-[#f2ede4] text-[#1c1c16] border border-[#c2c8c2]/40'
                } ${isSelected || isHovered ? 'opacity-100 ring-1 ring-[#051c11]' : 'opacity-90'}`}
              >
                {t.docketNumber} {t.status === 'critical' ? '(02h 15m)' : t.status === 'assigned' ? '(Lineman 3)' : '(Verification)'}
              </div>
            </div>
          );
        })}

        {/* CREWS LAYER (Active Units) */}
        {(activeLayer === 'crews') && crews.map((crew) => {
          const leftPercent = `${(crew.coords.x / 560) * 100}%`;
          const topPercent = `${(crew.coords.y / 380) * 100}%`;

          return (
            <div
              key={crew.id}
              style={{ left: leftPercent, top: topPercent }}
              onClick={() => onToast(`Crew Beacon: ${crew.name} (${crew.lead}) - Status: ${crew.status}`)}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group animate-in fade-in"
              title={`${crew.name} - ${crew.lead}`}
            >
              <div className="relative flex items-center justify-center">
                <div className="w-7 h-7 rounded-full bg-[#1a3125] text-white flex items-center justify-center shadow border-2 border-white group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                </div>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 bg-[#1a3125] text-white text-[8px] font-mono rounded whitespace-nowrap shadow">
                {crew.name} ({crew.battery}%)
              </div>
            </div>
          );
        })}

        {/* Compass Widget */}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded border border-[#c2c8c2]/40 flex items-center gap-1 text-[10px] font-mono text-[#4c6451] shadow-xs pointer-events-none">
          <span className="material-symbols-outlined text-[14px]">explore</span>
          <span>N 13.0827°</span>
        </div>

        {/* Map Scale and Zoom Affordance */}
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded border border-[#c2c8c2]/40 text-[9px] font-mono text-[#727973] flex items-center gap-2">
          <span>Scale: 1:5000</span>
          <span>•</span>
          <span>Sector 4B</span>
        </div>
      </div>
    </div>
  );
};
