import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../api/client';
import { NotificationItem } from '../types';
import { Bell, Check, ArrowRight } from 'lucide-react';
import { Navbar } from '../components/Navbar';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = () => {
    apiService.getNotifications().then((res) => {
      setNotifications(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchNotifs(); }, []);

  const handleMarkAll = async () => {
    await apiService.markAllNotificationsRead();
    fetchNotifs();
  };

  return (
    <div className="min-h-screen bg-[#E9EEF1] flex flex-col">
      <Navbar />
      <main className="max-w-4xl mx-auto p-6 flex-1 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Alerts &amp; Activity</h2>
            <p className="text-xs text-slate-500">Real-time urban resolution events and status updates</p>
          </div>
          <button
            type="button"
            onClick={handleMarkAll}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center space-x-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm animate-pulse">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-xs text-slate-500">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border flex items-start justify-between transition ${
                  n.read ? 'bg-white border-slate-200/80' : 'bg-blue-50/40 border-blue-200'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    n.read ? 'bg-slate-100 text-slate-600' : 'bg-[#173B57] text-white'
                  }`}>
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
                    className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-xs font-semibold text-[#246B8E] flex items-center space-x-1 shrink-0"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
export default NotificationsPage;
