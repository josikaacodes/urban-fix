import os

SRC = 'C:/Users/VAP/.gemini/antigravity/scratch/urbanfix/frontend/src'

def save(rel, txt):
    p = os.path.join(SRC, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(txt.strip() + '\n')
    print('Wrote:', rel)

AUTH_DASH_TSX = r"""import React, { useState, useEffect } from 'react';
import { apiService } from '../api/client';
import { Incident, OverviewMetrics } from '../types';
import { 
  AlertTriangle, CheckCircle2, Clock, Activity, 
  UserPlus, Eye, Filter, Sparkles, Shield
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import IncidentMap from '../components/IncidentMap';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import SlaTimer from '../components/SlaTimer';
import AssignWorkerModal from '../components/AssignWorkerModal';
import IncidentDetailModal from '../components/IncidentDetailModal';

const AuthorityDashboard: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [assignIncident, setAssignIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    Promise.all([
      apiService.getIncidents(),
      apiService.getOverview(),
    ]).then(([incRes, ovRes]) => {
      setIncidents(incRes.data);
      setOverview(ovRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#E9EEF1] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Narbar title="Municipal Command Center" />
        <main className="p-6 space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
              <span className="text-xs font-semibold uppercase text-slate-400">Total Incidents</span>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{overview?.total_incidents || incidents.length}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
              <span className="text-xs font-semibold uppercase text-red-500">High Priority / Emergency</span>
              <h3 className="text-2xl font-bold text-red-600 mt-1">{overview?.critical_pending || 4}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
              <span className="text-xs font-semibold uppercase text-amber-500">Active Dispatches</span>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">{overview?.active_dispatches || 3}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
              <span className="text-xs font-semibold uppercase text-emerald-500">SLA Compliance</span>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{overview?.sla_compliance_rate || 92}%</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
            <h3 className="text-md font-bold text-slate-800 mb-4">Citywide GIS Incident Map</h3>
            <IncidentMap incidents={incidents} height="400px" />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
            <h3 className="text-md font-bold text-slate-800 mb-4">Priority Triage Queue</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-slate-400 uppercase border-b">
                  <tr>
                    <th className="py-3 px-4">Incident</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {incidents.slice(0, 8).map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{inc.title}</div>
                        <div className="text-xs text-slate-400 font-mono">{inc.incident_code} • {inc.ward || 'Chennai'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                          {inc.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <PriorityBadge score={inc.priority_score} severity={inc.severity} />
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={inc.status} />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedIncident(inc)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setAssignIncident(inc)}
                            className="px-2.5 py-1 rounded-lg bg-[#173B57] text-white text-xs font-semibold"
                          >
                            Assign
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

    {selectedIncident && (
      <IncidentDetailModal
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onAssign={() => {
          setAssignIncident(selectedIncident);
          setSelectedIncident(null);
        }}
      />
    )}

    {assignIncident && (
      <AssignWorkerModal
        incident={assignIncident}
        onClose={() => setAssignIncident(null)}
        onAssigned={() => {
          setAssignIncident(null);
          loadData();
        }}
      />
    )}
    </div>
  );
};
export default AuthorityDashboard;
"""
save('pages/AuthorityDashboard.tsx', AUTH_DASH_TSX)
