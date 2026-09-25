import React, { useState } from 'react';
import { Ticket } from '../types';

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  onConfirmDispatch: (ticketId: string, team: string, eta: number, notes: string) => void;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onConfirmDispatch,
}) => {
  const [team, setTeam] = useState('Asphalt Patch Unit B (Specialist Quick-Set) — 3 Mins Away');
  const [eta, setEta] = useState(30);
  const [instructions, setInstructions] = useState(
    'Urgent: Secure perimeter with high-visibility reflector cones near Metro Pillar 18 before beginning compacting work.'
  );
  const [notifyResidents, setNotifyResidents] = useState(true);

  if (!isOpen || !ticket) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmDispatch(ticket.id, team, eta, instructions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#31302b]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl border border-[#c2c8c2]/40 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#f2ede4] p-4 border-b border-[#c2c8c2]/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-[#1a3125] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            </span>
            <div>
              <h3 className="font-headline text-base font-semibold text-[#051c11]">
                Dispatch Field Crew
              </h3>
              <span className="font-mono text-xs text-[#424844]">
                Docket: {ticket.docketNumber}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#727973] hover:text-[#1c1c16] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-xs font-body">
          <div>
            <label className="block font-mono text-xs text-[#1c1c16] font-semibold mb-1">
              Assigned Operational Team
            </label>
            <select
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="w-full bg-[#f7f3ea] border border-[#c2c8c2]/40 rounded p-2 text-[#1c1c16] focus:outline-none focus:border-[#051c11] font-mono text-xs"
            >
              <option value="Asphalt Patch Unit B (Specialist Quick-Set) — 3 Mins Away">
                Asphalt Patch Unit B (Specialist Quick-Set) — 3 Mins Away
              </option>
              <option value="Lineman Crew 4 (TANGEDCO Electric) — Idle">
                Lineman Crew 4 (TANGEDCO Electric) — Idle
              </option>
              <option value="Hydro Isolation Unit 1 (CMWSSB Quick Response) — Active">
                Hydro Isolation Unit 1 (CMWSSB Quick Response) — Active
              </option>
              <option value="Sanitation Rapid Unit 2 (Civic Clearance) — Standby">
                Sanitation Rapid Unit 2 (Civic Clearance) — Standby
              </option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-xs text-[#1c1c16] font-semibold mb-1">
              Expected On-Site SLA Response
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="15"
                max="120"
                step="15"
                value={eta}
                onChange={(e) => setEta(Number(e.target.value))}
                className="w-full accent-[#1a3125] cursor-pointer"
              />
              <span className="font-mono text-xs text-[#051c11] font-bold min-w-[85px] text-right">
                {eta} minutes
              </span>
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-[#1c1c16] font-semibold mb-1">
              Internal Work Order Instructions
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Specify safety cones, cold asphalt spec, or road diversion notices..."
              className="w-full p-2.5 bg-[#f7f3ea] border border-[#c2c8c2]/40 rounded focus:outline-none focus:border-[#051c11] text-[#1c1c16] text-xs font-body"
            />
          </div>

          <div className="p-3 bg-[#f2ede4] rounded-lg border border-[#c2c8c2]/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#424844]">
              <span className="material-symbols-outlined text-[16px] text-[#4c6451]">
                broadcast_on_personal
              </span>
              <span>Auto-notify Ward 42 Councillor &amp; Resident group</span>
            </div>
            <input
              type="checkbox"
              checked={notifyResidents}
              onChange={(e) => setNotifyResidents(e.target.checked)}
              className="rounded border-[#c2c8c2] text-[#1a3125] focus:ring-0 cursor-pointer"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#c2c8c2]/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-[#f2ede4] text-[#1c1c16] hover:bg-[#ece8df] font-mono text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#1a3125] text-white hover:bg-opacity-95 font-mono text-xs font-semibold shadow-xs transition-all"
            >
              Confirm Dispatch &amp; Alert Ward Leader
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
