import React, { useState, useEffect } from 'react';
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
