import React, { useState } from 'react';
import { Ticket } from '../types';

interface InspectorCardProps {
  ticket: Ticket;
  onDispatch: (ticketId: string) => void;
  onReassign: (ticketId: string) => void;
  onVerifyProof?: (ticketId: string) => void;
  onToast: (msg: string) => void;
}

export const InspectorCard: React.FC<InspectorCardProps> = ({
  ticket,
  onDispatch,
  onReassign,
  onVerifyProof,
  onToast,
}) => {
  const [imgError, setImgError] = useState(false);

  // Format SLA timer
  const formatSla = (seconds: number) => {
    if (seconds <= 0) return 'SLA Expired';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m remaining`;
  };

  return (
    <div className="bg-white rounded-xl border border-[#c2c8c2]/30 p-4 shadow-xs transition-all hover:border-[#4c6451]">
      {/* Header bar */}
      <div className="flex items-start justify-between border-b border-[#c2c8c2]/20 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${
              ticket.status === 'critical'
                ? 'bg-[#ffdbcf] text-[#370e01]'
                : ticket.status === 'assigned'
                ? 'bg-[#c9e4cc] text-[#4e6753]'
                : 'bg-[#cee9d1] text-[#092011]'
            }`}
          >
            {ticket.status === 'critical'
              ? 'CRITICAL SLA'
              : ticket.status === 'assigned'
              ? 'FIELD UNIT EN ROUTE'
              : 'READY FOR SIGN-OFF'}
          </span>
          <span className="font-mono text-sm text-[#051c11] font-bold">
            {ticket.docketNumber}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs font-mono font-semibold text-[#ba1a1a]">
          <span className="material-symbols-outlined text-[16px]">hourglass_top</span>
          <span>{formatSla(ticket.slaRemainingSeconds)}</span>
        </div>
      </div>

      {/* Grid: Photo & Telemetry Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        {/* Inspection Evidence Image with resilient fallback */}
        <div className="sm:col-span-1 rounded-lg overflow-hidden border border-[#c2c8c2]/30 bg-[#f2ede4] relative aspect-[4/3] flex items-center justify-center">
          {!imgError ? (
            <img
              src={ticket.evidencePhoto}
              alt="Defect Evidence"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-[#727973] p-2 text-center">
              <span className="material-symbols-outlined text-2xl mb-1">photo_camera</span>
              <span className="text-[10px] font-mono">GNSS Telemetry Image</span>
            </div>
          )}
          <div className="absolute bottom-1 right-1 bg-white/90 backdrop-blur px-1.5 py-0.5 rounded text-[9px] font-mono text-[#1c1c16] shadow-xs">
            GNSS Tagged
          </div>
        </div>

        {/* Telemetry Specs */}
        <div className="sm:col-span-2 flex flex-col justify-between font-body text-xs sm:text-sm">
          <div>
            <h3 className="font-headline text-sm font-semibold text-[#051c11] leading-snug">
              {ticket.title}
            </h3>
            {ticket.quote && (
              <p className="text-xs text-[#424844] mt-1 italic leading-relaxed">
                {ticket.quote}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#c2c8c2]/20 text-xs">
            <div>
              <span className="text-[#727973] font-mono text-[10px] block uppercase">Geocoordinates:</span>
              <span className="font-mono text-xs text-[#051c11] font-semibold">{ticket.coordinates}</span>
            </div>
            <div>
              <span className="text-[#727973] font-mono text-[10px] block uppercase">AI Vision Confidence:</span>
              <span className="font-mono text-xs text-[#4c6451] font-bold">{ticket.aiConfidence}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inspector Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#c2c8c2]/10">
        {ticket.status === 'pending' ? (
          <button
            onClick={() => onVerifyProof?.(ticket.id)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-[#1a3125] text-white text-xs font-mono font-medium hover:bg-opacity-95 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">verified</span>
            Verify Proof & Close Docket
          </button>
        ) : (
          <button
            onClick={() => onDispatch(ticket.id)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-[#1a3125] text-white text-xs font-mono font-medium hover:bg-opacity-95 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">local_shipping</span>
            {ticket.status === 'assigned' ? 'Re-dispatch Unit' : 'Dispatch Field Unit'}
          </button>
        )}

        <button
          onClick={() => onReassign(ticket.id)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-[#f2ede4] text-[#1c1c16] hover:bg-[#e6e2d9] text-xs font-mono border border-[#c2c8c2]/30 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
          Re-assign Board
        </button>
      </div>
    </div>
  );
};
