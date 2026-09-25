import React, { useState } from 'react';
import { FieldUnit } from '../types';

interface ActiveCrewsViewProps {
  crews: FieldUnit[];
  onDispatchUnit: (unitId: string) => void;
  onToast: (msg: string) => void;
}

export const ActiveCrewsView: React.FC<ActiveCrewsViewProps> = ({
  crews,
  onDispatchUnit,
  onToast,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredCrews = crews.filter((c) => {
    if (filterType !== 'all' && c.type !== filterType) return false;
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.lead.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-[1720px] w-full mx-auto p-4 sm:p-6 flex flex-col gap-6 animate-in fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#c2c8c2]/30 shadow-xs">
        <div>
          <h2 className="font-headline text-lg sm:text-xl font-bold text-[#051c11]">
            Active Field Units Roster &amp; Telemetry
          </h2>
          <p className="font-body text-xs text-[#424844]">
            14 deployed municipal units across Electrical, Highways Patch, Hydro Drainage, and Sanitation.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
              filterType === 'all'
                ? 'bg-[#1a3125] text-white'
                : 'bg-[#f2ede4] text-[#1c1c16] hover:bg-[#ece8df]'
            }`}
          >
            All Units ({crews.length})
          </button>
          <button
            onClick={() => setFilterType('lineman')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
              filterType === 'lineman'
                ? 'bg-[#1a3125] text-white'
                : 'bg-[#f2ede4] text-[#1c1c16] hover:bg-[#ece8df]'
            }`}
          >
            Linemen (4)
          </button>
          <button
            onClick={() => setFilterType('patch')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
              filterType === 'patch'
                ? 'bg-[#1a3125] text-white'
                : 'bg-[#f2ede4] text-[#1c1c16] hover:bg-[#ece8df]'
            }`}
          >
            Patch (3)
          </button>
          <button
            onClick={() => setFilterType('hydro')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
              filterType === 'hydro'
                ? 'bg-[#1a3125] text-white'
                : 'bg-[#f2ede4] text-[#1c1c16] hover:bg-[#ece8df]'
            }`}
          >
            Hydro (4)
          </button>
          <button
            onClick={() => setFilterType('sanitation')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
              filterType === 'sanitation'
                ? 'bg-[#1a3125] text-white'
                : 'bg-[#f2ede4] text-[#1c1c16] hover:bg-[#ece8df]'
            }`}
          >
            Sanitation (3)
          </button>
        </div>
      </div>

      {/* Grid of Crew Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCrews.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-xl border border-[#c2c8c2]/30 p-4 shadow-xs hover:border-[#4c6451] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-headline text-sm font-bold text-[#051c11]">{c.name}</h3>
                  <span className="font-mono text-[10px] text-[#4c6451] uppercase tracking-wider block">
                    {c.typeLabel}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    c.status === 'On-Site'
                      ? 'bg-[#c9e4cc] text-[#092011]'
                      : c.status === 'Deployed'
                      ? 'bg-[#ece8df] text-[#1c1c16]'
                      : 'bg-[#f2ede4] text-[#727973]'
                  }`}
                >
                  {c.status}
                </span>
              </div>

              <div className="p-3 bg-[#f7f3ea] rounded-lg border border-[#c2c8c2]/20 my-3 flex flex-col gap-1.5 text-xs font-body">
                <div className="flex items-center justify-between">
                  <span className="text-[#727973] font-mono text-[10px]">Crew Lead:</span>
                  <span className="font-semibold text-[#051c11]">{c.lead}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#727973] font-mono text-[10px]">Location:</span>
                  <span className="text-[#1c1c16] font-mono text-[11px] truncate max-w-[180px]">{c.location}</span>
                </div>
                {c.activeDocket && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#727973] font-mono text-[10px]">Active Docket:</span>
                    <span className="font-mono text-xs font-bold text-[#051c11]">{c.activeDocket}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[#727973] font-mono text-[10px]">Unit Battery:</span>
                  <span className="font-mono text-xs font-semibold text-[#4c6451]">{c.battery}% Nominal</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#c2c8c2]/20">
              <span className="font-mono text-[11px] text-[#727973]">{c.contactNumber}</span>
              <button
                onClick={() => onToast(`Radio telemetry ping transmitted to ${c.name} (${c.lead}). Channel open.`)}
                className="px-3 py-1 rounded bg-[#f2ede4] hover:bg-[#ece8df] text-xs font-mono text-[#051c11] border border-[#c2c8c2]/30 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">cell_tower</span>
                Radio Ping
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
