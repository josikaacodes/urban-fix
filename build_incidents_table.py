import os

SRC = 'C:/Users/VAP/.gemini/antigravity/scratch/urbanfix/frontend/src'

def save(rel, txt):
    p = os.path.join(SRC, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(txt.strip() + '\n')
    print('Wrote:', rel)

INC_TABLE_TSX = r"""import React, { useState, useEffect } from 'react';
import { apiService } from '../api/client';
import { Incident } from '../types';
import { 
  Search, Filter, Eye, UserPlus, Download, Sliders
} from 'lucide-react';
import Navbar from '../components/Narbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import SlaTimer from '../components/SlaTimer';
import AssignWorkerModal from '../components/AssignWorkerModal';
import IncidentDetailModal from '../components/IncidentDetailModal';

const AuthorityIncidents: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [assignIncident, setAssignIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);

  const loadIncidents = () => {
    apiService.getIncidents().then(res => {
      setIncidents(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const filtered = incidents.filter(inc => {
    const matchesSearch = 
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.incident_code.toLowerCase().includes(search.toLowerCase()) ||
      (inc.ward && inc.ward.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || inc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#E9EEF1] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Narbar title="Incidents Master Registry" />
        <main className="p-6 space-y-6 flex-1">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search incidents by title, code, or ward..."
                className="w-full outline-none text-sm"
              />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="reported">Reported</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="ai_verified">AI Verified</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-slate-400 uppercase bg-slate-50/80 border-b">
                  <tr>
                    <th className="py-3.5 px-4">Code & Title</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Ward</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{inc.title}</div>
                        <div className="text-xs text-slate-400 font-mono">{inc.incident_code}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                          {inc.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {inc.ward || 'Chennai'}
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
                            Dispatch
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
          loadIncidents();
        }}
      />
    )}
    </div>
  );
};
export default AuthorityIncidents;
"""
save('pages/AuthorityIncidents.tsx', INC_TABLE_TSX)
