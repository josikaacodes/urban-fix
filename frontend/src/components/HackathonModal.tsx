import React from 'react';
import { X, KeyRound, Shield, Briefcase, Wrench, UserCheck, CheckCircle2 } from 'lucide-react';

interface HackathonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole?: (email: string, pass: string) => void;
}

export const HackathonModal: React.FC<HackathonModalProps> = ({ isOpen, onClose, onSelectRole }) => {
  if (!isOpen) return null;

  const credentials = [
    {
      role: 'Citizen',
      title: 'Citizen Reporting Experience',
      email: 'citizen@urbanfix.in',
      pass: 'UrbanFix@123',
      name: 'Arun Prakash',
      badge: 'Verified Citizen (Ward 142 - Porur)',
      desc: 'Full reporting lifecycle: Photo/Voice input, AI analysis preview, duplicate merging, and final confirmation.',
      icon: UserCheck,
      color: 'border-[#188977] bg-[#188977]/5 text-[#188977]',
    },
    {
      role: 'Municipal Authority',
      title: 'Municipal Command Center',
      email: 'authority@urbanfix.in',
      pass: 'UrbanFix@123',
      name: 'Dr. K. Senthil Kumar IAS',
      badge: 'Municipal Commissioner & City Lead',
      desc: 'City-wide operations: Live incident telemetry, priority triage queue, worker dispatch, SLA monitor & insights.',
      icon: Shield,
      color: 'border-[#173B57] bg-[#173B57]/5 text-[#173B57]',
    },
    {
      role: 'Department Head',
      title: 'Roads & Infrastructure Lead',
      email: 'roads@urbanfix.in',
      pass: 'UrbanFix@123',
      name: 'Er. R. Meenakshi Sundaram',
      badge: 'Superintending Engineer (Roads)',
      desc: 'Department workload analytics, team reassignments, escalation management, and evidence auditing.',
      icon: Briefcase,
      color: 'border-[#246B8E] bg-[#246B8E]/5 text-[#246B8E]',
    },
    {
      role: 'Field Worker',
      title: 'UrbanFix Field Operations',
      email: 'worker@urbanfix.in',
      pass: 'UrbanFix@123',
      name: 'Ravi Kumar',
      badge: 'Senior Road Maintenance Tech',
      desc: 'Mobile-first field view: Accept task, navigate, upload completion photo, trigger AI vision verification.',
      icon: Wrench,
      color: 'border-[#D97824] bg-[#D97824]/5 text-[#D97824]',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#173B57]/60 backdrop-blur-xs">
      <div className="bg-[#F7F9FA] rounded-lg shadow-xl border border-[#C8D3D9] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#C8D3D9] bg-[#18384D] text-white rounded-t-lg">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-[#2F7FA3]/40 border border-[#2F7FA3]">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Hackathon Judge Access</h3>
              <p className="text-xs text-[#DDE5E9]">Direct credentials for all 4 connected system roles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="p-3 bg-[#E9EEF1] rounded-md border border-[#C8D3D9] text-xs text-[#24333D]">
            <p className="font-semibold mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#24875D]" />
              Real Persistent Authentication & Data
            </p>
            <p className="text-[#5C6971]">
              You can copy credentials to type them manually into the login form, or click <strong>“Use This Account”</strong> to auto-populate the form and test authentication.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {credentials.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.email}
                  className={p-4 rounded-lg border flex flex-col justify-between  bg-white}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#E9EEF1] text-[#24333D]">
                        {c.role}
                      </span>
                      <Icon className="w-4 h-4 opacity-80" />
                    </div>
                    <h4 className="text-sm font-bold text-[#24333D]">{c.name}</h4>
                    <p className="text-[11px] text-[#5C6971] mb-2">{c.badge}</p>
                    <p className="text-xs text-[#5C6971] line-clamp-2 mb-3">{c.desc}</p>
                    
                    <div className="bg-[#E9EEF1] p-2.5 rounded border border-[#C8D3D9] font-mono text-[11px] text-[#24333D] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[#5C6971]">Email:</span>
                        <span className="font-semibold">{c.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5C6971]">Pass:</span>
                        <span className="font-semibold">{c.pass}</span>
                      </div>
                    </div>
                  </div>

                  {onSelectRole && (
                    <button
                      onClick={() => {
                        onSelectRole(c.email, c.pass);
                        onClose();
                      }}
                      className="mt-3 w-full py-1.5 px-3 rounded bg-[#173B57] text-white text-xs font-medium hover:bg-[#246B8E] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>Use This Account</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#C8D3D9] bg-[#E9EEF1] flex justify-end rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-md border border-[#C8D3D9] bg-white text-[#24333D] hover:bg-[#DDE5E9] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
