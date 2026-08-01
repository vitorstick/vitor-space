import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TopoBackground } from '../components/TopoBackground';
import { WaypointCard } from '../components/WaypointCard';
import { DialogDetail } from '../components/DialogDetail';
import { MobileTimelineView } from '../components/MobileTimelineView';
import { timeline } from '../data/timeline';
import { createRoutePath } from '../lib/route';
import { useViewportSize } from '../lib/useViewportSize';
import type { TimelineItem, TimelineType } from '../models/TimelineItem';

gsap.registerPlugin(ScrollTrigger);

type TimelinePageProps = {
  scrollProgress: number;
  setScrollProgress: (progress: number) => void;
  activeFilter: 'all' | TimelineType;
  setActiveFilter: (filter: 'all' | TimelineType) => void;
};

export const TimelinePage = ({
  scrollProgress,
  setScrollProgress,
  activeFilter,
  setActiveFilter,
}: TimelinePageProps) => {
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

  // Setup GSAP scroll trigger
  useEffect(() => {
    const updateScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const progress = Math.min(1, Math.max(0, window.scrollY / totalScroll));
        setScrollProgress(progress);
      }
    };

    const trigger = ScrollTrigger.create({
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.1,
      onUpdate: (self) => {
        setScrollProgress(self.progress);
      },
    });

    window.addEventListener('scroll', updateScroll, { passive: true });
    requestAnimationFrame(updateScroll);

    return () => {
      trigger.kill();
      window.removeEventListener('scroll', updateScroll);
    };
  }, [setScrollProgress]);

  // Auto-scroll to waypoint when navigating directly to /waypoint/:id
  useEffect(() => {
    if (activeEntry && viewport.height) {
      const targetProgress = activeEntry.routeProgressPercentage;
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        window.scrollTo({
          top: totalScroll * targetProgress,
          behavior: 'smooth',
        });
      }
      dialogRef.current?.showModal();
    } else if (!activeEntry) {
      if (dialogRef.current?.open) {
        dialogRef.current.close();
      }
    }
  }, [activeEntry, viewport.height]);

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

  const openWaypoint = (entry: TimelineItem) => {
    void navigate(`/waypoint/${entry.id}`);
  };

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

  return (
    <main className="relative min-h-[400vh] text-slate-100">
      {routePath ? <TopoBackground routePath={routePath} scrollProgress={scrollProgress} /> : null}

      {routePath ? (
        isMobile ? (
          <MobileTimelineView
            scrollProgress={scrollProgress}
            activeFilter={activeFilter}
            onSelectEntry={openWaypoint}
          />
        ) : (
          <div className="pointer-events-none fixed inset-0 z-10" aria-hidden="true">
            {timeline.map((entry) => {
              if (activeFilter !== 'all' && entry.type !== activeFilter) {
                return null;
              }

              const position = positionMap.get(entry.id);
              if (!position) return null;

              const isReached = scrollProgress >= entry.routeProgressPercentage;

              return (
                <div
                  key={entry.id}
                  className="pointer-events-auto absolute cursor-pointer"
                  onClick={() => openWaypoint(entry)}
                >
                  <WaypointCard
                    type={entry.type}
                    date={entry.date}
                    title={entry.title}
                    top={`${position.y}px`}
                    left={`${position.x}px`}
                    isReached={isReached}
                  />
                </div>
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
