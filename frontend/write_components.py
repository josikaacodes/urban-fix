# helper script
import os

components_dir = 'src/components'

# 9. BeforeAfterComparison.tsx
before_after_code = '''import React from 'react';
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
'''

with open(f'{components_dir}/BeforeAfterComparison.tsx', 'w', encoding='utf-8') as f:
    f.write(before_after_code)

# 10. AssignWorkerModal.tsx
assign_modal_code = '''import React, { useState, useEffect } from 'react';
import { X, UserCheck, AlertCircle } from 'lucide-react';
import { Worker, Incident } from '../types';
import { apiService } from '../api/client';

interface AssignWorkerModalProps {
  isOpen: boolean;
  incident: Incident | null;
  onClose: () => void;
  onAssigned: () => void;
}

export const AssignWorkerModal: React.FC<AssignWorkerModalProps> = ({
  isOpen,
  incident,
  onClose,
  onAssigned,
}) => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen && incident) {
      setIsLoading(true);
      setError('');
      apiService
        .getWorkers(incident.department_id)
        .then((res) => {
          setWorkers(res.data);
          if (res.data.length > 0) {
            setSelectedWorkerId(incident.worker_id || res.data[0].id);
          }
        })
        .catch((e) => {
          console.error(e);
          setError('Failed to load department workers');
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, incident]);

  if (!isOpen || !incident) return null;

  const handleAssign = async () => {
    if (!selectedWorkerId) return;
    setIsSubmitting(true);
    setError('');
    try {
      await apiService.assignWorker(incident.id, selectedWorkerId);
      onAssigned();
      onClose();
    } catch (e: any) {
      console.error(e);
      setError(e.response?.data?.detail || 'Assignment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#173B57]/60 backdrop-blur-xs">
      <div className="bg-[#F7F9FA] rounded-lg shadow-xl border border-[#C8D3D9] max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[#C8D3D9] bg-[#18384D] text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#24875D]" />
            <div>
              <h3 className="text-sm font-bold">Assign Field Worker</h3>
              <p className="text-[11px] text-[#DDE5E9]">
                {incident.id} — {incident.category} ({incident.department_name || 'Roads'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded bg-[#C64646]/10 border border-[#C64646]/30 text-xs text-[#C64646] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-[#E9EEF1] rounded-md border border-[#C8D3D9] text-xs text-[#24333D] space-y-1">
            <div className="flex justify-between">
              <span className="text-[#5C6971]">Incident Location:</span>
              <span className="font-semibold">{incident.landmark || 'Chennai'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5C6971]">Priority Score:</span>
              <span className="font-bold text-[#D97824]">{incident.priority_score} / 100 ({incident.severity})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5C6971]">SLA Window:</span>
              <span className="font-mono font-semibold">{incident.sla_hours} Hours</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#173B57] block mb-2">
              Available Department Technicians:
            </label>

            {isLoading ? (
              <div className="p-6 text-center text-xs text-[#5C6971]">Loading team members...</div>
            ) : workers.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#5C6971]">No field workers found for this department.</div>
            ) : (
              <div className="space-y-2">
                {workers.map((w) => {
                  const isSelected = selectedWorkerId === w.id;
                  return (
                    <div
                      key={w.id}
                      onClick={() => setSelectedWorkerId(w.id)}
                      className={p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between }
                    >
                      <div className="flex items-center gap-3">
                        <div className={w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs }>
                          {w.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#24333D]">{w.name}</div>
                          <div className="text-[11px] text-[#5C6971]">{w.skills}</div>
                        </div>
                      </div>

                      <div className="text-right text-xs">
                        <div className="font-semibold text-[#173B57]">{w.active_task_count} Active Tasks</div>
                        <div className="text-[11px] text-[#24875D] font-medium">~{w.distance_km || 1.4} km away</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-[#C8D3D9] bg-[#E9EEF1] flex justify-end gap-2 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-md border border-[#C8D3D9] bg-white text-[#24333D] hover:bg-[#DDE5E9] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedWorkerId || isSubmitting}
            className="px-4 py-2 text-xs font-semibold rounded-md bg-[#246B8E] hover:bg-[#173B57] text-white transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <UserCheck className="w-4 h-4" />
            <span>{isSubmitting ? 'Assigning...' : 'Confirm Assignment'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
'''

with open(f'{components_dir}/AssignWorkerModal.tsx', 'w', encoding='utf-8') as f:
    f.write(assign_modal_code)

