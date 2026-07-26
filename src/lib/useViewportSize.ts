import { useSyncExternalStore } from 'react'

type ViewportSize = {
  width: number
  height: number
}

let viewportSnapshot: ViewportSize = {
  width: typeof window !== 'undefined' ? window.innerWidth : 0,
  height: typeof window !== 'undefined' ? window.innerHeight : 0,
}

const listeners = new Set<() => void>()

const notifyListeners = () => {
  for (const listener of listeners) {
    listener()
  }
}

const handleResize = () => {
  viewportSnapshot = {
    width: window.innerWidth,
    height: window.innerHeight,
  }
  notifyListeners()
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)

  if (listeners.size === 1) {
    window.addEventListener('resize', handleResize)
  }

  return () => {
    listeners.delete(listener)

    if (listeners.size === 0) {
      window.removeEventListener('resize', handleResize)
    }
  }
}

const getSnapshot = () => viewportSnapshot

const getServerSnapshot = () => ({ width: 0, height: 0 })

export const useViewportSize = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)