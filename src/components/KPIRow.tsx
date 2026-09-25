import React from 'react';

interface KPIRowProps {
  onCardClick?: (metric: string) => void;
  meanResolutionTime?: string;
  mergedCount?: number;
  activeUnitsCount?: number;
  complianceRate?: string;
}

export const KPIRow: React.FC<KPIRowProps> = ({
  onCardClick,
  meanResolutionTime = '04h 12m',
  mergedCount = 84,
  activeUnitsCount = 14,
  complianceRate = '92.4%',
}) => {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Mean Resolution Time */}
      <div 
        onClick={() => onCardClick?.('mean-time')}
        className="bg-white p-4 rounded-xl border border-[#c2c8c2]/30 flex flex-col justify-between hover:border-[#4c6451] transition-all cursor-pointer shadow-xs group"
      >
        <div className="flex items-start justify-between">
          <span className="font-mono text-[11px] text-[#424844] uppercase tracking-wider font-medium">
            Mean Resolution Time
          </span>
          <span className="p-1 rounded bg-[#f2ede4] text-[#4c6451] group-hover:bg-[#c9e4cc] transition-colors">
            <span className="material-symbols-outlined text-[18px]">timer</span>
          </span>
        </div>
        <div className="my-2">
          <div className="font-headline text-2xl lg:text-3xl text-[#051c11] font-bold tabular-nums">
            {meanResolutionTime}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#4c6451]">
          <span className="material-symbols-outlined text-[15px]">trending_down</span>
          <span className="font-mono text-[11px] font-medium">38% faster than 24h SLA target</span>
        </div>
      </div>

      {/* Card 2: Deduplication Efficiency */}
      <div 
        onClick={() => onCardClick?.('dedup')}
        className="bg-white p-4 rounded-xl border border-[#c2c8c2]/30 flex flex-col justify-between hover:border-[#4c6451] transition-all cursor-pointer shadow-xs group"
      >
        <div className="flex items-start justify-between">
          <span className="font-mono text-[11px] text-[#424844] uppercase tracking-wider font-medium">
            Deduplication Efficiency
          </span>
          <span className="p-1 rounded bg-[#f2ede4] text-[#4c6451] group-hover:bg-[#c9e4cc] transition-colors">
            <span className="material-symbols-outlined text-[18px]">call_merge</span>
          </span>
        </div>
        <div className="my-2">
          <div className="font-headline text-2xl lg:text-3xl text-[#051c11] font-bold tabular-nums">
            {mergedCount} Merged
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#4c6451]">
          <span className="material-symbols-outlined text-[15px]">check_circle</span>
          <span className="font-mono text-[11px] font-medium">16.4 contractor hours saved</span>
        </div>
      </div>

      {/* Card 3: Active Field Units */}
      <div 
        onClick={() => onCardClick?.('crews')}
        className="bg-white p-4 rounded-xl border border-[#c2c8c2]/30 flex flex-col justify-between hover:border-[#4c6451] transition-all cursor-pointer shadow-xs group"
      >
        <div className="flex items-start justify-between">
          <span className="font-mono text-[11px] text-[#424844] uppercase tracking-wider font-medium">
            Active Field Units
          </span>
          <span className="p-1 rounded bg-[#f2ede4] text-[#4c6451] group-hover:bg-[#c9e4cc] transition-colors">
            <span className="material-symbols-outlined text-[18px]">engineering</span>
          </span>
        </div>
        <div className="my-2">
          <div className="font-headline text-2xl lg:text-3xl text-[#051c11] font-bold tabular-nums">
            {activeUnitsCount} Units Deployed
          </div>
        </div>
        <div className="font-mono text-[11px] text-[#424844] flex flex-wrap gap-x-2">
          <span>Linemen: <strong className="text-[#051c11]">4</strong></span>
          <span>Patch: <strong className="text-[#051c11]">3</strong></span>
          <span>Hydro: <strong className="text-[#051c11]">4</strong></span>
          <span>Sanitation: <strong className="text-[#051c11]">3</strong></span>
        </div>
      </div>

      {/* Card 4: Citizen Sign-Off Compliance */}
      <div 
        onClick={() => onCardClick?.('compliance')}
        className="bg-white p-4 rounded-xl border border-[#c2c8c2]/30 flex flex-col justify-between hover:border-[#4c6451] transition-all cursor-pointer shadow-xs group"
      >
        <div className="flex items-start justify-between">
          <span className="font-mono text-[11px] text-[#424844] uppercase tracking-wider font-medium">
            Citizen Sign-Off Compliance
          </span>
          <span className="p-1 rounded bg-[#f2ede4] text-[#4c6451] group-hover:bg-[#c9e4cc] transition-colors">
            <span className="material-symbols-outlined text-[18px]">verified</span>
          </span>
        </div>
        <div className="my-2">
          <div className="font-headline text-2xl lg:text-3xl text-[#051c11] font-bold tabular-nums">
            {complianceRate}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#4c6451]">
          <span className="material-symbols-outlined text-[15px]">thumb_up</span>
          <span className="font-mono text-[11px] font-medium">340 verified closures this week</span>
        </div>
      </div>
    </section>
  );
};
