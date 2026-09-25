import React, { useState } from 'react';
import { Ticket } from '../types';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  onConfirmVerification: (ticketId: string, remarks: string, photoUrl: string) => void;
  onToast: (msg: string) => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onConfirmVerification,
  onToast,
}) => {
  const [remarks, setRemarks] = useState(
    'Pipeline collar sealed. Hydrostatic test maintained 4.2 bar pressure for 30 minutes without seepage. Cross-road surface restored with granular gravel sub-base.'
  );
  const [photoAttached, setPhotoAttached] = useState(true);
  const sampleProofUrl = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';

  if (!isOpen || !ticket) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmVerification(ticket.id, remarks, sampleProofUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#31302b]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl border border-[#c2c8c2]/40 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#f2ede4] p-4 border-b border-[#c2c8c2]/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-[#4c6451] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </span>
            <div>
              <h3 className="font-headline text-base font-semibold text-[#051c11]">
                Submit Repair Proof &amp; Notify Citizen
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
              After-Repair Inspection Proof (Photograph)
            </label>
            <div
              onClick={() => {
                setPhotoAttached(true);
                onToast('Site photo timestamped with GNSS coordinate lock (13.0815° N, 80.2730° E)');
              }}
              className="border-2 border-dashed border-[#c2c8c2] rounded-xl p-4 text-center bg-[#f7f3ea] hover:bg-[#f2ede4] transition-colors cursor-pointer group"
            >
              <div className="flex flex-col items-center">
                <span className="material-symbols-outlined text-[#4c6451] text-[32px] mb-1 group-hover:scale-110 transition-transform">
                  add_a_photo
                </span>
                <p className="font-headline text-xs font-semibold text-[#051c11]">
                  {photoAttached ? 'Stamped site inspection photograph attached' : 'Click to attach stamped site inspection photograph'}
                </p>
                <span className="font-mono text-[10px] text-[#727973] mt-0.5">
                  Supports JPG, PNG up to 12MB with EXIF GNSS data
                </span>
                {photoAttached && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#c9e4cc] text-[#092011] text-[10px] font-mono font-semibold">
                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                    repair_proof_w42_9812.jpg (3.2MB • GNSS Verified)
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-[#1c1c16] font-semibold mb-1">
              Inspector Verification Remarks
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Detail pressure test results, asphalt leveling, or luminaire lux checks..."
              className="w-full p-2.5 bg-[#f7f3ea] border border-[#c2c8c2]/40 rounded focus:outline-none focus:border-[#051c11] text-[#1c1c16] text-xs font-body"
            />
          </div>

          <div className="p-3 bg-[#c9e4cc]/40 rounded-lg border border-[#4c6451]/30 flex items-center gap-2 text-xs text-[#4e6753]">
            <span className="material-symbols-outlined text-[18px]">sms</span>
            <span>
              Will trigger instant bilingual SMS &amp; WhatsApp link to the citizen for 24h verification approval.
            </span>
          </div>

          {/* Actions */}
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
              className="px-4 py-2 rounded bg-[#1a3125] text-white hover:bg-opacity-95 font-mono text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">send</span>
              Seal &amp; Request Citizen Verification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
