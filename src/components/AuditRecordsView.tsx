import React, { useState } from 'react';
import { AuditRecord } from '../types';

interface AuditRecordsViewProps {
  logs: AuditRecord[];
  onToast: (msg: string) => void;
}

export const AuditRecordsView: React.FC<AuditRecordsViewProps> = ({ logs, onToast }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter((l) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      l.docketId.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.officer.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-[1720px] w-full mx-auto p-4 sm:p-6 flex flex-col gap-6 animate-in fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#c2c8c2]/30 shadow-xs">
        <div>
          <h2 className="font-headline text-lg sm:text-xl font-bold text-[#051c11]">
            Municipal Audit Ledger &amp; SLA Compliance Trail
          </h2>
          <p className="font-body text-xs text-[#424844]">
            Cryptographically sealed and timestamped municipal actions in accordance with Greater Chennai Corporation Works Act.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search audit trail by docket or officer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-3 pr-3 py-1.5 bg-[#f7f3ea] border border-[#c2c8c2]/40 rounded text-xs font-mono w-64 focus:outline-none focus:border-[#051c11]"
          />
          <button
            onClick={() => onToast('Audit ledger exported to immutable CSV archive')}
            className="px-3 py-1.5 rounded bg-[#1a3125] text-white text-xs font-mono font-medium hover:bg-opacity-95 flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            Export Ledger
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#c2c8c2]/30 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body">
            <thead className="bg-[#f7f3ea] border-b border-[#c2c8c2]/30 text-[#424844] font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Docket ID</th>
                <th className="py-3 px-4">Timestamp (IST)</th>
                <th className="py-3 px-4">Action / Event</th>
                <th className="py-3 px-4">Authorized Officer</th>
                <th className="py-3 px-4">Audit Details</th>
                <th className="py-3 px-4 text-center">SLA Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c2c8c2]/20">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#f7f3ea]/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#051c11]">{log.docketId}</td>
                  <td className="py-3 px-4 font-mono text-[#727973]">{log.timestamp}</td>
                  <td className="py-3 px-4 font-semibold text-[#1c1c16]">{log.action}</td>
                  <td className="py-3 px-4 font-mono text-[#4c6451]">{log.officer}</td>
                  <td className="py-3 px-4 text-[#424844] max-w-md">{log.details}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#c9e4cc] text-[#092011] font-mono text-[10px] font-bold">
                      <span className="material-symbols-outlined text-[12px]">check</span>
                      SLA MET
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
