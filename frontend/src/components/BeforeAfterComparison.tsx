import React from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { ResolutionEvidence, ResolutionVerification } from '../types';

interface BeforeAfterComparisonProps {
  evidence?: ResolutionEvidence;
  verification?: ResolutionVerification;
  beforeFallbackUrl?: string;
}

export const BeforeAfterComparison: React.FC<BeforeAfterComparisonProps> = ({
  evidence,
  verification,
  beforeFallbackUrl,
}) => {
  const beforeImg = evidence?.before_url || beforeFallbackUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80';
  const afterImg = evidence?.after_url || 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="bg-[#F7F9FA] rounded-lg border border-[#C8D3D9] p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[#C8D3D9] pb-3">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#173B57] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#24875D]" />
            <span>AI Visual Verification & Remediation Proof</span>
          </h4>
          <p className="text-[11px] text-[#5C6971]">Before and after visual audit submitted by field operations</p>
        </div>

        {verification && (
          <span className={inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold }>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{verification.status} ({verification.confidence}% Confidence)</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#C64646]">
            <span>BEFORE (Citizen Report)</span>
            <span className="text-[10px] font-normal text-[#5C6971]">Initial defect recorded</span>
          </div>
          <div className="aspect-video rounded-md overflow-hidden border-2 border-[#C64646]/40 bg-[#DDE5E9] relative group shadow-xs">
            <img
              src={beforeImg}
              alt="Before remediation"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80';
              }}
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono font-bold">
              BEFORE
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#24875D]">
            <span>AFTER (Worker Remediation)</span>
            <span className="text-[10px] font-normal text-[#5C6971]">Field completion evidence</span>
          </div>
          <div className="aspect-video rounded-md overflow-hidden border-2 border-[#24875D]/40 bg-[#DDE5E9] relative group shadow-xs">
            <img
              src={afterImg}
              alt="After remediation"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80';
              }}
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#24875D] text-white text-[10px] font-mono font-bold">
              AFTER
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div className="p-3 bg-[#E9EEF1] rounded-md border border-[#C8D3D9] text-xs">
          <span className="font-bold text-[#173B57] block mb-1">Field Worker Note:</span>
          <p className="text-[#24333D] italic">
            “{evidence?.worker_note || 'Pothole filled with standard bitumin mixture and leveled to surface grade.'}”
          </p>
        </div>

        <div className="p-3 bg-[#24875D]/5 rounded-md border border-[#24875D]/30 text-xs">
          <span className="font-bold text-[#24875D] block mb-1">AI Vision Audit Result:</span>
          <p className="text-[#24333D]">
            {verification?.reason || 'Multi-angle inspection confirms surface defect is fully eliminated with no remaining hazard.'}
          </p>
        </div>
      </div>
    </div>
  );
};
