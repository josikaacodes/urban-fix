import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface SlaTimerProps {
  dueAt?: string;
  deadline?: string;
  status?: string;
  isBreached?: boolean;
}

const SlaTimer: React.FC<SlaTimerProps> = ({ dueAt, deadline, status, isBreached = false }) => {
  const target = dueAt || deadline;

  const [timeLeft, setTimeLeft] = useState<{ formatted: string; breached: boolean }>({
    formatted: '--:--:--',
    breached: isBreached,
  });

  useEffect(() => {
    if (!target) return;

    const updateTimer = () => {
      const targetMs = new Date(target).getTime();
      const now = Date.now();
      const diff = targetMs - now;

      if (diff <= 0) {
        const overdue = Math.abs(diff);
        const hrs = Math.floor(overdue / (1000 * 60 * 60));
        const mins = Math.floor((overdue % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((overdue % (1000 * 60)) / 1000);
        setTimeLeft({
          formatted: `BREACHED (+${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')})`,
          breached: true,
        });
      } else {
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({
          formatted: `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
          breached: false,
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [target]);

  // Don't show timer for terminal statuses
  if (status && ['CLOSED', 'CITIZEN_CONFIRMED', 'VERIFICATION_FAILED'].includes(status)) {
    return null;
  }

  if (!target) return null;

  if (timeLeft.breached) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#C64646]/10 text-[#C64646] border border-[#C64646]/30 text-xs font-mono font-medium">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span>SLA {timeLeft.formatted}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#246B8E]/10 text-[#246B8E] border border-[#246B8E]/30 text-xs font-mono font-medium">
      <Clock className="w-3.5 h-3.5 shrink-0" />
      <span>SLA: {timeLeft.formatted}</span>
    </div>
  );
};
export default SlaTimer;
