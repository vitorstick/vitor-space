import type { TimelineItem } from "../models/TimelineItem";
import { Building2, CalendarDays, Code2, MapPinCheck, Terminal, Cpu } from "lucide-react";

type DialogDetailProps = {
  entry: TimelineItem;
  onClose: () => void;
};

export const DialogDetail = ({ entry, onClose }: DialogDetailProps) => {
  return (
    <div
      className="relative w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden bg-[#121512]/95 border border-[#2a3524] shadow-[0_0_80px_rgba(0,0,0,0.9)] rounded-xl group text-left"
    >
      {/* Subtle grid pattern backdrop */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      />
      <div className="absolute top-2 left-3 text-[9px] font-mono text-lime-400/90 tracking-widest uppercase">
        SYSTEM_TELEMETRY // WAYPOINT_ID: {entry.id}
      </div>

      {/* Close Button */}
      <button
        className="absolute top-3 right-4 px-3 py-1 border border-lime-500/40 rounded font-mono text-xs text-lime-400 hover:bg-lime-950/60 hover:border-lime-400 transition-colors z-20 cursor-pointer"
        onClick={onClose}
        aria-label="Close dialog"
      >
        ESC [X]
      </button>

      <div className="p-6 md:p-8 overflow-y-auto flex flex-col gap-6 text-slate-200">
        {/* Header */}
        <div className="flex flex-col gap-1.5 pt-4 border-b border-[#283222] pb-5">
          <div className="flex items-center gap-2 text-xs font-mono text-lime-400/80 tracking-widest uppercase">
            {entry.type === 'location' ? <MapPinCheck size={14} /> : <Code2 size={14} />}
            <span>{entry.type === 'location' ? 'LOCATION_HUB' : 'WORK_EXPERIENCE'}</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white uppercase">
            {entry.role || entry.title}
          </h2>

          {entry.company && entry.role ? (
            <p className="text-sm font-mono text-lime-300/90">
              @ {entry.company}
            </p>
          ) : null}
        </div>

        {/* Telemetry Status Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2.5 p-2.5 bg-black/50 border border-[#222b1d] rounded">
            <CalendarDays size={18} className="text-lime-400 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-mono text-gray-400 uppercase">TIMEFRAME</span>
              <span className="text-xs font-semibold text-white truncate">{entry.date}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-black/50 border border-[#222b1d] rounded">
            <Building2 size={18} className="text-lime-400 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-mono text-gray-400 uppercase">TYPE</span>
              <span className="text-xs font-semibold text-white uppercase truncate">{entry.type}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-black/50 border border-[#222b1d] rounded col-span-2 sm:col-span-1">
            <Cpu size={18} className="text-lime-400 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-mono text-gray-400 uppercase">STATUS</span>
              <span className={`text-xs font-semibold uppercase truncate ${entry.status === 'ACTIVE DEPLOYMENT' ? 'text-lime-400 animate-pulse' : 'text-amber-400'
                }`}>
                {entry.status || 'DEPLOYED'}
              </span>
            </div>
          </div>
        </div>

        {/* Tech Stack Pills */}
        {entry.technologies && entry.technologies.length > 0 ? (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal size={12} className="text-lime-400" />
              TECHNOLOGY_STACK:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {entry.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 text-xs font-mono bg-[#182216] border border-[#2e4028] text-lime-200 rounded-md shadow-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {/* Description */}
        {entry.description ? (
          <div className="flex flex-col gap-1.5 text-sm text-slate-300 font-sans">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">OVERVIEW:</span>
            <p className="leading-relaxed bg-black/30 p-3 rounded border border-[#222]">{entry.description}</p>
          </div>
        ) : null}

        {/* Key Achievements / Telemetry Bullets */}
        {entry.bullets && entry.bullets.length > 0 ? (
          <div className="flex flex-col gap-2 pt-1 border-t border-[#222b1d]">
            <span className="text-[10px] font-mono text-lime-400/90 uppercase tracking-wider">
              KEY_DELIVERABLES & ACHIEVEMENTS:
            </span>
            <ul className="flex flex-col gap-2 text-xs md:text-sm text-slate-200 font-sans">
              {entry.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2 bg-black/40 p-2.5 rounded border border-[#1e271a]">
                  <span className="text-lime-400 font-mono text-xs mt-0.5 select-none">▸</span>
                  <span className="leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
};