# 11. IncidentDetailModal.tsx
detail_modal_code = '''import React, { useState, useEffect } from 'react';
import { 
  X, MapPin, ShieldCheck, UserCheck, ArrowUpRight, CheckSquare, Sparkles 
} from 'lucide-react';
import { Incident } from '../types';
import { apiService } from '../api/client';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { SlaTimer } from './SlaTimer';
import { BeforeAfterComparison } from './BeforeAfterComparison';
import { AssignWorkerModal } from './AssignWorkerModal';

interface IncidentDetailModalProps {
  incidentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incidentId,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'reports' | 'timeline' | 'evidence' | 'sla'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const fetchDetail = async () => {
    if (incidentId) {
      setIsLoading(true);
      try {
        const res = await apiService.getIncidentDetail(incidentId);
        setIncident(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (isOpen && incidentId) {
      fetchDetail();
    }
  }, [isOpen, incidentId]);

  if (!isOpen || !incidentId) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#173B57]/60 backdrop-blur-xs">
        <div className="bg-[#F7F9FA] rounded-lg shadow-2xl border border-[#C8D3D9] max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
          <div className="p-4 sm:p-5 bg-[#18384D] text-white border-b border-[#246B8E]/40 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-[#246B8E]/40 border border-[#246B8E]">
                <ShieldCheck className="w-6 h-6 text-[#24875D]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold font-mono text-white">{incident?.id || incidentId}</h3>
                  {incident && (
                    <>
                      <PriorityBadge severity={incident.severity} score={incident.priority_score} size="sm" />
                      <StatusBadge status={incident.status} size="sm" />
                    </>
                  )}
                </div>
                <p className="text-xs text-[#DDE5E9] mt-0.5">
                  {incident?.category} — {incident?.landmark || 'Chennai'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {incident && (
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#24875D] hover:bg-[#188977] text-white text-xs font-semibold rounded transition-colors shadow-xs"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Assign / Reassign</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-md hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="bg-[#E9EEF1] border-b border-[#C8D3D9] px-4 flex gap-1 overflow-x-auto shrink-0">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'analysis', label: 'AI Analysis & Risk' },
              { id: 'reports', label: Citizen Reports () },
              { id: 'timeline', label: 'Activity Timeline' },
              { id: 'evidence', label: 'Evidence & Verification' },
              { id: 'sla', label: 'SLA Telemetry' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={py-2.5 px-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap }
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {isLoading ? (
              <div className="py-16 text-center text-xs text-[#5C6971]">Loading incident details...</div>
            ) : !incident ? (
              <div className="py-16 text-center text-xs text-[#C64646]">Failed to load incident details.</div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 space-y-4">
                        <div className="p-4 bg-white rounded-lg border border-[#C8D3D9] space-y-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#5C6971]">
                            Standardized Description
                          </span>
                          <p className="text-sm text-[#24333D] font-medium leading-relaxed">
                            {incident.description}
                          </p>
                        </div>

                        <div className="p-4 bg-white rounded-lg border border-[#C8D3D9] space-y-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#5C6971] flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-[#246B8E]" />
                            <span>Location & Zone Details</span>
                          </span>
                          <div className="grid grid-cols-2 gap-2 text-xs text-[#24333D]">
                            <div>
                              <span className="text-[#5C6971] block">Landmark:</span>
                              <span className="font-semibold">{incident.landmark}</span>
                            </div>
                            <div>
                              <span className="text-[#5C6971] block">Ward / Zone:</span>
                              <span className="font-semibold">{incident.ward || 'Chennai Metro'}</span>
                            </div>
                            <div>
                              <span className="text-[#5C6971] block">Coordinates:</span>
                              <span className="font-mono text-[11px]">{incident.latitude?.toFixed(4)}, {incident.longitude?.toFixed(4)}</span>
                            </div>
                            <div>
                              <span className="text-[#5C6971] block">Navigation:</span>
                              <a
                                href={https://www.google.com/maps?q=,}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#246B8E] hover:underline font-semibold inline-flex items-center gap-1"
                              >
                                Google Maps <ArrowUpRight className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3.5">
                        <div className="p-4 bg-white rounded-lg border border-[#C8D3D9] space-y-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#173B57] block border-b border-[#C8D3D9] pb-2">
                            Operational Routing
                          </span>
                          
                          <div className="text-xs space-y-2">
                            <div>
                              <span className="text-[#5C6971] block text-[11px]">Department:</span>
                              <span className="font-bold text-[#173B57]">{incident.department_name || 'Roads & Infrastructure'}</span>
                            </div>
                            <div>
                              <span className="text-[#5C6971] block text-[11px]">Assigned Worker:</span>
                              <span className="font-bold text-[#24333D]">{incident.worker_name || 'Unassigned (Awaiting Dispatch)'}</span>
                            </div>
                            <div>
                              <span className="text-[#5C6971] block text-[11px]">SLA Status:</span>
                              <SlaTimer deadline={incident.sla_deadline} isBreached={incident.sla_breached} />
                            </div>
                            <div>
                              <span className="text-[#5C6971] block text-[11px]">Verified Citizen Reports:</span>
                              <span className="inline-flex items-center gap-1 font-bold text-[#24875D]">
                                <CheckSquare className="w-3.5 h-3.5" /> {incident.reporter_count} Unique Citizens
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => setShowAssignModal(true)}
                            className="w-full py-2 bg-[#173B57] hover:bg-[#246B8E] text-white text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <UserCheck className="w-4 h-4" />
                            <span>Assign / Dispatch Worker</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'analysis' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-[#246B8E]/10 rounded-lg border border-[#246B8E]/30 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#246B8E]" />
                        <div>
                          <span className="font-bold text-[#173B57]">AI Understanding Engine Verification</span>
                          <p className="text-[#5C6971]">Multi-factor severity and risk weighting</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-[#24875D] text-white font-bold font-mono">
                        Confidence: {incident.analysis?.classification_confidence || 96.5}%
                      </span>
                    </div>

                    <div className="p-4 bg-white rounded-lg border border-[#C8D3D9] space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#173B57]">
                        Explainable Priority Score Breakdown ({incident.priority_score}/100)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {(incident.analysis?.priority_breakdown || []).map((factor, idx) => (
                          <div key={idx} className="p-3 rounded bg-[#E9EEF1] border border-[#C8D3D9] text-xs flex justify-between items-center">
                            <div>
                              <span className="font-bold text-[#173B57] block">{factor.factor}</span>
                              <span className="text-[11px] text-[#5C6971]">{factor.description}</span>
                            </div>
                            <span className="text-sm font-mono font-bold text-[#24875D] px-2 py-0.5 rounded bg-white border border-[#C8D3D9]">
                              +{factor.score}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reports' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-[#E9EEF1] rounded border border-[#C8D3D9] text-xs text-[#5C6971]">
                      Showing all <strong>{incident.citizen_reports?.length || incident.reporter_count}</strong> citizen reports linked to Master Incident <strong>{incident.id}</strong>.
                    </div>

                    <div className="space-y-2.5">
                      {(incident.citizen_reports || []).map((rep) => (
                        <div key={rep.id} className="p-3.5 bg-white rounded-lg border border-[#C8D3D9] text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#173B57]">{rep.citizen_name}</span>
                            <span className="text-[11px] text-[#5C6971]">{new Date(rep.created_at).toLocaleString()}</span>
                          </div>
                          <p className="text-[#24333D]">{rep.original_text}</p>
                          {rep.image_url && (
                            <div className="w-32 h-20 rounded overflow-hidden border border-[#C8D3D9] mt-2">
                              <img src={rep.image_url} alt="Report attachment" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'timeline' && (
                  <div className="p-4 bg-white rounded-lg border border-[#C8D3D9] space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#173B57]">
                      Incident State Machine History
                    </h4>

                    <div className="relative border-l-2 border-[#246B8E]/40 ml-3 space-y-6 py-2">
                      {(incident.timeline || []).map((t, idx) => (
                        <div key={t.id || idx} className="relative pl-6">
                          <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#173B57] border-2 border-white flex items-center justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#24875D]"></span>
                          </span>
                          <div className="text-xs font-bold text-[#173B57]">{t.event}</div>
                          <div className="text-[11px] text-[#5C6971] flex items-center gap-2 mt-0.5">
                            <span>Actor: <strong>{t.actor}</strong></span>
                            <span>•</span>
                            <span>{new Date(t.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'evidence' && (
                  <BeforeAfterComparison
                    evidence={incident.evidence}
                    verification={incident.verification}
                    beforeFallbackUrl={incident.image_url}
                  />
                )}

                {activeTab === 'sla' && (
                  <div className="p-4 bg-white rounded-lg border border-[#C8D3D9] space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#173B57]">
                      SLA Policy & Time Tracking
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-[#E9EEF1] rounded border border-[#C8D3D9]">
                        <span className="text-[#5C6971] block text-[11px]">Severity Level:</span>
                        <span className="font-bold text-[#173B57]">{incident.severity}</span>
                      </div>
                      <div className="p-3 bg-[#E9EEF1] rounded border border-[#C8D3D9]">
                        <span className="text-[#5C6971] block text-[11px]">SLA Allowance:</span>
                        <span className="font-bold text-[#173B57]">{incident.sla_hours} Hours</span>
                      </div>
                      <div className="p-3 bg-[#E9EEF1] rounded border border-[#C8D3D9]">
                        <span className="text-[#5C6971] block text-[11px]">Target Deadline:</span>
                        <span className="font-mono font-semibold text-[#173B57]">
                          {incident.sla_deadline ? new Date(incident.sla_deadline).toLocaleString() : '--'}
                        </span>
                      </div>
                      <div className="p-3 bg-[#E9EEF1] rounded border border-[#C8D3D9]">
                        <span className="text-[#5C6971] block text-[11px]">Live Status:</span>
                        <SlaTimer deadline={incident.sla_deadline} isBreached={incident.sla_breached} />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="p-4 border-t border-[#C8D3D9] bg-[#E9EEF1] flex justify-between items-center shrink-0">
            <span className="text-xs text-[#5C6971]">UrbanFix Municipal Command Center</span>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-md border border-[#C8D3D9] bg-white text-[#24333D] hover:bg-[#DDE5E9] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <AssignWorkerModal
        isOpen={showAssignModal}
        incident={incident}
        onClose={() => setShowAssignModal(false)}
        onAssigned={() => {
          fetchDetail();
          if (onUpdate) onUpdate();
        }}
      />
    </>
  );
};
'''

with open(f'{components_dir}/IncidentDetailModal.tsx', 'w', encoding='utf-8') as f:
    f.write(detail_modal_code)

print('Modals written successfully!')
