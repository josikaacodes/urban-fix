import React, { useState } from 'react';
import { Ticket } from '../types';

interface ShiftLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: Ticket[];
  onToast: (msg: string) => void;
}

export const ShiftLogModal: React.FC<ShiftLogModalProps> = ({
  isOpen,
  onClose,
  tickets,
  onToast,
}) => {
  const [handoverNote, setHandoverNote] = useState(
    'Asphalt Patch B deployed to Metro Pillar 18 (#W42-9842) under critical 4h SLA clock. Lineman 3 wrapping up school luminaire. Afternoon shift nodal engineer to audit water coupling sign-offs in Sector 4C.'
  );

  if (!isOpen) return null;

  const criticalOpen = tickets.filter(t => t.status === 'critical').length;
  const inProgress = tickets.filter(t => t.status === 'assigned').length;
  const pendingVerify = tickets.filter(t => t.status === 'pending').length;

  const handleSave = () => {
    onToast('Shift Log synchronized and committed to GCC Ward 42 Central Registry.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#31302b]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white max-w-xl w-full rounded-2xl border border-[#c2c8c2]/40 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#f2ede4] p-4 border-b border-[#c2c8c2]/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-[#1a3125] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">event_note</span>
            </span>
            <div>
              <h3 className="font-headline text-base font-semibold text-[#051c11]">
                Nodal Shift Ledger &amp; Handover
              </h3>
              <span className="font-mono text-xs text-[#424844]">
                Morning Shift (06:00 - 14:00 IST) • Ward 42 Zonal Office
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#727973] hover:text-[#1c1c16]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4 text-xs font-body">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-[#f7f3ea] rounded-lg border border-[#c2c8c2]/30 text-center">
              <span className="font-mono text-[10px] text-[#727973] uppercase block">Critical Open</span>
              <span className="font-headline text-xl font-bold text-[#ba1a1a]">{criticalOpen}</span>
            </div>
            <div className="p-3 bg-[#f7f3ea] rounded-lg border border-[#c2c8c2]/30 text-center">
              <span className="font-mono text-[10px] text-[#727973] uppercase block">In Field</span>
              <span className="font-headline text-xl font-bold text-[#051c11]">{inProgress}</span>
            </div>
            <div className="p-3 bg-[#f7f3ea] rounded-lg border border-[#c2c8c2]/30 text-center">
              <span className="font-mono text-[10px] text-[#727973] uppercase block">Awaiting Sign-off</span>
              <span className="font-headline text-xl font-bold text-[#4c6451]">{pendingVerify}</span>
            </div>
          </div>

          <div>
            <span className="font-mono text-xs text-[#424844] block mb-1 font-semibold">
              Duty Officer Verification
            </span>
            <div className="p-2.5 bg-[#f7f3ea] rounded border border-[#c2c8c2]/30 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#051c11]">Eng. R. Sundaram</span>
                <span className="text-[#727973] text-[11px] block font-mono">GCC Badge: #GCC-W42-901</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#c9e4cc] text-[#092011] text-[11px] font-mono font-semibold">
                Biometric Authenticated
              </span>
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-[#1c1c16] font-semibold mb-1">
              Handover Remarks for Relieving Officer (Afternoon Shift)
            </label>
            <textarea
              rows={4}
              value={handoverNote}
              onChange={(e) => setHandoverNote(e.target.value)}
              className="w-full p-2.5 bg-[#f7f3ea] border border-[#c2c8c2]/40 rounded focus:outline-none focus:border-[#051c11] text-[#1c1c16] font-body text-xs leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-[#c2c8c2]/20">
            <button
              type="button"
              onClick={() => onToast('Shift Ledger exported to CSV / Print format')}
              className="text-[#4c6451] hover:underline font-mono text-xs flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              Export Shift PDF/CSV
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded bg-[#f2ede4] text-[#1c1c16] font-mono text-xs hover:bg-[#ece8df]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded bg-[#1a3125] text-white font-mono text-xs font-semibold hover:bg-opacity-95 shadow-xs"
              >
                Sign &amp; Sync Shift Log
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
