import { contours } from 'd3-contour'
import { createNoise2D } from 'simplex-noise'
import { useEffect, useRef } from 'react'

type TopoBackgroundProps = {
  routePath: string
}

type TerrainSnapshot = {
  width: number
  height: number
  terrainCanvas: HTMLCanvasElement
}

const drawAuxiliaryRouteLines = (
  context: CanvasRenderingContext2D,
  path: SVGPathElement,
  totalLength: number,
) => {
  const lineConfigs = [
    { offset: -34, alpha: 0.32, width: 1.2, drift: 10 },
    { offset: -20, alpha: 0.24, width: 1, drift: 7 },
    { offset: -10, alpha: 0.2, width: 0.9, drift: 5 },
    { offset: 12, alpha: 0.22, width: 1, drift: 6 },
    { offset: 23, alpha: 0.26, width: 1.1, drift: 8 },
    { offset: 38, alpha: 0.3, width: 1.2, drift: 12 },
  ]

  for (const config of lineConfigs) {
    const steps = Math.max(80, Math.floor(totalLength / 9))
    context.beginPath()

    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps
      const lengthAtT = totalLength * t
      const prev = path.getPointAtLength(Math.max(0, lengthAtT - 0.8))
      const next = path.getPointAtLength(Math.min(totalLength, lengthAtT + 0.8))
      const point = path.getPointAtLength(lengthAtT)

      const dx = next.x - prev.x
      const dy = next.y - prev.y
      const magnitude = Math.hypot(dx, dy) || 1

      const nx = -dy / magnitude
      const ny = dx / magnitude

      // Modulate drift to alternate between parallel segments and branching segments.
      const waveA = Math.sin(t * Math.PI * 2.2)
      const waveB = Math.sin(t * Math.PI * 8.4)
      const drift = (waveA * 0.6 + waveB * 0.4) * config.drift

      const x = point.x + nx * (config.offset + drift)
      const y = point.y + ny * (config.offset + drift)

      if (i === 0) {
        context.moveTo(x, y)
      } else {
        context.lineTo(x, y)
      }
    }

    context.strokeStyle = `rgba(228, 242, 175, ${config.alpha})`
    context.lineWidth = config.width
    context.shadowBlur = 0
    context.stroke()
  }
}

const buildTerrain = (width: number, height: number, dpr: number): TerrainSnapshot => {
  const terrainCanvas = document.createElement('canvas')
  terrainCanvas.width = Math.max(1, Math.floor(width * dpr))
  terrainCanvas.height = Math.max(1, Math.floor(height * dpr))

  const context = terrainCanvas.getContext('2d')
  if (!context) {
    return { width, height, terrainCanvas }
  }

  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  context.clearRect(0, 0, width, height)

  const noise2d = createNoise2D()
  const cell = 12
  const cols = Math.ceil(width / cell) + 1
  const rows = Math.ceil(height / cell) + 1
  const values: number[] = []

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const value = noise2d(x * 0.06, y * 0.06)
      values.push(value)
    }
  }

  const thresholdCount = 16
  const thresholds = Array.from({ length: thresholdCount }, (_, index) => -0.9 + index * 0.12)
  const contourData = contours().size([cols, rows]).thresholds(thresholds)(values)

  context.strokeStyle = 'rgba(132, 171, 196, 0.18)'
  context.lineWidth = 1

  for (const contour of contourData) {
    const polygons = contour.coordinates as number[][][][]
    context.globalAlpha = 0.18 + ((Number(contour.value) + 1) * 0.03)

    for (const polygon of polygons) {
      for (const ring of polygon) {
        if (ring.length < 2) {
          continue
        }

        context.beginPath()
        context.moveTo(ring[0][0] * cell, ring[0][1] * cell)

        for (let i = 1; i < ring.length; i += 1) {
          context.lineTo(ring[i][0] * cell, ring[i][1] * cell)
        }

        context.stroke()
      }
    }
  }

  context.globalAlpha = 1

  return { width, height, terrainCanvas }
}

export const TopoBackground = ({ routePath }: TopoBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const pathElementRef = useRef<SVGPathElement | null>(null)
  const snapshotRef = useRef<TerrainSnapshot | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !routePath) {
      return
    }

    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    pathElement.setAttribute('d', routePath)
    pathElementRef.current = pathElement

    const drawRoute = () => {
      const snapshot = snapshotRef.current
      const path = pathElementRef.current
      if (!snapshot || !path) {
        return
      }

      context.clearRect(0, 0, snapshot.width, snapshot.height)
      context.drawImage(snapshot.terrainCanvas, 0, 0, snapshot.width, snapshot.height)

      const totalLength = path.getTotalLength()
      drawAuxiliaryRouteLines(context, path, totalLength)

      const steps = Math.max(50, Math.floor(totalLength / 8))

      context.beginPath()
      for (let i = 0; i <= steps; i += 1) {
        const sampleLength = totalLength * (i / steps)
        const point = path.getPointAtLength(sampleLength)
        if (i === 0) {
          context.moveTo(point.x, point.y)
        } else {
          context.lineTo(point.x, point.y)
        }
      }

      context.strokeStyle = 'rgba(199, 255, 57, 0.88)'
      context.lineWidth = 5
      context.shadowColor = 'rgba(210, 255, 41, 0.95)'
      context.shadowBlur = 24
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.stroke()

      context.strokeStyle = 'rgba(249, 255, 149, 0.9)'
      context.lineWidth = 1.4
      context.shadowBlur = 0
      context.stroke()

      context.shadowBlur = 0
    }

    const rebuild = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const dpr = window.devicePixelRatio || 1

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      context.setTransform(dpr, 0, 0, dpr, 0, 0)

      snapshotRef.current = buildTerrain(width, height, dpr)
      drawRoute()
    }

    rebuild()
    window.addEventListener('resize', rebuild)

    return () => {
      window.removeEventListener('resize', rebuild)
    }
  }, [routePath])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" aria-hidden="true" />
}
