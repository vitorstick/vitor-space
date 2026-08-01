import { useEffect, useMemo, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TopoBackground } from './components/TopoBackground'
import { WaypointsOverlay } from './components/WaypointsOverlay'
import { createRoutePath } from './lib/route'
import { useViewportSize } from './lib/useViewportSize'

gsap.registerPlugin(ScrollTrigger)

function App() {
  const viewport = useViewportSize()
  const [scrollProgress, setScrollProgress] = useState(0)

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

  return (
    <main className="relative min-h-[400vh] text-slate-100">
      {routePath ? <TopoBackground routePath={routePath} scrollProgress={scrollProgress} /> : null}
      {routePath ? <WaypointsOverlay routePath={routePath} scrollProgress={scrollProgress} /> : null}
    </main>
  )
}

export default App
