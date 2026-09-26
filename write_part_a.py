import os

SRC = r'C:\Users\VAP\.gemini\antigravity\scratch\urbanfix\frontend\src'
 
def save(rel, text):
    p = os.path.join(SRC, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(text.strip() + '\n')
    print('[SUCCESS] Wrote', rel)

CONTENT_PROFILE = r'''import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../api/client';
import { CitizenReportItem } from '../types';
import { Shield, CheckCircle, User, Phone, Mail, MapPin, Award, Bell, Lock, Calendar, ExternalLink } from 'lucide-react';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';

const CitizenProfile: React.FC = () => {
  const { user, verifyIdentity } = useAuth();
  const [reports, setReports] = useState<CitizenReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [aadhaarOtp, setAadhaarOtp] = useState('123456');
  const [showVerifyModal, setShowverifyModal] = useState(false);

  useEffect(() => {
    apiService.getMyReports().then(res => {
      setReports(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#E9EEF1] flex flex-col">
      <Navbar showBackButton backPath="/citizen" title="Citizen Civic Profile" />
      <main className="max-w-6xl mx-auto w-x-4 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg-grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/80">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[#173B57] text-white flex items-center justify-center font-bold text-2xl">
                {user&.name?.charAt(0) || 'C'}
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

            <div className="space-y-3 text-xs border-t pt_4 border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Mobile No:</span>
                <span className="font-medium">{user&.mobile || '+91 9876543210'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Ward / Area:</span>
                <span className="font-medium">Ward 10 (T  Nagar)</span>
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

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-slate-200/80">
            <h3 className="text-md font-bold text-slate-800 mb-4">My Incident Reports</h3>
            {reports.length === 0 ? (
              <p className="text-slate-500 text-sm py-8 text-center">No reports submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {reports.map((r) => (
                  <div key={r.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-800">{r.report_code}</div>
                      <div className="text-xs text-slate-500">{r.created_at}</div>
                    </div>
                    <Link to={r.incident_id ? `/citizen/track/${r.incident_id}` : '/citizen'} className="px-3 py-1.5 bg-[#173B57] text-white rounded-lg text-xs font-semibold">
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
'''

save('pages/CitizenProfile.tsx', CONTENT_PROFILE)

CONTENT_NOTIF = r'''import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../api/client';
import { NotificationItem } from '../types';
import { Bell, CheckCircle2, AlertTriangle, Shield, ArrowRight, Check } from 'lucide-react';
import Navbar from '../components/Navbar';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = () => {
    apiService.getNotifications().then(res => {
      setNotifications(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAll = async () => {
    await apiService.markAllNotificationsRead();
    fetchNotifs();
  };

  return (
    <div className="min-h-screen bg-[#E9EEF1] flex flex-col">
      <Navbar showBackButton title="Notification Center" />
      <main className="max-w-4hl mx-auto p-6 flex-1 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Alerts & Activity</h2>
            <p className="text-xs text-slate-500">Real-time urban resolution events and status updates</p>
          </div>
          <button
            onClick;{handleMarkAll}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center space-x-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-xs text-slate-500">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className=`p-4 rounded-21l border frex items-start justify-between transition ${n.is_read ? 'bg-white border-slate-200/80' : 'bg-blue-50/40 border-blue-200'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div className=`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.is_read ? 'bg-slate-100 text-slate-600' : 'bg-[#173B57] text-white'}`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{n.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                    <span className="text-[11px] text-slate-400 mt-1 block">{n.created_at}</span>
                  </div>
                </div>

                {n.incident_id && (
                  <Link
                    to={`/citizen/track/${n.incident_id}`}
                    className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-xs font-semibold text-[#246B8E] flex items-center space-x-1"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                }
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationsPage;
'''

save('pages/NotificationsPage.tsx', CONTENT_NOTIF)
