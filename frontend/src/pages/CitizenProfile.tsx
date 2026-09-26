import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../api/client';
import { CitizenReportItem } from '../types';
import { Shield, FileCheck } from 'lucide-react';
import { Navbar } from '../components/Navbar';

const CitizenProfile: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<CitizenReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getMyReports()
      .then((res) => { setReports(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#E9EEF1] flex flex-col">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/80">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[#173B57] text-white flex items-center justify-center font-bold text-2xl">
                {user?.name?.charAt(0) || 'C'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{user?.name}</h3>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 mt-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Verified Citizen</span>
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs border-t pt-4 border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Mobile No:</span>
                <span className="font-medium">{user?.mobile || '+91 9876543210'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Ward / Area:</span>
                <span className="font-medium">Ward 10 (T Nagar)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">DigiLocker ID:</span>
                <span className="font-mono text-emerald-700">XXXX XXXX 4821</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Civic Trust Score:</span>
                <span className="font-bold text-blue-700">94 / 100</span>
              </div>
            </div>
          </div>

          {/* Reports list */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-slate-200/80">
            <h3 className="text-md font-bold text-slate-800 mb-4">My Incident Reports</h3>
            {loading ? (
              <div className="text-center py-8 text-slate-400 text-xs animate-pulse">Loading...</div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                <FileCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No reports submitted yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((r) => (
                  <div key={r.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-800">{r.report_code}</div>
                      <div className="text-xs text-slate-500">{r.created_at}</div>
                    </div>
                    <Link
                      to={r.incident_id ? `/citizen/track/${r.incident_id}` : '/citizen'}
                      className="px-3 py-1.5 bg-[#173B57] text-white rounded-lg text-xs font-semibold"
                    >
                      View Tracker
                    </Link>
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
export default CitizenProfile;
