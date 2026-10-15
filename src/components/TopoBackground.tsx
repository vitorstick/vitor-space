import { contours } from 'd3-contour'
import { createNoise2D } from 'simplex-noise'
import { useCallback, useEffect, useRef } from 'react'
import { getScrollProgress, subscribeScrollProgress } from '../lib/scrollProgress'

type TopoBackgroundProps = {
  routePath: string
}

type TerrainSnapshot = {
  width: number
  height: number
  dpr: number
  terrainCanvas: HTMLCanvasElement
}

type RouteGeometry = {
  path2d: Path2D
  pathElement: SVGPathElement
  totalLength: number
}

// Created once so the terrain keeps the same shape across resizes
// (e.g. mobile URL bar show/hide) instead of re-randomizing every rebuild.
const noise2D = createNoise2D()

// Glow is emulated with wide translucent strokes instead of `shadowBlur`,
// which is very expensive to rasterize on long paths every frame.
const ACTIVE_LINE_LAYERS = [
  { strokeStyle: 'rgba(202, 250, 92, 0.07)', lineWidth: 28 },
  { strokeStyle: 'rgba(202, 250, 92, 0.18)', lineWidth: 16 },
  { strokeStyle: 'rgba(202, 250, 92, 0.45)', lineWidth: 7 },
  { strokeStyle: '#caef5c', lineWidth: 2.5 },
  { strokeStyle: '#ffffff', lineWidth: 1.2 },
]

const drawAuxiliaryRouteLines = (
  context: CanvasRenderingContext2D,
  path2d: Path2D
) => {
  context.save()
  context.strokeStyle = 'rgba(140, 165, 120, 0.22)'
  context.lineWidth = 1.5
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.setLineDash([4, 6])
  context.stroke(path2d)
  context.restore()
}

const drawActiveRouteLine = (
  context: CanvasRenderingContext2D,
  route: RouteGeometry,
  progress: number
) => {
  if (progress <= 0) return

  // Draw only the traveled portion using a single dash: O(1) JS work per frame
  // instead of sampling getPointAtLength() along the whole traveled length.
  const activeLength = route.totalLength * progress

  context.save()
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.setLineDash([activeLength, route.totalLength + 1])

  for (const layer of ACTIVE_LINE_LAYERS) {
    context.strokeStyle = layer.strokeStyle
    context.lineWidth = layer.lineWidth
    context.stroke(route.path2d)
  }

  context.restore()
}

const drawScrollBullet = (
  context: CanvasRenderingContext2D,
  route: RouteGeometry,
  progress: number
) => {
  const point = route.pathElement.getPointAtLength(progress * route.totalLength)

  if (!point) return

  const bulletRadius = 6

  // Outer glow
  context.save()
  context.fillStyle = 'rgba(202, 250, 92, 0.3)'
  context.beginPath()
  context.arc(point.x, point.y, bulletRadius * 2.5, 0, Math.PI * 2)
  context.fill()
  context.restore()

  // Middle glow
  context.save()
  context.fillStyle = 'rgba(202, 250, 92, 0.5)'
  context.beginPath()
  context.arc(point.x, point.y, bulletRadius * 1.5, 0, Math.PI * 2)
  context.fill()
  context.restore()

  // Core bullet
  context.save()
  context.fillStyle = '#caef5c'
  context.beginPath()
  context.arc(point.x, point.y, bulletRadius, 0, Math.PI * 2)
  context.fill()

  // Inner highlight
  context.fillStyle = '#ffffff'
  context.beginPath()
  context.arc(point.x - bulletRadius * 0.3, point.y - bulletRadius * 0.3, bulletRadius * 0.4, 0, Math.PI * 2)
  context.fill()
  context.restore()
}

