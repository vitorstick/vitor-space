import { Link, useLocation } from 'react-router-dom';
import { Activity, BookOpen, Code2, Layers, MapPinCheck, Route } from 'lucide-react';
import type { TimelineType } from '../models/TimelineItem';

type HeaderHUDProps = {
  scrollProgress?: number;
  activeFilter?: 'all' | TimelineType;
  onFilterChange?: (filter: 'all' | TimelineType) => void;
  totalItems?: number;
  reachedItems?: number;
};

export const HeaderHUD = ({
  scrollProgress = 0,
  activeFilter = 'all',
  onFilterChange,
  totalItems = 0,
  reachedItems = 0,
}: HeaderHUDProps) => {
  const location = useLocation();
  const progressPercent = Math.round(scrollProgress * 100);

  const isTimelinePage = location.pathname === '/' || location.pathname.startsWith('/waypoint');
  const isBlogPage = location.pathname.startsWith('/blog');

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
    <header className="fixed inset-x-0 top-0 z-40 bg-[#0a0d09]/90 border-b border-[#232f1e]/80 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      {/* Primary Top Bar */}
      <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-2.5 md:px-6 md:py-3">
        {/* Left Branding & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono tracking-[0.2em] text-lime-400 uppercase">
            <Activity size={15} className="animate-pulse text-lime-400 shrink-0" />
            <Link to="/" className="font-bold text-white hover:text-lime-300 transition-colors">
              VITOR_RODRIGUES
            </Link>
            <span className="hidden sm:inline text-lime-400/80 font-normal">
              // {isBlogPage ? 'ENGINEERING_LOGS' : 'CAREER_TELEMETRY'}
            </span>
          </div>

          <span className="hidden lg:inline-block text-[11px] font-mono text-slate-400 border-l border-[#222c1e] pl-3 py-0.5">
            Senior Software Engineer
          </span>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-black/70 p-1 rounded-lg border border-[#222c1e]">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-all ${isTimelinePage
                ? 'bg-lime-400 text-black font-bold shadow-[0_0_10px_rgba(163,230,53,0.4)]'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            <Route size={13} />
            <span>TELEMETRY</span>
          </Link>

          <Link
            to="/blog"
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-all ${isBlogPage
                ? 'bg-lime-400 text-black font-bold shadow-[0_0_10px_rgba(163,230,53,0.4)]'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            <BookOpen size={13} />
            <span>BLOG</span>
          </Link>
        </nav>
      </div>

      {/* Secondary Telemetry Controls & Filters (Shown on Timeline Page) */}
      {isTimelinePage && onFilterChange && (
        <div className="border-t border-[#1f2b1b]/80 bg-[#060805]/95 px-4 py-2 md:px-6">
          <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
            {/* Progress Indicator */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                  PROGRESS:
                </span>
                <span className="font-bold text-lime-400">{progressPercent}%</span>
              </div>

              <div className="flex items-center gap-1.5 border-l border-[#222c1e] pl-3">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                  WAYPOINTS:
                </span>
                <span className="text-slate-200">
                  {reachedItems}/{totalItems}
                </span>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onFilterChange('all')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-all cursor-pointer ${activeFilter === 'all'
                    ? 'bg-lime-400 text-black font-semibold shadow-[0_0_10px_rgba(163,230,53,0.4)]'
                    : 'bg-black/60 text-slate-400 border border-[#222c1e] hover:border-lime-500/50 hover:text-slate-200'
                  }`}
              >
                <Layers size={12} />
                <span>ALL</span>
              </button>

              <button
                onClick={() => onFilterChange('code')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-all cursor-pointer ${activeFilter === 'code'
                    ? 'bg-lime-400 text-black font-semibold shadow-[0_0_10px_rgba(163,230,53,0.4)]'
                    : 'bg-black/60 text-slate-400 border border-[#222c1e] hover:border-lime-500/50 hover:text-slate-200'
                  }`}
              >
                <Code2 size={12} />
                <span>ROLES</span>
              </button>

              <button
                onClick={() => onFilterChange('location')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-all cursor-pointer ${activeFilter === 'location'
                    ? 'bg-lime-400 text-black font-semibold shadow-[0_0_10px_rgba(163,230,53,0.4)]'
                    : 'bg-black/60 text-slate-400 border border-[#222c1e] hover:border-lime-500/50 hover:text-slate-200'
                  }`}
              >
                <MapPinCheck size={12} />
                <span>LOCATIONS</span>
              </button>
            </div>

            {/* Jump Shortcuts */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => scrollToPercentage(0)}
                title="Jump to Start (Mealhada 1982)"
                className="px-2 py-0.5 text-[10px] font-mono text-slate-400 hover:text-lime-300 border border-[#222c1e] rounded bg-black/40 cursor-pointer"
              >
                START
              </button>
              <button
                onClick={() => scrollToPercentage(1.0)}
                title="Jump to Current Role (SemmieWealth)"
                className="px-2 py-0.5 text-[10px] font-mono text-lime-400 hover:text-lime-200 border border-lime-500/40 rounded bg-lime-950/30 cursor-pointer"
              >
                PRESENT
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
