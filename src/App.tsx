import { useEffect, useMemo, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { HeaderHUD } from './components/HeaderHUD'
import { TopoBackground } from './components/TopoBackground'
import { WaypointsOverlay } from './components/WaypointsOverlay'
import { timeline } from './data/timeline'
import { createRoutePath } from './lib/route'
import { useViewportSize } from './lib/useViewportSize'
import type { TimelineType } from './models/TimelineItem'

gsap.registerPlugin(ScrollTrigger)

function App() {
  const viewport = useViewportSize()
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeFilter, setActiveFilter] = useState<'all' | TimelineType>('all')

  useEffect(() => {
    // Native scroll calculation fallback and initial alignment
    const updateScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight
      if (totalScroll > 0) {
        const progress = Math.min(1, Math.max(0, window.scrollY / totalScroll))
        setScrollProgress(progress)
      }
    }

    // Initialize GSAP ScrollTrigger scrub
    const trigger = ScrollTrigger.create({
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.1,
      onUpdate: (self) => {
        setScrollProgress(self.progress)
      },
    })

    window.addEventListener('scroll', updateScroll, { passive: true })
    requestAnimationFrame(updateScroll)

    return () => {
      trigger.kill()
      window.removeEventListener('scroll', updateScroll)
    }
  }, [])

  const routePath = useMemo(() => {
    if (!viewport.width || !viewport.height) {
      return ''
    }

    return createRoutePath(viewport.width, viewport.height)
  }, [viewport.height, viewport.width])

  const filteredTimeline = useMemo(() => {
    if (activeFilter === 'all') return timeline
    return timeline.filter((item) => item.type === activeFilter)
  }, [activeFilter])

  const reachedItemsCount = useMemo(() => {
    return filteredTimeline.filter((item) => scrollProgress >= item.routeProgressPercentage).length
  }, [filteredTimeline, scrollProgress])

  return (
    <main className="relative min-h-[400vh] text-slate-100">
      <HeaderHUD
        scrollProgress={scrollProgress}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        totalItems={filteredTimeline.length}
        reachedItems={reachedItemsCount}
      />
      {routePath ? <TopoBackground routePath={routePath} scrollProgress={scrollProgress} /> : null}
      {routePath ? (
        <WaypointsOverlay
          routePath={routePath}
          scrollProgress={scrollProgress}
          activeFilter={activeFilter}
        />
      ) : null}
    </main>
  )
}

export default App
