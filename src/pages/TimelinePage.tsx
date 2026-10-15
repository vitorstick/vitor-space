import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { TopoBackground } from '../components/TopoBackground';
import { WaypointCard } from '../components/WaypointCard';
import { DialogDetail } from '../components/DialogDetail';
import { MobileTimelineView } from '../components/MobileTimelineView';
import { timeline } from '../data/timeline';
import { createRoutePath } from '../lib/route';
import { refreshScrollProgress, useScrollProgress } from '../lib/scrollProgress';
import { useViewportSize } from '../lib/useViewportSize';
import type { TimelineItem, TimelineType } from '../models/TimelineItem';

type TimelinePageProps = {
  activeFilter: 'all' | TimelineType;
  setActiveFilter: (filter: 'all' | TimelineType) => void;
};

type DesktopWaypointProps = {
  entry: TimelineItem;
  x: number;
  y: number;
  onSelect: (entry: TimelineItem) => void;
};

// Subscribes to a boolean derived from scroll progress, so it only re-renders
// when this specific waypoint crosses its "reached" threshold.
const DesktopWaypoint = memo(({ entry, x, y, onSelect }: DesktopWaypointProps) => {
  const isReached = useScrollProgress((p) => p >= entry.routeProgressPercentage);

  return (
    <div className="pointer-events-auto absolute cursor-pointer" onClick={() => onSelect(entry)}>
      <WaypointCard
        type={entry.type}
        date={entry.date}
        title={entry.title}
        top={`${y}px`}
        left={`${x}px`}
        isReached={isReached}
      />
    </div>
  );
});
DesktopWaypoint.displayName = 'DesktopWaypoint';

export const TimelinePage = ({ activeFilter, setActiveFilter }: TimelinePageProps) => {
  const navigate = useNavigate();
  const { waypointId } = useParams<{ waypointId?: string }>();
  const [searchParams] = useSearchParams();

  const viewport = useViewportSize();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const isMobile = viewport.width > 0 && viewport.width < 768;

  // Active waypoint entry from URL param
  const activeEntry = useMemo(() => {
    if (!waypointId) return null;
    return timeline.find((item) => item.id === waypointId) || null;
  }, [waypointId]);

  // Sync search parameter ?filter=... if present
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam === 'all' || filterParam === 'code' || filterParam === 'location') {
      setActiveFilter(filterParam);
    }
  }, [searchParams, setActiveFilter]);

  // Auto-scroll to waypoint when navigating directly to /waypoint/:id.
  // Intentionally NOT dependent on viewport height: on mobile the URL bar
  // showing/hiding fires resize events, which would re-trigger the smooth scroll.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (activeEntry) {
      const targetProgress = activeEntry.routeProgressPercentage;
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        window.scrollTo({
          top: totalScroll * targetProgress,
          behavior: 'smooth',
        });
      }
      if (dialog && !dialog.open) {
        dialog.showModal();
      }
    } else if (dialog?.open) {
      dialog.close();
    }
  }, [activeEntry]);

  const routePath = useMemo(() => {
    if (!viewport.width || !viewport.height) return '';
    return createRoutePath(viewport.width, viewport.height);
  }, [viewport.height, viewport.width]);

  const positions = useMemo(() => {
    if (!routePath || !viewport.width || !viewport.height) return [];

    const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathEl.setAttribute('d', routePath);
    const totalLength = pathEl.getTotalLength();

    return timeline.map((entry) => {
      const point = pathEl.getPointAtLength(entry.routeProgressPercentage * totalLength);
      return {
        id: entry.id,
        x: point.x,
        y: point.y,
      };
    });
  }, [routePath, viewport.height, viewport.width]);

  const positionMap = useMemo(() => {
    return new Map(positions.map((position) => [position.id, position]));
  }, [positions]);

  const openWaypoint = useCallback(
    (entry: TimelineItem) => {
      void navigate(`/waypoint/${entry.id}`);
    },
    [navigate]
  );

  const closeDialog = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.classList.add('dialog-closing');
    dialog.addEventListener(
      'animationend',
      function handleAnimationEnd() {
        dialog.classList.remove('dialog-closing');
        dialog.close();
        dialog.removeEventListener('animationend', handleAnimationEnd);
        void navigate('/');
      },
      { once: true }
    );
  };

  const filteredCount = useMemo(() => {
    if (activeFilter === 'all') return timeline.length;
    return timeline.filter((item) => item.type === activeFilter).length;
  }, [activeFilter]);

  const minHeightClass = isMobile
    ? filteredCount <= 6
      ? 'min-h-[145vh]'
      : filteredCount <= 10
      ? 'min-h-[250vh]'
      : 'min-h-[380vh]'
    : 'min-h-[400vh]';

  // Page height changes with filter/layout, so re-measure progress.
  useEffect(() => {
    refreshScrollProgress();
  }, [minHeightClass]);

  return (
    <main className={`relative ${minHeightClass} text-slate-100`}>
      {routePath ? <TopoBackground routePath={routePath} /> : null}

      {routePath ? (
        isMobile ? (
          <MobileTimelineView activeFilter={activeFilter} onSelectEntry={openWaypoint} />
        ) : (
          <div className="pointer-events-none fixed inset-0 z-10" aria-hidden="true">
            {timeline.map((entry) => {
              if (activeFilter !== 'all' && entry.type !== activeFilter) {
                return null;
              }

              const position = positionMap.get(entry.id);
              if (!position) return null;

              return (
                <DesktopWaypoint
                  key={entry.id}
                  entry={entry}
                  x={position.x}
                  y={position.y}
                  onSelect={openWaypoint}
                />
              );
            })}
          </div>
        )
      ) : null}

      <dialog
        ref={dialogRef}
        onClick={(e) => e.target === dialogRef.current && closeDialog()}
        onCancel={(e) => {
          e.preventDefault();
          closeDialog();
        }}
        className="fixed inset-0 z-50 w-full h-full max-w-none max-h-none p-4 border-0 bg-transparent shadow-none backdrop:bg-black/75 backdrop:backdrop-blur-md dialog-animated items-center justify-center outline-none"
      >
        {activeEntry && <DialogDetail entry={activeEntry} onClose={closeDialog} />}
      </dialog>
    </main>
  );
};
