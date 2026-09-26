import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../api/client';
import { Incident, CitizenReportItem } from '../types';
import { PlusCircle, FileCheck, Shield } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import IncidentMap from '../components/IncidentMap';
import StatusBadge from '../components/StatusBadge';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [myReports, setMyReports] = useState<CitizenReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiService.getIncidents(),
      apiService.getMyReports(),
    ]).then(([incRes, repRes]) => {
      setIncidents(incRes.data);
      setMyReports(repRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#E9EEF1] flex flex-col">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full space-y-6">
        <div className="bg-gradient-to-r from-[#173B57] to-[#246B8E] text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium flex items-center space-x-1">
                <Shield className="w-3.5 h-3.5 text-emerald-300" />
                <span>DigiLocker Verified Citizen</span>
              </span>
            </div>
            <h2 className="text-2xl font-bold">Vanakkam, {user?.name || 'Citizen'}!</h2>
            <p className="text-xs text-slate-200 max-w-md">
              Report urban issues directly with AI-assisted prioritization, automated duplicate deduplication, and outcome verification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/citizen/report"
              className="px-5 py-3 bg-[#24875D] hover:bg-[#24875D]/90 text-white rounded-xl font-bold text-sm shadow-lg flex items-center space-x-2 transition cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Report New Issue</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
            <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center justify-between">
              <span>Live Incidents Map (Chennai)</span>
              <span className="text-xs font-normal text-slate-500">{incidents.length} active</span>
            </h3>
            <IncidentMap incidents={incidents} height="380px" />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
            <h3 className="text-md font-bold text-slate-800">My Recent Reports</h3>
            {loading ? (
              <div className="text-center py-8 text-slate-400 text-xs animate-pulse">Loading...</div>
            ) : myReports.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                <FileCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No reports submitted yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myReports.slice(0, 5).map((r) => (
                  <div key={r.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{r.report_code}</span>
                      {r.incident_id && (
                        <Link to={`/citizen/track/${r.incident_id}`} className="text-[11px] text-[#246B8E] font-semibold hover:underline">
                          Track
                        </Link>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">{r.original_text || 'Civic report submitted'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
export default CitizenDashboard;
