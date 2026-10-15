import { useSyncExternalStore } from 'react'

/**
 * Lightweight, rAF-throttled scroll progress store.
 *
 * Keeping the raw (continuous) progress value outside React avoids re-rendering
 * the whole tree on every scroll frame. Canvas drawing subscribes imperatively,
 * while React components subscribe through `useScrollProgress(selector)` and only
 * re-render when their *derived* value changes (e.g. a waypoint becomes reached).
 */

let progress = 0
let frame = 0
const listeners = new Set<() => void>()

const compute = () => {
  frame = 0
  const totalScroll = document.documentElement.scrollHeight - window.innerHeight
  const next = totalScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / totalScroll)) : 0
  if (next === progress) return
  progress = next
  for (const listener of listeners) {
    listener()
  }
}

const schedule = () => {
  if (!frame) {
    frame = requestAnimationFrame(compute)
  }
}

export const subscribeScrollProgress = (listener: () => void) => {
  listeners.add(listener)

  if (listeners.size === 1) {
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    schedule()
  }

  return () => {
    listeners.delete(listener)

    if (listeners.size === 0) {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) {
        cancelAnimationFrame(frame)
        frame = 0
      }
    }
  }
}

export const getScrollProgress = () => progress

/** Re-measure progress on the next frame (e.g. after the page height changes). */
export const refreshScrollProgress = schedule

/**
 * Subscribe to a derived value of the scroll progress.
 * The selector MUST return a primitive (or otherwise stable) value so the
 * component only re-renders when that value actually changes.
 */
export const useScrollProgress = <T,>(selector: (progress: number) => T): T =>
  useSyncExternalStore(
    subscribeScrollProgress,
    () => selector(progress),
    () => selector(0)
  )
