import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { contours } from 'd3-contour'
import { createNoise2D } from 'simplex-noise'
import { useEffect, useRef } from 'react'

type TopoBackgroundProps = {
  routePath: string
  scrollProgress: number
}

type TerrainSnapshot = {
  width: number
  height: number
  terrainCanvas: HTMLCanvasElement
}

const drawAuxiliaryRouteLines = (
  context: CanvasRenderingContext2D,
  path: SVGPathElement
) => {
  const pathD = path.getAttribute('d')
  if (!pathD) return

  const path2d = new Path2D(pathD)

  // Layered glowing lines to achieve the neon effect
  const lineConfigs = [
    { strokeStyle: 'rgba(202, 250, 92, 0.12)', lineWidth: 24, blur: 20 },
    { strokeStyle: 'rgba(202, 250, 92, 0.35)', lineWidth: 10, blur: 10 },
    { strokeStyle: '#d9f99d', lineWidth: 4, blur: 4 },
    { strokeStyle: '#ffffff', lineWidth: 1.5, blur: 0 }
  ]

  for (const config of lineConfigs) {
    context.save()
    context.strokeStyle = config.strokeStyle
    context.lineWidth = config.lineWidth
    context.lineCap = 'round'
    context.lineJoin = 'round'

    if (config.blur > 0) {
      context.shadowColor = '#caef5c'
      context.shadowBlur = config.blur
    }

    context.stroke(path2d)
    context.restore()
  }
}

const drawScrollBullet = (
  context: CanvasRenderingContext2D,
  path: SVGPathElement,
  progress: number
) => {
  const pathD = path.getAttribute('d')
  if (!pathD) return

  const rawPath = MotionPathPlugin.getRawPath(pathD)
  const point = MotionPathPlugin.getPositionOnPath(rawPath, progress, true)

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

const buildTerrain = (width: number, height: number): TerrainSnapshot => {
  const terrainCanvas = document.createElement('canvas')
  terrainCanvas.width = width
  terrainCanvas.height = height
  const context = terrainCanvas.getContext('2d')

  if (!context) return { width, height, terrainCanvas }

  // Dark topographic base background
  context.fillStyle = '#121510'
  context.fillRect(0, 0, width, height)

  // 1. Generate Simplex Noise Grid
  const resolution = 12 // Grid step size
  const cols = Math.ceil(width / resolution) + 1
  const rows = Math.ceil(height / resolution) + 1
  const values = new Float64Array(cols * rows)
  const noise2D = createNoise2D()

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

  return { width, height, terrainCanvas }
}

export const TopoBackground = ({ routePath, scrollProgress }: TopoBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const pathElementRef = useRef<SVGPathElement | null>(null)
  const snapshotRef = useRef<TerrainSnapshot | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !routePath) return

    const context = canvas.getContext('2d')
    if (!context) return

    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    pathElement.setAttribute('d', routePath)
    pathElementRef.current = pathElement

    const drawRoute = () => {
      if (!snapshotRef.current || !pathElementRef.current) return

      // Clear main canvas & draw cached terrain layer
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.drawImage(snapshotRef.current.terrainCanvas, 0, 0)

      // Scale route to match fixed canvas size (1380x660)
      const scaleX = window.innerWidth / 1380
      const scaleY = window.innerHeight / 660

      context.save()
      context.scale(scaleX, scaleY)
      drawAuxiliaryRouteLines(context, pathElementRef.current)
      drawScrollBullet(context, pathElementRef.current, scrollProgress)
      context.restore()
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

      snapshotRef.current = buildTerrain(width, height)
      drawRoute()
    }

    rebuild()
    window.addEventListener('resize', rebuild)

    return () => {
      window.removeEventListener('resize', rebuild)
    }
  }, [routePath, scrollProgress])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" aria-hidden="true" />
}