import { Building2, Code2, Compass, Mountain, ChevronRight } from 'lucide-react';
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
      case 'location': return <Building2 size={18} className={cls} />;
      case 'code': return <Code2 size={18} className={cls} />;
      case 'project': return <Mountain size={18} className={cls} />;
      default: return <Compass size={18} className={cls} />;
    }
  };

  const filteredItems = timeline.filter(
    (entry) => activeFilter === 'all' || entry.type === activeFilter
  );

  return (
    <div className="w-full pt-32 md:pt-36 pb-24 px-4 flex flex-col gap-6 max-w-lg mx-auto z-10 relative">
      <div className="text-center font-mono text-[10px] uppercase tracking-[0.25em] text-lime-400/80 mb-2">
        // VERTICAL_ROUTE_STREAM (MOBILE_VIEW)
      </div>

      <div className="relative border-l-2 border-[#263321] ml-4 flex flex-col gap-6 pl-6">
        {filteredItems.map((entry) => {
          const isReached = scrollProgress >= entry.routeProgressPercentage;

          return (
            <div
              key={entry.id}
              onClick={() => onSelectEntry(entry)}
              className={`relative flex flex-col gap-2.5 p-4 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
                isReached
                  ? 'bg-[#141a12]/90 border-lime-400/80 shadow-[0_0_20px_rgba(163,230,53,0.2)]'
                  : 'bg-[#10130f]/80 border-[#242e20]'
              }`}
            >
              {/* Timeline Connector Dot on Left Line */}
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
                    className={`flex items-center justify-center w-8 h-8 rounded border bg-black ${
                      isReached ? 'border-lime-400/70' : 'border-[#283523]'
                    }`}
                  >
                    {getIcon(entry.type, isReached)}
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                    {entry.date}
                  </span>
                </div>

                <span
                  className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded ${
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
                <h3 className="text-base font-bold text-white uppercase tracking-tight">
                  {entry.role || entry.title}
                </h3>
                {entry.company && entry.role ? (
                  <span className="text-xs font-mono text-lime-300/80">
                    @ {entry.company}
                  </span>
                ) : null}
              </div>

              {/* Tech Tags Preview */}
              {entry.technologies && entry.technologies.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1">
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
                <ChevronRight size={14} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
