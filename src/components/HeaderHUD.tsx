import { Activity, Code2, Layers, MapPinCheck } from 'lucide-react';
import type { TimelineType } from '../models/TimelineItem';

type HeaderHUDProps = {
  scrollProgress: number;
  activeFilter: 'all' | TimelineType;
  onFilterChange: (filter: 'all' | TimelineType) => void;
  totalItems: number;
  reachedItems: number;
};

export const HeaderHUD = ({
  scrollProgress,
  activeFilter,
  onFilterChange,
  totalItems,
  reachedItems,
}: HeaderHUDProps) => {
  const progressPercent = Math.round(scrollProgress * 100);

  const scrollToPercentage = (percentage: number) => {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (totalScroll > 0) {
      window.scrollTo({
        top: totalScroll * percentage,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 p-4 md:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-start md:justify-between">
        {/* Left Branding & Title */}
        <div className="pointer-events-auto flex flex-col gap-1.5 rounded-xl border border-[#232f1e]/80 bg-[#0a0d09]/85 p-4 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.25em] text-lime-400 uppercase">
            <Activity size={13} className="animate-pulse text-lime-400" />
            <span>VITOR_RODRIGUES // CAREER_TELEMETRY</span>
          </div>

          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white uppercase">
            Topographical Timeline
          </h1>

          <p className="text-xs font-mono text-slate-300/80 max-w-md">
            Staff & Senior Frontend Engineer • Hybrid Mobile & Web Architecture • 10+ Years Career Arc
          </p>
        </div>

        {/* Right Telemetry Controls & Filters */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-3 rounded-xl border border-[#232f1e]/80 bg-[#0a0d09]/85 p-3 md:p-4 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
          {/* Progress Indicator */}
          <div className="flex items-center gap-3 pr-3 border-r border-[#222c1e]">
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">ROUTE_PROGRESS</span>
              <span className="text-lg font-bold font-mono text-lime-400">
                {progressPercent}%
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">WAYPOINTS</span>
              <span className="text-xs font-mono text-slate-200">
                {reachedItems} / {totalItems}
              </span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onFilterChange('all')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${activeFilter === 'all'
                ? 'bg-lime-400 text-black font-semibold shadow-[0_0_12px_rgba(163,230,53,0.4)]'
                : 'bg-black/60 text-gray-400 border border-[#222c1e] hover:border-lime-500/50 hover:text-slate-200'
                }`}
            >
              <Layers size={13} />
              <span>ALL</span>
            </button>

            <button
              onClick={() => onFilterChange('code')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${activeFilter === 'code'
                ? 'bg-lime-400 text-black font-semibold shadow-[0_0_12px_rgba(163,230,53,0.4)]'
                : 'bg-black/60 text-gray-400 border border-[#222c1e] hover:border-lime-500/50 hover:text-slate-200'
                }`}
            >
              <Code2 size={13} />
              <span>ROLES</span>
            </button>

            <button
              onClick={() => onFilterChange('location')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${activeFilter === 'location'
                ? 'bg-lime-400 text-black font-semibold shadow-[0_0_12px_rgba(163,230,53,0.4)]'
                : 'bg-black/60 text-gray-400 border border-[#222c1e] hover:border-lime-500/50 hover:text-slate-200'
                }`}
            >
              <MapPinCheck size={13} />
              <span>LOCATIONS</span>
            </button>
          </div>

          {/* Jump Shortcuts */}
          <div className="flex items-center gap-1 pl-2 border-l border-[#222c1e]">
            <button
              onClick={() => scrollToPercentage(0)}
              title="Jump to Start (Mealhada 1982)"
              className="px-2 py-1 text-[10px] font-mono text-gray-400 hover:text-lime-300 border border-[#222c1e] rounded bg-black/40 cursor-pointer"
            >
              START
            </button>
            <button
              onClick={() => scrollToPercentage(1.0)}
              title="Jump to Current Role (SemmieWealth)"
              className="px-2 py-1 text-[10px] font-mono text-lime-400 hover:text-lime-200 border border-lime-500/40 rounded bg-lime-950/30 cursor-pointer"
            >
              PRESENT
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
