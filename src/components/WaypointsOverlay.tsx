import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useEffect, useMemo, useRef, useState } from "react";
import { timeline } from "../data/timeline";
import { WaypointCard } from "./WaypointCard";
import type { TimelineItem } from "../models/TimelineItem";

type WaypointsOverlayProps = {
  routePath: string;
};

type WaypointPosition = {
  id: string;
  x: number;
  y: number;
};

const clampToRange = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const WaypointsOverlay = ({ routePath }: WaypointsOverlayProps) => {
  const [positions, setPositions] = useState<WaypointPosition[]>([]);

  const dialogRef = useRef(null);
  const [activeEntry, setActiveEntry] = useState<TimelineItem | null>(null);

  useEffect(() => {
    if (!routePath) {
      setPositions([]);
      return;
    }

    gsap.registerPlugin(MotionPathPlugin);

    const computePositions = () => {
      const rawPath = MotionPathPlugin.getRawPath(routePath);

      // Keep cards within viewport after translate(-50%, -50%).
      const cardWidth = Math.min(352, window.innerWidth * 0.7);
      const halfCardWidth = cardWidth / 2;
      const minX = halfCardWidth + 16;
      const maxX = window.innerWidth - halfCardWidth - 16;
      const minY = 72;
      const maxY = window.innerHeight - 92;

      const nextPositions = timeline.map((entry) => {
        const point = MotionPathPlugin.getPositionOnPath(
          rawPath,
          entry.routeProgressPercentage,
          true,
        );

        return {
          id: entry.id,
          x: clampToRange(point.x, minX, maxX),
          y: clampToRange(point.y, minY, maxY),
        };
      });

      setPositions(nextPositions);
    };

    computePositions();
    window.addEventListener("resize", computePositions);

    return () => {
      window.removeEventListener("resize", computePositions);
    };
  }, [routePath]);

  const positionMap = useMemo(() => {
    return new Map(positions.map((position) => [position.id, position]));
  }, [positions]);

  const openDialog = (entry: TimelineItem) => {
    setActiveEntry(entry);
    dialogRef.current?.showModal();
  };

  const closeDialog = () => {
    dialogRef.current?.close();
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
          <button className="absolute top-4 right-4" onClick={closeDialog}>
            Close
          </button>

          {activeEntry && (
            <div>
              <h2>{activeEntry.title}</h2>
              <p>Date: {activeEntry.date}</p>
              <p>Type: {activeEntry.type}</p>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
};
