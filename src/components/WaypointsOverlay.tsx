import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { useEffect, useMemo, useState } from 'react'
import { timeline } from '../data/timeline'
import { WaypointCard } from './WaypointCard'

type WaypointsOverlayProps = {
  routePath: string
}

type WaypointPosition = {
  id: string
  x: number
  y: number
}

const clampToRange = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

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

      // Keep cards within viewport after translate(-50%, -50%).
      const cardWidth = Math.min(352, window.innerWidth * 0.7)
      const halfCardWidth = cardWidth / 2
      const minX = halfCardWidth + 16
      const maxX = window.innerWidth - halfCardWidth - 16
      const minY = 72
      const maxY = window.innerHeight - 92

      const nextPositions = timeline.map((entry) => {
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
          <WaypointCard 
            key={entry.id}
            type={entry.type}
            date={entry.date}
            title={entry.title}
            top={`${position.y}px`}
            left={`${position.x}px`}
          />
        )
      })}
    </div>
  )
}
