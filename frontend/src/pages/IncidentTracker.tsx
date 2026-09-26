import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../api/client';
import { Incident } from '../types';
import { Search, CheckCircle2, MapPin, ThumbsUp } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import SlaTimer from '../components/SlaTimer';
import BeforeAfterComparison from '../components/BeforeAfterComparison';

const STEPS = [
  { key: 'reported',    label: 'Reported' },
  { key: 'ai_analyzed', label: 'AI Analyzed' },
  { key: 'prioritized', label: 'Prioritized' },
  { key: 'routed',     label: 'Routed' },
  { key: 'assigned',   label: 'Assigned' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved',   label: 'Resolved' },
  { key: 'ai_verified', label: 'AI Verified' },
  { key: 'closed',     label: 'Closed' },
];

const IncidentTracker: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [searchCode, setSearchCode] = useState(id || '');
  const [loading, setLoading] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const loadIncident = (targetId: string) => {
    if (!targetId) return;
    setLoading(true);
    apiService.getIncidentDetail(targetId)
      .then((res) => { setIncident(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { if (id) loadIncident(id); }, [id]);

  const handleConfirmFixed = async () => {
    if (!incident) return;
    await apiService.submitFeedback(incident.id, true, 'Verified and confirmed by citizen');
    setFeedbackSubmitted(true);
    loadIncident(incident.id);
  };

  const currentStepIndex = incident
    ? STEPS.findIndex((s) => s.key === incident.status.toLowerCase())
    : 0;

  return (
    <div className="min-h-screen bg-[#E9EEF1] flex flex-col">
      <Navbar />
      <main className="max-w-5xl mx-auto p-6 flex-1 w-full space-y-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center space-x-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadIncident(searchCode)}
            placeholder="Enter Incident Code (e.g. INC-2026-1042)"
            className="flex-1 outline-none text-sm"
          />
          <button
            onClick={() => loadIncident(searchCode)}
            className="px-4 py-2 bg-[#173B57] text-white rounded-lg text-xs font-semibold"
          >
            Track
          </button>
        </div>

        {loading && (
          <div className="text-center py-12 text-slate-400 text-sm animate-pulse">Loading incident data...</div>
        )}

        {incident && !loading && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
              <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono font-bold text-[#246B8E]">{incident.incident_code}</span>
                    <StatusBadge status={incident.status} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mt-1">{incident.title}</h3>
                  <p className="text-xs text-slate-500 flex items-center space-x-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{incident.landmark || incident.ward || 'Chennai'}</span>
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <PriorityBadge score={incident.priority_score} severity={incident.severity} />
                  <SlaTimer dueAt={incident.sla_due_at} status={incident.status} />
                </div>
              </div>

              <div className="py-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-4">Resolution Progress</h4>
                <div className="grid grid-cols-3 md:grid-cols-9 gap-2 text-center">
                  {STEPS.map((st, index) => {
                    const isDone = index <= currentStepIndex;
                    return (
                      <div key={st.key} className="flex flex-col items-center space-y-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isDone ? 'bg-[#24875D] text-white' : 'bg-slate-100 text-slate-400'}`}>
                          {index + 1}
                        </div>
                        <span className={`text-[10px] leading-tight ${isDone ? 'font-bold text-slate-800' : 'text-slate-400'}`}>{st.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {['RESOLVED', 'AI_VERIFIED', 'CITIZEN_CONFIRMED', 'CLOSED'].includes(incident.status) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
                <h4 className="text-sm font-bold text-slate-800">Verification Evidence (Before &amp; After)</h4>
                <BeforeAfterComparison
                  beforeUrl={incident.before_image_url || ''}
                  afterUrl={incident.after_image_url || ''}
                  verification={incident.verification}
                />

                {!feedbackSubmitted && incident.status !== 'CLOSED' && (
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-3">
                    <h5 className="text-xs font-bold text-slate-800">Was this issue resolved satisfactorily?</h5>
                    <button
                      onClick={handleConfirmFixed}
                      className="px-4 py-2 bg-[#24875D] text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Yes, Confirm Resolution</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
export default IncidentTracker;
