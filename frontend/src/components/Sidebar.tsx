import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Map, AlertOctagon, ListOrdered,
  Building2, Users, Clock, BarChart3, Lightbulb, CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const { role } = useAuth();

  const navItems = [
    { label: 'Overview',            to: role === 'department_head' ? '/department' : '/authority', icon: LayoutDashboard },
    { label: 'Incidents Registry',  to: '/authority/incidents', icon: AlertOctagon },
    { label: 'Departments',         to: '/authority/departments', icon: Building2 },
    { label: 'Field Workers',       to: '/authority/workers', icon: Users },
    { label: 'SLA Monitor',         to: '/authority/sla', icon: Clock },
    { label: 'Analytics',           to: '/authority/analytics', icon: BarChart3 },
    { label: 'UrbanFix Insights',   to: '/authority/insights', icon: Lightbulb },
  ];

  return (
    <aside className="w-64 bg-[#18384D] text-white flex flex-col shrink-0 min-h-screen border-r border-[#246B8E]/40">
      <div className="p-4 border-b border-[#246B8E]/30 bg-[#173B57]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#24875D]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#DDE5E9]">
            {role === 'department_head' ? 'Department Command' : 'Municipal Command'}
          </span>
        </div>
        <p className="text-xs text-[#C8D3D9] mt-0.5 font-mono">Chennai Greater Region</p>
      </div>

      <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === '/authority' || item.to === '/department'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#246B8E] text-white'
                    : 'text-[#C8D3D9] hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3.5 border-t border-[#246B8E]/30 bg-[#173B57]/60 text-[11px] text-[#C8D3D9] space-y-1.5">
        <div className="flex items-center gap-1.5 text-[#24875D]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="font-semibold">Role Verified Authorization</span>
        </div>
        <p className="text-[#DDE5E9]/80 leading-relaxed">
          All worker dispatches, routing overrides, and SLA telemetry are audited.
        </p>
      </div>
    </aside>
  );
};
export default Sidebar;
