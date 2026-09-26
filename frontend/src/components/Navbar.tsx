import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../api/client';
import { NotificationItem } from '../types';
import {
  ShieldCheck, Bell, LogOut, Sparkles, Menu, X, ChevronLeft,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    apiService.getNotifications()
      .then((res) => setNotifications(res.data))
      .catch(() => {});
  }, [isAuthenticated, location.pathname]);

  const unread = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const homeRoute =
    role === 'citizen' ? '/citizen' :
    role === 'authority' ? '/authority' :
    role === 'department_head' ? '/department' :
    '/';

  return (
    <header className="bg-[#173B57] text-white px-4 py-0 h-14 flex items-center justify-between shadow-md z-40 shrink-0 border-b border-[#246B8E]/40">
      {/* Left: logo + title */}
      <div className="flex items-center gap-3">
        <Link to={homeRoute} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#246B8E] flex items-center justify-center font-black text-base text-white shadow-inner">
            UF
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="text-xs font-black tracking-wider text-white">THE URBAN FIX</div>
            <div className="text-[10px] text-[#9BBCCE] font-medium">Municipal Redressal Network</div>
          </div>
        </Link>
      </div>

      {/* Center: role pill */}
      {isAuthenticated && (
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded border border-white/10 bg-black/20 text-xs text-[#DDE5E9]">
          <span className="w-2 h-2 rounded-full bg-[#24875D] animate-pulse" />
          <span>
            {role === 'citizen' && 'Citizen Portal'}
            {role === 'authority' && 'Municipal Command Telemetry Active'}
            {role === 'department_head' && 'Department Command Active'}
            {role === 'worker' && 'Field Operations'}
          </span>
        </div>
      )}

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {isAuthenticated && (
          <>
            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setShowNotifs(!showNotifs); setShowUserMenu(false); }}
                className="relative p-2 rounded-lg hover:bg-white/10 transition"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#C64646] text-white text-[10px] font-bold flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800">Notifications</span>
                    <button
                      type="button"
                      onClick={() => apiService.markAllNotificationsRead().then(() => setShowNotifs(false))}
                      className="text-xs text-[#246B8E] font-semibold hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <p className="py-8 text-center text-xs text-slate-400">No notifications</p>
                    ) : notifications.slice(0, 8).map((n) => (
                      <div key={n.id} className={`px-4 py-3 text-xs ${n.read ? 'bg-white' : 'bg-blue-50/50'}`}>
                        <p className="font-semibold text-slate-800">{n.title}</p>
                        <p className="text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t text-center">
                    <Link
                      to="/notifications"
                      onClick={() => setShowNotifs(false)}
                      className="text-xs text-[#246B8E] font-semibold hover:underline"
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifs(false); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition text-xs"
              >
                <div className="w-6 h-6 rounded-full bg-[#246B8E] flex items-center justify-center font-bold text-sm">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="hidden sm:block max-w-24 truncate">{user?.name}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden text-slate-700">
                  <div className="px-4 py-3 border-b bg-slate-50">
                    <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      <span className="text-[10px] font-semibold text-emerald-600 capitalize">{role}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-xs hover:bg-red-50 text-red-600 font-semibold transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {!isAuthenticated && (
          <Link
            to="/login"
            className="px-4 py-1.5 rounded-lg bg-[#24875D] text-white text-xs font-semibold hover:bg-[#24875D]/90 transition"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