const buildTerrain = (
  width: number,
  height: number,
  dpr: number,
  route: RouteGeometry
): TerrainSnapshot => {
  // Rendered at device resolution so it can be blitted 1:1 (crisp + cheap).
  const terrainCanvas = document.createElement('canvas')
  terrainCanvas.width = Math.floor(width * dpr)
  terrainCanvas.height = Math.floor(height * dpr)
  const context = terrainCanvas.getContext('2d')

  if (!context) return { width, height, dpr, terrainCanvas }

  context.setTransform(dpr, 0, 0, dpr, 0, 0)

  // Dark topographic base background
  context.fillStyle = '#121510'
  context.fillRect(0, 0, width, height)

  // 1. Generate Simplex Noise Grid
  const resolution = 12 // Grid step size
  const cols = Math.ceil(width / resolution) + 1
  const rows = Math.ceil(height / resolution) + 1
  const values = new Float64Array(cols * rows)

  const noiseScale = 0.0025
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const worldX = x * resolution
      const worldY = y * resolution

      // Multi-octave noise for varied terrain heights
      const n1 = noise2D(worldX * noiseScale, worldY * noiseScale)
      const n2 = noise2D(worldX * noiseScale * 2, worldY * noiseScale * 2) * 0.5
      const n3 = noise2D(worldX * noiseScale * 4, worldY * noiseScale * 4) * 0.25

      values[y * cols + x] = (n1 + n2 + n3 + 1.75) / 3.5 // Normalize to ~[0, 1]
    }
  }

  // 2. Generate Contour Paths via d3-contour
  const contourGenerator = contours()
    .size([cols, rows])
    .thresholds(22)

  const contourData = contourGenerator(Array.from(values))

  // 3. Render Topography Lines
  context.save()
  context.lineWidth = 1.2

  contourData.forEach((contour, idx) => {
    // Subtle opacity variation based on elevation height
    const alpha = 0.05 + (idx / contourData.length) * 0.16
    context.strokeStyle = `rgba(140, 165, 120, ${alpha})`

    context.beginPath()
    contour.coordinates.forEach((polygon) => {
      polygon.forEach((ring) => {
        ring.forEach(([x, y], i) => {
          const px = x * resolution
          const py = y * resolution
          if (i === 0) context.moveTo(px, py)
          else context.lineTo(px, py)
        })
      })
    })
    context.stroke()
  })

  context.restore()

  // 4. The dashed auxiliary route never changes with scroll, so bake it in.
  drawAuxiliaryRouteLines(context, route.path2d)

  return { width, height, dpr, terrainCanvas }
}

export const TopoBackground = ({ routePath }: TopoBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const routeRef = useRef<RouteGeometry | null>(null)
  const snapshotRef = useRef<TerrainSnapshot | null>(null)

  const drawRoute = useCallback(() => {
    const canvas = canvasRef.current
    const snapshot = snapshotRef.current
    const route = routeRef.current
    if (!canvas || !snapshot || !route) return

    const context = canvas.getContext('2d', { alpha: false })
    if (!context) return

    const progress = getScrollProgress()

    // Blit cached terrain (+ auxiliary route) at device resolution.
    // It's fully opaque, so no clearRect is needed.
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.drawImage(snapshot.terrainCanvas, 0, 0)

    context.setTransform(snapshot.dpr, 0, 0, snapshot.dpr, 0, 0)
    drawActiveRouteLine(context, route, progress)
    drawScrollBullet(context, route, progress)
  }, [])

  // Build / rebuild route geometry + terrain snapshot when routePath changes.
  // routePath is derived from the viewport size, so this also covers resizes.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !routePath) return

    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    pathElement.setAttribute('d', routePath)
    const route: RouteGeometry = {
      path2d: new Path2D(routePath),
      pathElement,
      totalLength: pathElement.getTotalLength(),
    }
    routeRef.current = route

    const width = window.innerWidth
    const height = window.innerHeight
    const dpr = window.devicePixelRatio || 1

    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    snapshotRef.current = buildTerrain(width, height, dpr, route)
    drawRoute()
  }, [routePath, drawRoute])

  // Redraw path & bullet on scroll without going through React renders.
  useEffect(() => subscribeScrollProgress(drawRoute), [drawRoute])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" aria-hidden="true" />
}