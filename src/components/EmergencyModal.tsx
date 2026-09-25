import React, { useState } from 'react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAlert: (zone: string, incident: string) => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  onTriggerAlert,
}) => {
  const [incidentType, setIncidentType] = useState('Severe Road Cavity / Skid Hazard');
  const [targetZone, setTargetZone] = useState('Sector 4B (Avenue Road Corridor)');
  const [broadcastChannel, setBroadcastChannel] = useState('all');

  if (!isOpen) return null;

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    onTriggerAlert(targetZone, incidentType);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#31302b]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl border border-[#ffb59c] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#4d1e0d] text-[#ffdbcf] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-[#ba1a1a] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </span>
            <div>
              <h3 className="font-headline text-base font-bold text-white">
                Emergency Alert Broadcast
              </h3>
              <span className="font-mono text-xs text-[#ffdbcf]">
                Ward 42 Priority Incident System
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#ffdbcf] hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleBroadcast} className="p-5 flex flex-col gap-4 text-xs font-body">
          <div className="p-3 bg-[#ffdad6]/40 border border-[#ba1a1a]/30 rounded-lg text-[#93000a]">
            <p className="font-bold flex items-center gap-1.5 font-headline">
              <span className="material-symbols-outlined text-[16px]">priority_high</span>
              Authoritative Municipal Escalation
            </p>
            <p className="mt-1 leading-relaxed">
              This action will dispatch instant SMS sirens to the Zonal Commissioner, Highways Divisional Engineer, and all active field dispatch leads in the affected sector.
            </p>
          </div>

          <div>
            <label className="block font-mono text-xs text-[#1c1c16] font-semibold mb-1">
              Select Incident Severity Profile
            </label>
            <select
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value)}
              className="w-full bg-[#f7f3ea] border border-[#c2c8c2]/40 rounded p-2 text-[#1c1c16] font-mono text-xs"
            >
              <option value="Severe Road Cavity / Skid Hazard">Severe Road Cavity / Skid Hazard (Metro Corridor)</option>
              <option value="Live High-Voltage Cable Down">Live High-Voltage Cable Down (School Crosswalk)</option>
              <option value="Potable Water Distribution Rupture">Potable Water Distribution Rupture (&gt;3 bar flood)</option>
              <option value="Subway Storm Sump Pump Failure">Subway Storm Sump Pump Failure (Monsoonal Inundation)</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-xs text-[#1c1c16] font-semibold mb-1">
              Target Ward Sector
            </label>
            <select
              value={targetZone}
              onChange={(e) => setTargetZone(e.target.value)}
              className="w-full bg-[#f7f3ea] border border-[#c2c8c2]/40 rounded p-2 text-[#1c1c16] font-mono text-xs"
            >
              <option value="Sector 4B (Avenue Road Corridor)">Sector 4B (Avenue Road Corridor &amp; Metro 18)</option>
              <option value="Sector 4A (Govt High School &amp; Market)">Sector 4A (Govt High School &amp; Market)</option>
              <option value="Sector 4C (Clinic &amp; Hospital Ring)">Sector 4C (Clinic &amp; Hospital Ring)</option>
              <option value="All Ward 42 Sectors (General Priority Broadcast)">All Ward 42 Sectors (General Priority Broadcast)</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-xs text-[#1c1c16] font-semibold mb-1">
              Broadcast Priority Channels
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setBroadcastChannel('all')}
                className={`p-2 rounded border text-center font-mono text-xs ${
                  broadcastChannel === 'all'
                    ? 'bg-[#1a3125] text-white border-[#1a3125]'
                    : 'bg-[#f7f3ea] border-[#c2c8c2]/40 text-[#1c1c16]'
                }`}
              >
                All Channels
              </button>
              <button
                type="button"
                onClick={() => setBroadcastChannel('field')}
                className={`p-2 rounded border text-center font-mono text-xs ${
                  broadcastChannel === 'field'
                    ? 'bg-[#1a3125] text-white border-[#1a3125]'
                    : 'bg-[#f7f3ea] border-[#c2c8c2]/40 text-[#1c1c16]'
                }`}
              >
                Field Radios Only
              </button>
              <button
                type="button"
                onClick={() => setBroadcastChannel('public')}
                className={`p-2 rounded border text-center font-mono text-xs ${
                  broadcastChannel === 'public'
                    ? 'bg-[#1a3125] text-white border-[#1a3125]'
                    : 'bg-[#f7f3ea] border-[#c2c8c2]/40 text-[#1c1c16]'
                }`}
              >
                Citizen Geo-SMS
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#c2c8c2]/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-[#f2ede4] text-[#1c1c16] font-mono text-xs hover:bg-[#ece8df]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#ba1a1a] text-white font-mono text-xs font-bold hover:bg-[#93000a] transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">campaign</span>
              Transmit Priority Siren Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
