import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { useEffect, useMemo, useState } from 'react'
import { timeline } from '../data/timeline'

type WaypointsOverlayProps = {
  routePath: string
}

type WaypointPosition = {
  id: string
  x: number
  y: number
}

export const WaypointsOverlay = ({ routePath }: WaypointsOverlayProps) => {
  const [positions, setPositions] = useState<WaypointPosition[]>([])

  useEffect(() => {
    if (!routePath) {
      setPositions([])
      return
    }

    gsap.registerPlugin(MotionPathPlugin)

    const computePositions = () => {
      const rawPath = MotionPathPlugin.getRawPath(routePath)
      const nextPositions = timeline.map((entry) => {
        const point = MotionPathPlugin.getPositionOnPath(
          rawPath,
          entry.routeProgressPercentage,
          true,
        )

        return {
          id: entry.id,
          x: point.x,
          y: point.y,
        }
      })

      setPositions(nextPositions)
    }

    computePositions()
    window.addEventListener('resize', computePositions)

    return () => {
      window.removeEventListener('resize', computePositions)
    }
  }, [routePath])

  const positionMap = useMemo(() => {
    return new Map(positions.map((position) => [position.id, position]))
  }, [positions])

  return (
    <div className="pointer-events-none fixed inset-0 z-10" aria-hidden="true">
      {timeline.map((entry) => {
        const position = positionMap.get(entry.id)
        if (!position) {
          return null
        }

        return (
          <article
            key={entry.id}
            className="pointer-events-auto absolute w-[min(22rem,70vw)] -translate-x-1/2 -translate-y-1/2 rounded-md border border-cyan-300/45 bg-slate-950/78 p-4 text-left shadow-[0_0_22px_rgba(34,211,238,0.25)] backdrop-blur-sm"
            style={{ left: `${position.x}px`, top: `${position.y}px` }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-200/90">
              {entry.date}
            </p>
            <h2 className="mt-2 text-base font-semibold leading-tight text-slate-100 md:text-lg">
              {entry.title}
            </h2>
            <p className="mt-2 font-mono text-xs leading-relaxed text-slate-300/85 md:text-[13px]">
              {entry.description}
            </p>
          </article>
        )
      })}
    </div>
  )
}
