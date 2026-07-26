import { useEffect, useMemo, useState } from 'react'
import { TopoBackground } from './components/TopoBackground'
import { WaypointsOverlay } from './components/WaypointsOverlay'
import { createRoutePath } from './lib/route'
import { useViewportSize } from './lib/useViewportSize'


function App() {
  const viewport = useViewportSize()
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const wheelSensitivity = 0.00005

    const handleWheel = (event: WheelEvent) => {
      setScrollProgress((previous) => {
        const next = previous + event.deltaY * wheelSensitivity
        return Math.min(1, Math.max(0, next))
      })
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [])

  const routePath = useMemo(() => {
    if (!viewport.width || !viewport.height) {
      return ''
    }

    return createRoutePath(viewport.width, viewport.height)
  }, [viewport.height, viewport.width])

  return (
    <main className="relative min-h-screen overflow-x-clip text-slate-100">
      {routePath ? <TopoBackground routePath={routePath} scrollProgress={scrollProgress} /> : null}
      {routePath ? <WaypointsOverlay routePath={routePath} /> : null}

      {/* <section className="pointer-events-none absolute inset-x-0 top-0 z-20 px-6 pt-7 md:pt-10">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-lime-200/80 md:text-xs">
            Index / Projects / Journey
          </p>
          <h1 className="mt-3 max-w-2xl text-balance text-2xl font-semibold leading-[1.1] text-lime-50 md:text-5xl">
            A Topographical Map of Product Milestones
          </h1>
          <p className="mt-3 max-w-xl text-pretty font-mono text-xs text-slate-200/85 md:text-sm">
            The complete route is rendered at load. Waypoints are pinned to exact
            path coordinates to form a technical journey map.
          </p>
        </div>
      </section> */}
    </main>
  )
}

export default App
