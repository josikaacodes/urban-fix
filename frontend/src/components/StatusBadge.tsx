import React from 'react';
import { IncidentStatus } from '../types';
import {
  Clock, Sparkles, UserCheck, Wrench, FileSearch,
  CheckCircle2, CheckSquare, XCircle, AlertTriangle, ShieldCheck,
} from 'lucide-react';

interface StatusBadgeProps {
  status: IncidentStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getConfig = () => {
    switch (status) {
      case 'SUBMITTED':
        return { label: 'Submitted', bg: 'bg-[#DDE5E9]', text: 'text-[#24333D]', Icon: Clock, border: 'border-[#C8D3D9]' };
      case 'AI_ANALYZING':
        return { label: 'AI Analyzing', bg: 'bg-[#2F7FA3]/10', text: 'text-[#2F7FA3]', Icon: Sparkles, border: 'border-[#2F7FA3]/30' };
      case 'AI_VERIFIED':
        return { label: 'AI Verified', bg: 'bg-[#24875D]/10', text: 'text-[#24875D]', Icon: ShieldCheck, border: 'border-[#24875D]/30' };
      case 'ASSIGNED':
        return { label: 'Worker Assigned', bg: 'bg-[#246B8E]/10', text: 'text-[#246B8E]', Icon: UserCheck, border: 'border-[#246B8E]/30' };
      case 'IN_PROGRESS':
        return { label: 'In Progress', bg: 'bg-[#D97824]/10', text: 'text-[#D97824]', Icon: Wrench, border: 'border-[#D97824]/30' };
      case 'PENDING_VERIFICATION':
        return { label: 'Pending Verification', bg: 'bg-[#C99A28]/10', text: 'text-[#C99A28]', Icon: FileSearch, border: 'border-[#C99A28]/30' };
      case 'RESOLVED':
        return { label: 'Resolved', bg: 'bg-[#24875D]/15', text: 'text-[#24875D]', Icon: CheckCircle2, border: 'border-[#24875D]/40' };
      case 'CITIZEN_CONFIRMED':
        return { label: 'Citizen Confirmed', bg: 'bg-[#24875D]/20', text: 'text-[#24875D]', Icon: CheckSquare, border: 'border-[#24875D]' };
      case 'CLOSED':
        return { label: 'Closed', bg: 'bg-[#173B57]/15', text: 'text-[#173B57]', Icon: ShieldCheck, border: 'border-[#173B57]/30' };
      case 'REOPENED':
        return { label: 'Reopened', bg: 'bg-[#C64646]/10', text: 'text-[#C64646]', Icon: AlertTriangle, border: 'border-[#C64646]/30' };
      case 'VERIFICATION_FAILED':
        return { label: 'Verification Failed', bg: 'bg-[#C64646]/15', text: 'text-[#C64646]', Icon: XCircle, border: 'border-[#C64646]/40' };
      default:
        return { label: String(status), bg: 'bg-[#DDE5E9]', text: 'text-[#24333D]', Icon: Clock, border: 'border-[#C8D3D9]' };
    }
  };

  const { label, bg, text, Icon, border } = getConfig();
  const sizeClasses =
    size === 'sm' ? 'px-2 py-0.5 text-xs' :
    size === 'lg' ? 'px-3.5 py-1.5 text-sm font-semibold' :
    'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border ${sizeClasses} ${bg} ${text} ${border}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{label}</span>
    </span>
  );
};
export default StatusBadge;
