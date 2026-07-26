import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useMemo, useRef, useState } from "react";
import { timeline } from "../data/timeline";
import { WaypointCard } from "./WaypointCard";
import type { TimelineItem } from "../models/TimelineItem";
import { DialogDetail } from "./DialogDetail";
import { useViewportSize } from "../lib/useViewportSize";

type WaypointsOverlayProps = {
  routePath: string;
};

const clampToRange = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const WaypointsOverlay = ({ routePath }: WaypointsOverlayProps) => {
  const viewport = useViewportSize();

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [activeEntry, setActiveEntry] = useState<TimelineItem | null>(null);

  const positions = useMemo(() => {
    if (!routePath || !viewport.width || !viewport.height) {
      return []
    }

    gsap.registerPlugin(MotionPathPlugin)

    const rawPath = MotionPathPlugin.getRawPath(routePath)

    // Keep cards within viewport after translate(-50%, -50%).
    const cardWidth = Math.min(352, viewport.width * 0.7)
    const halfCardWidth = cardWidth / 2
    const minX = halfCardWidth + 16
    const maxX = viewport.width - halfCardWidth - 16
    const minY = 72
    const maxY = viewport.height - 92

    return timeline.map((entry) => {
      const point = MotionPathPlugin.getPositionOnPath(
        rawPath,
        entry.routeProgressPercentage,
        true,
      )

      return {
        id: entry.id,
        x: clampToRange(point.x, minX, maxX),
        y: clampToRange(point.y, minY, maxY),
      }
    })
  }, [routePath, viewport.height, viewport.width])

  const positionMap = useMemo(() => {
    return new Map(positions.map((position) => [position.id, position]))
  }, [positions])

  const openDialog = (entry: TimelineItem) => {
    setActiveEntry(entry);
    dialogRef.current?.showModal();
  };

const closeDialog = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    
    // 1. Add the closing animation class
    dialog.classList.add('dialog-closing');
    
    // 2. Wait for animation to finish, then actually close
    dialog.addEventListener('animationend', function handleAnimationEnd() {
      dialog.classList.remove('dialog-closing');
      dialog.close();
      dialog.removeEventListener('animationend', handleAnimationEnd);
    }, { once: true });
  };

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-10"
        aria-hidden="true"
      >
        {timeline.map((entry) => {
          const position = positionMap.get(entry.id);
          if (!position) {
            return null;
          }

          return (
            <div
              key={entry.id}
              className="pointer-events-auto absolute cursor-pointer"
              onClick={() => openDialog(entry)}
            >
              <WaypointCard
                key={entry.id}
                type={entry.type}
                date={entry.date}
                title={entry.title}
                top={`${position.y}px`}
                left={`${position.x}px`}
              />
            </div>
          );
        })}
      </div>

      {/* 1. Added fixed, inset-0, and m-auto for guaranteed centering */}
      {/* 2. Added onClick to check if the backdrop was clicked */}
      <dialog
        ref={dialogRef}
        onClick={(e) => e.target === dialogRef.current && closeDialog()}
        className="fixed inset-0 m-auto w-[90vw] h-[90vh] max-w-6xl rounded-2xl bg-white shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm dialog-animated p-0"
      >
        {/* 3. Wrap inner content in a div with padding so clicks inside don't trigger the close */}
        <div className="h-full w-full p-8 overflow-y-auto relative">
          {activeEntry && (
            <DialogDetail entry={activeEntry} onClose={closeDialog} />
          )}
        </div>
      </dialog>
    </>
  );
};
