import React from 'react';

interface PriorityBadgeProps {
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  severity = 'LOW',
  score,
  showScore = true,
  size = 'md',
}) => {
  const getConfig = () => {
    switch ((severity || 'LOW').toUpperCase()) {
      case 'CRITICAL':
        return { bg: 'bg-[#C64646]/10', text: 'text-[#C64646]', border: 'border-[#C64646]/40', dot: 'bg-[#C64646]' };
      case 'HIGH':
        return { bg: 'bg-[#D97824]/10', text: 'text-[#D97824]', border: 'border-[#D97824]/40', dot: 'bg-[#D97824]' };
      case 'MEDIUM':
        return { bg: 'bg-[#C99A28]/10', text: 'text-[#C99A28]', border: 'border-[#C99A28]/40', dot: 'bg-[#C99A28]' };
      default:
        return { bg: 'bg-[#24875D]/10', text: 'text-[#24875D]', border: 'border-[#24875D]/40', dot: 'bg-[#24875D]' };
    }
  };

  const config = getConfig();
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded border ${sizeClasses} ${config.bg} ${config.text} ${config.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{severity}</span>
      {showScore && score !== undefined && (
        <span className="opacity-75 font-mono text-[11px]">({score}/100)</span>
      )}
    </span>
  );
};
export default PriorityBadge;
