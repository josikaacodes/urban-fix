import React, { useState } from 'react';
import { AuthUser, Language } from '../types';

interface TopBarProps {
  currentTab: 'triage' | 'gis' | 'crews' | 'audit';
  onSelectTab: (tab: 'triage' | 'gis' | 'crews' | 'audit') => void;
  onOpenShiftLog: () => void;
  onOpenEmergencyAlert: () => void;
  onOpenReportModal?: () => void;
  onToggleCitizenView: () => void;
  isCitizenView: boolean;
  globalSearch: string;
  onGlobalSearchChange: (q: string) => void;
  onToast: (msg: string) => void;
  currentUser?: AuthUser | null;
  onReturnLanding?: () => void;
  onSignOut?: () => void;
  language?: Language;
  onToggleLanguage?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onSelectTab,
  onOpenShiftLog,
  onOpenEmergencyAlert,
  onOpenReportModal,
  onToggleCitizenView,
  isCitizenView,
  globalSearch,
  onGlobalSearchChange,
  onToast,
  currentUser,
  onReturnLanding,
  onSignOut,
  language = 'en',
  onToggleLanguage,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Ward 42 Metro Pillar 18 skid reports auto-deduplicated (2 merged)', time: '12m ago', unread: true },
    { id: 2, text: 'Lineman 3 arrived on-site at Govt High School crosswalk', time: '28m ago', unread: true },
    { id: 3, text: 'Zonal Chief Engineer signed off on weekly paving ledger', time: '1h ago', unread: false },
  ]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    onToast('All operational alerts marked as read.');
  };

  return (
    <>
      <header className="w-full px-4 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-40 bg-[#f2ede4] border-b border-[#c2c8c2]/30 shadow-xs">
        {/* Left Cluster: Brand & Global Search */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onSelectTab('triage')}
          >
            <div className="w-9 h-9 rounded bg-[#1a3125] text-white flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">shield</span>
            </div>
            <div>
              <span className="font-headline text-base sm:text-lg text-[#051c11] tracking-tight font-semibold block leading-tight">
                UrbanFix AI Command
              </span>
              <span className="font-mono text-[11px] text-[#4c6451] tracking-wider uppercase block">
                Civic Intelligence Desk
              </span>
            </div>
          </div>

          {/* Search on Left */}
          <div className="hidden xl:flex items-center relative">
            <span className="material-symbols-outlined absolute left-3 text-[#4c6451] text-[18px]">
              search
            </span>
            <input
              className="pl-9 pr-4 py-1.5 bg-white text-[#1c1c16] border border-[#c2c8c2]/40 rounded text-xs w-72 focus:outline-none focus:ring-1 focus:ring-[#051c11] focus:border-[#051c11] placeholder:text-[#727973] transition-all shadow-inner font-body"
              placeholder="Search docket #, ward sector, or asset ID..."
              type="text"
              value={globalSearch}
              onChange={(e) => onGlobalSearchChange(e.target.value)}
            />
            {globalSearch && (
              <button
                onClick={() => onGlobalSearchChange('')}
                className="absolute right-2 text-xs text-[#727973] hover:text-[#1c1c16]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Center Navigation Links */}
        {!isCitizenView && (
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onSelectTab('triage')}
              className={`pb-1 font-semibold text-xs font-mono transition-colors flex items-center gap-1.5 ${
                currentTab === 'triage'
                  ? 'border-b-2 border-[#051c11] text-[#051c11]'
                  : 'text-[#424844] hover:text-[#1c1c16]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              Triage Console
            </button>
            <button
              onClick={() => onSelectTab('gis')}
              className={`pb-1 font-semibold text-xs font-mono transition-colors flex items-center gap-1.5 ${
                currentTab === 'gis'
                  ? 'border-b-2 border-[#051c11] text-[#051c11]'
                  : 'text-[#424844] hover:text-[#1c1c16]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">map</span>
              GIS Telemetry
            </button>
            <button
              onClick={() => onSelectTab('crews')}
              className={`pb-1 font-semibold text-xs font-mono transition-colors flex items-center gap-1.5 ${
                currentTab === 'crews'
                  ? 'border-b-2 border-[#051c11] text-[#051c11]'
                  : 'text-[#424844] hover:text-[#1c1c16]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">group</span>
              Active Crews
            </button>
            <button
              onClick={() => onSelectTab('audit')}
              className={`pb-1 font-semibold text-xs font-mono transition-colors flex items-center gap-1.5 ${
                currentTab === 'audit'
                  ? 'border-b-2 border-[#051c11] text-[#051c11]'
                  : 'text-[#424844] hover:text-[#1c1c16]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              Audit Records
            </button>
          </nav>
        )}

        {/* Right Cluster Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Bilingual Language Switcher in Dashboard */}
          {onToggleLanguage && (
            <button
              onClick={onToggleLanguage}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#ece8df] hover:bg-[#e6e2d9] text-[#051c11] border border-[#c2c8c2]/40 font-mono text-xs transition-colors"
              title="Toggle Language (English / தமிழ்)"
            >
              <span className="material-symbols-outlined text-[14px] text-[#4c6451]">translate</span>
              <span className="font-semibold">{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>
          )}

          {/* + Report Issue Global CTA */}
          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a3125] text-white text-xs font-mono font-semibold hover:bg-[#051c11] transition-all active:scale-[0.98] shadow-xs"
              title="Report New Civic Issue"
            >
              <span className="material-symbols-outlined text-[15px] text-[#cee9d7]">add_a_photo</span>
              <span className="hidden sm:inline">+ Report Issue</span>
              <span className="sm:hidden">+ Report</span>
            </button>
          )}

          {/* Shift Log Action */}
          <button
            onClick={onOpenShiftLog}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#ece8df] text-[#1c1c16] text-xs font-mono hover:bg-[#e6e2d9] transition-colors border border-[#c2c8c2]/30 active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-[16px]">event_note</span>
            Shift Log
          </button>

          {/* Emergency Alert Trailing Action */}
          <button
            onClick={onOpenEmergencyAlert}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#4d1e0d] text-[#ffdbcf] text-xs font-mono hover:opacity-90 transition-all font-semibold active:scale-[0.98] shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px] text-[#ffdbcf]">warning</span>
            <span className="hidden xs:inline">Emergency Alert</span>
            <span className="xs:hidden">Alert</span>
          </button>

          <div className="h-5 w-px bg-[#c2c8c2]/40 mx-1 hidden sm:block"></div>

          {/* Notifications Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 text-[#424844] hover:text-[#1c1c16] hover:bg-[#e6e2d9] rounded transition-colors relative"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {notifications.some(n => n.unread) && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ba1a1a] ring-2 ring-[#f2ede4]"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#c2c8c2]/50 p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-[#ece8df]">
                  <span className="font-headline text-xs font-bold text-[#051c11]">Operational Broadcasts</span>
                  <button onClick={markAllRead} className="text-[11px] text-[#4c6451] hover:underline font-mono">
                    Mark all read
                  </button>
                </div>
                <div className="flex flex-col gap-2 py-2 max-h-64 overflow-y-auto custom-scroll">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2 rounded text-xs transition-colors ${
                        n.unread ? 'bg-[#f7f3ea] border-l-2 border-[#1a3125]' : 'bg-transparent text-[#727973]'
                      }`}
                    >
                      <p className="font-body text-[#1c1c16] leading-snug">{n.text}</p>
                      <span className="font-mono text-[10px] text-[#727973] block mt-1">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Return to Landing Home Button */}
          {onReturnLanding && (
            <button
              onClick={onReturnLanding}
              className="p-1.5 text-[#424844] hover:text-[#1c1c16] hover:bg-[#e6e2d9] rounded transition-colors hidden sm:block"
              title="Return to Landing Page"
            >
              <span className="material-symbols-outlined text-[20px]">home</span>
            </button>
          )}

          {/* Quick Settings Action */}
          <button
            onClick={() => onToast('Telemetry refresh cadence set to continuous (15s broadcast cycle).')}
            className="p-1.5 text-[#424844] hover:text-[#1c1c16] hover:bg-[#e6e2d9] rounded transition-colors"
            title="Settings / Tune"
          >
            <span className="material-symbols-outlined text-[20px]">tune</span>
          </button>

          {/* Profile Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#c2c8c2]/40">
            <div
              className="w-8 h-8 rounded-full bg-[#1a3125] text-white font-headline flex items-center justify-center text-xs font-semibold ring-1 ring-[#4c6451] cursor-pointer"
              title={currentUser ? `${currentUser.name} (${currentUser.badgeId})` : 'Eng. R. Sundaram (GCC-W42-901)'}
              onClick={() => onToast(`Logged in as ${currentUser?.name || 'Eng. R. Sundaram'} (${currentUser?.badgeId || 'GCC-W42-901'})`)}
            >
              {currentUser?.avatarInitials || 'RS'}
            </div>
          </div>
        </div>
      </header>

      {/* Sub-Bar / Shift & Telemetry Status */}
      <section className="bg-[#f7f3ea] border-b border-[#c2c8c2]/30 px-4 sm:px-6 py-2">
        <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-body">
          {/* Left: Active Ward & Shift */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#f2ede4] text-[#1c1c16] border border-[#c2c8c2]/30">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4c6451] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1a3125]"></span>
              </span>
              <span className="font-headline text-xs font-semibold text-[#051c11]">
                {currentUser?.ward || 'Ward 42 Zonal Office'}
              </span>
              <span className="text-[#727973] text-xs">•</span>
              <span className="font-mono text-[11px] text-[#424844]">Morning Shift (06:00 - 14:00 IST)</span>
            </div>
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#c9e4cc]/40 text-[#4e6753] font-mono text-[11px] border border-[#4c6451]/20">
              <span className="material-symbols-outlined text-[14px]">wifi_tethering</span>
              <span>Telemetry Mesh 99.8% Online</span>
            </div>
          </div>

          {/* Right: Nodal Officer & Fast Modes */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="text-[#424844]">Officer on Desk:</span>
              <span className="font-mono text-xs text-[#051c11] font-semibold">
                {currentUser?.name || 'Eng. R. Sundaram'} ({currentUser?.badgeId || 'GCC-W42-901'})
              </span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-[#c2c8c2]/40"></div>
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleCitizenView}
                className="text-xs text-[#4c6451] hover:text-[#051c11] underline transition-colors font-medium flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {isCitizenView ? 'shield' : 'person'}
                </span>
                {isCitizenView ? 'Return to Command Center' : 'Switch to Citizen View'}
              </button>
              <button
                onClick={() => {
                  if (onSignOut) {
                    onSignOut();
                  } else {
                    onToast('Session locked. Enter security passcode or RFID keycard to resume.');
                  }
                }}
                className="text-xs text-[#ba1a1a] hover:underline transition-colors font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
