import { useMemo } from 'react';
import { Building2, Code2, Compass, Mountain, ChevronRight, CheckCircle2 } from 'lucide-react';
import type { TimelineItem, TimelineType } from '../models/TimelineItem';
import { timeline } from '../data/timeline';

type MobileTimelineViewProps = {
  scrollProgress: number;
  activeFilter: 'all' | TimelineType;
  onSelectEntry: (entry: TimelineItem) => void;
};

export const MobileTimelineView = ({
  scrollProgress,
  activeFilter,
  onSelectEntry,
}: MobileTimelineViewProps) => {
  const getIcon = (type: TimelineType, isReached: boolean) => {
    const cls = isReached ? 'text-lime-300' : 'text-lime-500/70';
    switch (type) {
      case 'location':
        return <Building2 size={18} className={cls} />;
      case 'code':
        return <Code2 size={18} className={cls} />;
      case 'project':
        return <Mountain size={18} className={cls} />;
      default:
        return <Compass size={18} className={cls} />;
    }
  };

  const filteredItems = useMemo(() => {
    return timeline.filter(
      (entry) => activeFilter === 'all' || entry.type === activeFilter
    );
  }, [activeFilter]);

  return (
    <div className="w-full pt-28 md:pt-36 pb-28 px-4 flex flex-col gap-6 max-w-lg mx-auto z-10 relative">
      {/* Stream Header */}
      <div className="flex items-center justify-between px-2 font-mono text-[10px] text-lime-400/80 uppercase tracking-widest">
        <span>// VERTICAL_ROUTE_STREAM</span>
        <span>
          FILTER: {activeFilter.toUpperCase()} ({filteredItems.length})
        </span>
      </div>

      {/* Vertical Timeline Track */}
      <div className="relative border-l-2 border-[#263321] ml-4 flex flex-col gap-6 pl-6">
        {filteredItems.map((entry, index) => {
          // Normalize progress so items light up smoothly across the filtered scroll range
          const normalizedTarget =
            filteredItems.length > 1
              ? (index / (filteredItems.length - 1)) * 0.9
              : 0;

          const isReached =
            activeFilter === 'all'
              ? scrollProgress >= entry.routeProgressPercentage
              : scrollProgress >= normalizedTarget;

          return (
            <div
              key={entry.id}
              onClick={() => onSelectEntry(entry)}
              className={`relative flex flex-col gap-2.5 p-4 rounded-xl border backdrop-blur-md transition-all cursor-pointer group ${
                isReached
                  ? 'bg-[#141a12]/90 border-lime-400/80 shadow-[0_0_20px_rgba(163,230,53,0.2)]'
                  : 'bg-[#10130f]/80 border-[#242e20] hover:border-[#384a32]'
              }`}
            >
              {/* Connector Pin on Track */}
              <div
                className={`absolute -left-[31px] top-5 w-4 h-4 rounded-full border-2 transition-all ${
                  isReached
                    ? 'border-lime-400 bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.8)]'
                    : 'border-[#384a32] bg-black'
                }`}
              />

              {/* Header Info */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded border bg-black transition-colors ${
                      isReached ? 'border-lime-400/70 shadow-[0_0_8px_rgba(163,230,53,0.3)]' : 'border-[#283523]'
                    }`}
                  >
                    {getIcon(entry.type, isReached)}
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                    {entry.date}
                  </span>
                </div>

                <span
                  className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded transition-colors ${
                    isReached
                      ? 'bg-lime-400/20 text-lime-300 border border-lime-500/40'
                      : 'bg-black/40 text-gray-400 border border-[#222c1e]'
                  }`}
                >
                  {entry.type}
                </span>
              </div>

              {/* Title & Role */}
              <div className="flex flex-col">
                <h3 className="text-base font-bold text-white uppercase tracking-tight group-hover:text-lime-200 transition-colors">
                  {entry.role || entry.title}
                </h3>
                {entry.company && entry.role ? (
                  <span className="text-xs font-mono text-lime-300/80 font-medium">
                    @ {entry.company}
                  </span>
                ) : null}
              </div>

              {/* Tech Tags Preview */}
              {entry.technologies && entry.technologies.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {entry.technologies.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 text-[10px] font-mono bg-[#162014] text-lime-200/90 border border-[#263622] rounded"
                    >
                      {tech}
                    </span>
                  ))}
                  {entry.technologies.length > 4 ? (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono text-gray-400">
                      +{entry.technologies.length - 4}
                    </span>
                  ) : null}
                </div>
              ) : null}

              {/* Footer Tap CTA */}
              <div className="flex items-center justify-between pt-2 border-t border-[#222d1d] text-xs font-mono text-lime-400/90 mt-1">
                <span>INSPECT_TELEMETRY</span>
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}

        {/* End of Stream Marker */}
        <div className="relative flex items-center gap-2 pt-2 text-[10px] font-mono text-lime-400/60 uppercase tracking-widest">
          <div className="absolute -left-[27px] w-2 h-2 rounded-full bg-lime-400/60" />
          <CheckCircle2 size={13} className="text-lime-400/70" />
          <span>// STREAM_END: ALL {filteredItems.length} HUBS LOADED</span>
        </div>
      </div>
    </div>
  );
};
