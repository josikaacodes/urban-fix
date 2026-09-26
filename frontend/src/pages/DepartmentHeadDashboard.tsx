import React, { useState, useEffect } from 'react';
import { apiService } from '../api/client';
import { Incident, Worker } from '../types';
import { Wrench, Users, CheckCircle2 } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import AssignWorkerModal from '../components/AssignWorkerModal';
import IncidentDetailModal from '../components/IncidentDetailModal';

const DepartmentHeadDashboard: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [assignIncident, setAssignIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    Promise.all([
      apiService.getIncidents(),
      apiService.getWorkers(),
    ]).then(([incRes, wkRes]) => {
      setIncidents(incRes.data);
      setWorkers(wkRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div className="min-h-screen bg-[#E9EEF1] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-6 space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
              <span className="text-xs font-semibold uppercase text-slate-400">Open Incidents</span>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{incidents.length}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
              <span className="text-xs font-semibold uppercase text-emerald-500">Active Field Workers</span>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{workers.length}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
              <span className="text-xs font-semibold uppercase text-blue-500">Avg Resolution Time</span>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">14.6 hrs</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
              <h3 className="text-md font-bold text-slate-800 mb-4">Department Incident Queue</h3>
              <div className="space-y-3">
                {incidents.map((inc) => (
                  <div key={inc.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-[#246B8E] font-mono">{inc.incident_code}</span>
                        <StatusBadge status={inc.status} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 mt-1">{inc.title}</h4>
                      <p className="text-xs text-slate-500">{inc.landmark || inc.ward}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <PriorityBadge score={inc.priority_score} />
                      <button
                        onClick={() => setAssignIncident(inc)}
                        className="px-3 py-1.5 bg-[#173B57] text-white rounded-lg text-xs font-semibold"
                      >
                        Dispatch
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
              <h3 className="text-md font-bold text-slate-800">Worker Fleet ({workers.length})</h3>
              <div className="space-y-3">
                {workers.map((w) => (
                  <div key={w.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-800">{w.name}</div>
                      <div className="text-xs text-slate-500">{w.skills || 'General Civic Repair'}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[11px] font-semibold ${w.status === 'idle' || w.availability ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {w.status || (w.availability ? 'idle' : 'on_task')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onAssign={() => { setAssignIncident(selectedIncident); setSelectedIncident(null); }}
        />
      )}

      {assignIncident && (
        <AssignWorkerModal
          incident={assignIncident}
          onClose={() => setAssignIncident(null)}
          onAssigned={() => { setAssignIncident(null); loadData(); }}
        />
      )}
    </div>
  );
};
export default DepartmentHeadDashboard;
