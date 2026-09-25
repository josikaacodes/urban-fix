import React, { useState } from 'react';
import { Ticket, Department, TicketStatus } from '../types';

interface DispatchQueueProps {
  tickets: Ticket[];
  selectedTicketId: string;
  onSelectTicket: (id: string) => void;
  onOpenDispatchModal: (ticketId: string, defaultCrew?: string) => void;
  onOpenVerificationModal: (ticketId: string) => void;
  onConsolidateDuplicate: (ticketId: string) => void;
  onReroutePriority: (ticketId: string) => void;
  onViewFieldProgress: (ticketId: string) => void;
  onOpenReportModal?: () => void;
  selectedStatusTab: 'all' | TicketStatus;
  onSelectStatusTab: (status: 'all' | TicketStatus) => void;
  onRefresh: () => void;
  autoSyncCount: number;
}

export const DispatchQueue: React.FC<DispatchQueueProps> = ({
  tickets,
  selectedTicketId,
  onSelectTicket,
  onOpenDispatchModal,
  onOpenVerificationModal,
  onConsolidateDuplicate,
  onReroutePriority,
  onViewFieldProgress,
  onOpenReportModal,
  selectedStatusTab,
  onSelectStatusTab,
  onRefresh,
  autoSyncCount,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Counts for tabs
  const allCount = tickets.length;
  const criticalCount = tickets.filter(t => t.status === 'critical').length;
  const assignedCount = tickets.filter(t => t.status === 'assigned').length;
  const pendingCount = tickets.filter(t => t.status === 'pending').length;

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    // Status filter
    if (selectedStatusTab !== 'all' && t.status !== selectedStatusTab) {
      return false;
    }
    // Dept filter
    if (selectedDept !== 'all' && t.department !== selectedDept) {
      return false;
    }
    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const match =
        t.docketNumber.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        (t.assignedLead && t.assignedLead.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const formatSla = (seconds: number) => {
    if (seconds <= 0) return '00h 00m remaining';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m remaining`;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Operational Filter Tabs Row */}
      <section className="flex flex-wrap items-center justify-between gap-3 bg-[#f7f3ea] p-2 rounded-xl border border-[#c2c8c2]/30 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => onSelectStatusTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              selectedStatusTab === 'all'
                ? 'bg-[#1a3125] text-white shadow-xs'
                : 'bg-[#f2ede4] text-[#1c1c16] hover:bg-[#ece8df]'
            }`}
          >
            All Active <span className="ml-1 opacity-80">({allCount})</span>
          </button>

          <button
            onClick={() => onSelectStatusTab('critical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all border ${
              selectedStatusTab === 'critical'
                ? 'bg-[#4d1e0d] text-[#ffdbcf] border-[#ffb59c] font-bold shadow-xs'
                : 'bg-[#ffdbcf] text-[#370e01] border-[#ffb59c]/50 hover:bg-[#ffdbcf]/80'
            }`}
          >
            Critical SLA (&lt;4h) <span className="ml-1 font-bold">({criticalCount})</span>
          </button>

          <button
            onClick={() => onSelectStatusTab('assigned')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              selectedStatusTab === 'assigned'
                ? 'bg-[#1a3125] text-white shadow-xs'
                : 'bg-[#f2ede4] text-[#1c1c16] hover:bg-[#ece8df]'
            }`}
          >
            Field Crew Assigned <span className="ml-1 text-[#4c6451]">({assignedCount})</span>
          </button>

          <button
            onClick={() => onSelectStatusTab('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              selectedStatusTab === 'pending'
                ? 'bg-[#1a3125] text-white shadow-xs'
                : 'bg-[#f2ede4] text-[#1c1c16] hover:bg-[#ece8df]'
            }`}
          >
            Pending Citizen Verification <span className="ml-1 text-[#4c6451]">({pendingCount})</span>
          </button>
        </div>

        {/* Live Auto-sync indicator & refresh button */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#727973]">Auto-sync:</span>
          <span className="px-2 py-0.5 rounded bg-[#f2ede4] text-[#051c11] text-xs font-mono border border-[#c2c8c2]/30">
            Live {autoSyncCount}s
          </span>
          <button
            onClick={onRefresh}
            className="p-1 rounded text-[#4c6451] hover:text-[#051c11] hover:bg-[#f2ede4] transition-colors"
            title="Force Refresh Live Telemetry"
          >
            <span className="material-symbols-outlined text-[18px]">sync</span>
          </button>
        </div>
      </section>

      {/* Queue Header and Filtering Tools */}
      <div className="bg-white rounded-xl border border-[#c2c8c2]/30 p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="font-headline text-base sm:text-lg text-[#051c11] font-semibold">
              Priority Triage &amp; Dispatch Queue
            </h2>
            <p className="font-body text-xs text-[#424844]">
              Real-time civic tickets indexed by machine vision severity
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenReportModal && (
              <button
                onClick={onOpenReportModal}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1a3125] text-white text-xs font-mono font-semibold hover:bg-[#051c11] transition-all shadow-xs cursor-pointer active:scale-95"
                title="Log New Defect / Report Issue"
              >
                <span className="material-symbols-outlined text-[15px] text-[#cee9d7]">add_circle</span>
                <span>+ Log Incident</span>
              </button>
            )}

            <span className="text-xs font-mono text-[#727973]">Filter Dept:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs font-mono bg-[#f7f3ea] border border-[#c2c8c2]/40 rounded px-2.5 py-1 text-[#1c1c16] focus:outline-none focus:border-[#051c11] cursor-pointer"
            >
              <option value="all">All Departments (3)</option>
              <option value="highways">GCC Works / Highways</option>
              <option value="electric">TANGEDCO / Electric</option>
              <option value="hydro">CMWSSB / Hydro</option>
            </select>
          </div>
        </div>

        {/* Queue Search Field */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#727973] text-[18px]">
            filter_list
          </span>
          <input
            className="w-full pl-9 pr-4 py-1.5 text-xs font-body bg-[#f7f3ea] border border-[#c2c8c2]/30 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#051c11] text-[#1c1c16] placeholder:text-[#727973] transition-all"
            placeholder="Filter active queue by defect keyword, worker, or landmark..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#727973] hover:text-[#1c1c16]"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Docket List */}
      <div className="flex flex-col gap-3">
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#c2c8c2]/30 p-8 text-center text-[#727973]">
            <span className="material-symbols-outlined text-4xl mb-2 text-[#4c6451]">inbox</span>
            <p className="font-headline font-semibold text-sm text-[#051c11]">No active dockets found</p>
            <p className="font-body text-xs mt-1">Try resetting the department or status filter criteria.</p>
          </div>
        ) : (
          filteredTickets.map((t) => {
            const isSelected = t.id === selectedTicketId;

            return (
              <div
                key={t.id}
                className={`docket-item bg-white rounded-xl border p-4 transition-all shadow-xs ${
                  isSelected ? 'border-[#4c6451] ring-1 ring-[#4c6451]' : 'border-[#c2c8c2]/30 hover:border-[#4c6451]'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#c2c8c2]/20 pb-2.5">
                  <div className="flex items-center gap-2">
                    {t.status === 'critical' ? (
                      <span className="px-2 py-0.5 rounded bg-[#ffdbcf] text-[#370e01] text-xs font-mono font-bold flex items-center gap-1 border border-[#ffb59c]/50">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        Critical Severity
                      </span>
                    ) : t.status === 'assigned' ? (
                      <span className="px-2 py-0.5 rounded bg-[#c9e4cc] text-[#4e6753] text-xs font-mono font-bold flex items-center gap-1 border border-[#b3cdb6]/40">
                        <span className="material-symbols-outlined text-[14px]">build</span>
                        In Progress
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-[#cee9d1] text-[#092011] text-xs font-mono font-bold flex items-center gap-1 border border-[#b3cdb6]/40">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Crew Marked Repaired
                      </span>
                    )}

                    <span className="font-mono text-xs font-bold text-[#051c11]">
                      {t.docketNumber}
                    </span>
                    <span className="font-mono text-xs text-[#727973]">
                      • {t.loggedTimeAgo}
                    </span>
                  </div>

                  {/* Right badge / countdown */}
                  {t.status === 'critical' ? (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#ffdad6]/60 text-[#93000a] font-mono text-xs font-semibold">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ba1a1a] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ba1a1a]"></span>
                      </span>
                      <span>{formatSla(t.slaRemainingSeconds)}</span>
                    </div>
                  ) : t.status === 'assigned' ? (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#f2ede4] text-[#4c6451] font-mono text-xs font-semibold">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      <span>{t.assignedCrew} On-Site • ETA {t.etaMinutes || 25}m</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#f2ede4] text-[#4c6451] font-mono text-xs font-semibold">
                      <span className="material-symbols-outlined text-[14px]">verified_user</span>
                      <span>Awaiting Citizen Sign-off</span>
                    </div>
                  )}
                </div>

                {/* Middle details */}
                <div className="my-3 flex flex-col sm:flex-row items-start justify-between gap-3">
                  <div>
                    <h4 className="font-headline text-sm font-semibold text-[#051c11]">
                      {t.title}
                    </h4>
                    <p className="font-body text-xs text-[#424844] mt-0.5 leading-relaxed">
                      {t.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded bg-[#f2ede4] text-[#424844] font-mono text-[11px]">
                        {t.deptLabel}
                      </span>
                      <span className="text-xs text-[#727973]">•</span>
                      <span className="font-mono text-[11px] text-[#4c6451] font-medium">
                        {t.location}
                      </span>
                    </div>
                  </div>

                  {/* Status / Assigned Lead Column */}
                  <div className="text-left sm:text-right shrink-0">
                    {t.status === 'critical' ? (
                      <>
                        <span className="font-mono text-[10px] text-[#727973] block uppercase">Status:</span>
                        <span className="font-mono text-xs text-[#ba1a1a] font-bold">UNASSIGNED</span>
                      </>
                    ) : t.status === 'assigned' ? (
                      <>
                        <span className="font-mono text-[10px] text-[#727973] block uppercase">Assigned Lead:</span>
                        <span className="font-mono text-xs text-[#051c11] font-bold">{t.assignedLead}</span>
                      </>
                    ) : (
                      <>
                        <span className="font-mono text-[10px] text-[#727973] block uppercase">Inspection SLA:</span>
                        <span className="font-mono text-xs text-[#4c6451] font-bold">
                          {t.inspectionStatus || 'Seal Ready'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Footer action buttons */}
                <div className="pt-3 border-t border-[#c2c8c2]/20 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectTicket(t.id)}
                      className="text-xs text-[#4c6451] hover:text-[#051c11] flex items-center gap-1 font-medium transition-colors"
                    >
                      <span className="material-symbols-outlined text-[15px]">my_location</span>
                      Focus on Map
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {t.status === 'critical' ? (
                      <>
                        <button
                          onClick={() => onConsolidateDuplicate(t.id)}
                          className="px-2.5 py-1.5 rounded bg-[#f2ede4] text-[#1c1c16] hover:bg-[#e6e2d9] text-xs font-mono border border-[#c2c8c2]/30 transition-colors"
                        >
                          Consolidate Duplicate
                        </button>
                        <button
                          onClick={() => onOpenDispatchModal(t.id, 'Asphalt Patch Unit B')}
                          className="px-3 py-1.5 rounded bg-[#1a3125] text-white hover:bg-opacity-95 text-xs font-mono font-semibold transition-all shadow-xs"
                        >
                          Dispatch Crew (Asphalt Team B)
                        </button>
                      </>
                    ) : t.status === 'assigned' ? (
                      <>
                        <button
                          onClick={() => onReroutePriority(t.id)}
                          className="px-2.5 py-1.5 rounded bg-[#f2ede4] text-[#1c1c16] hover:bg-[#e6e2d9] text-xs font-mono border border-[#c2c8c2]/30 transition-colors"
                        >
                          Re-route Priority
                        </button>
                        <button
                          onClick={() => onViewFieldProgress(t.id)}
                          className="px-3 py-1.5 rounded bg-[#ece8df] text-[#051c11] hover:bg-[#e6e2d9] text-xs font-mono font-semibold transition-all border border-[#c2c8c2]/30"
                        >
                          View Field Progress
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onOpenVerificationModal(t.id)}
                        className="px-3 py-1.5 rounded bg-[#1a3125] text-white hover:bg-opacity-95 text-xs font-mono font-semibold transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[15px]">send</span>
                        Upload Completion Proof &amp; Notify Citizen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
