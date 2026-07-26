const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export const createRoutePath = (width: number, height: number) => {
  const horizontalPadding = Math.max(24, width * 0.015)
  const topPadding = Math.max(20, height * 0.03)
  const bottomPadding = Math.max(72, height * 0.11)

  const minX = horizontalPadding
  const maxX = width - horizontalPadding
  const minY = topPadding
  const maxY = height - bottomPadding

  const toX = (ratio: number) => clamp(ratio * width, minX, maxX)
  const toY = (ratio: number) => clamp(ratio * height, minY, maxY)

  // All values are normalized viewport ratios.
  // x = width * ratio, y = height * ratio (y grows downward).
  // This path now uses 16 anchor points evenly distributed for accurate positioning.
  // Ratios may overshoot for stronger curves, but output is clamped to viewport-safe bounds.
  const anchors: Array<[number, number]> = [
    [0.02, 0.05],
    [0.08, 0.15],
    [0.14, 0.25],
    [0.20, 0.40],
    [0.26, 0.60],
    [0.32, 0.80],
    [0.38, 0.85],
    [0.44, 0.70],
    [0.50, 0.55],
    [0.56, 0.65],
    [0.62, 0.50],
    [0.68, 0.35],
    [0.74, 0.22],
    [0.80, 0.15],
    [0.90, 0.10],
    [0.98, 0.04],
  ]

  // First cubic segment requires two control points.
  // Slight overshoot (<0 or >1) is intentional for broader arcs.
  const firstControls: [number, number, number, number] = [0.0, 0.0, 0.05, 0.10]

  // Remaining controls map to anchors[2]..anchors[15] as smooth S segments.
  const smoothControls: Array<[number, number]> = [
    [0.12, 0.20],
    [0.18, 0.32],
    [0.24, 0.50],
    [0.30, 0.70],
    [0.35, 0.88],
    [0.41, 0.78],
    [0.47, 0.62],
    [0.53, 0.60],
    [0.59, 0.58],
    [0.65, 0.42],
    [0.71, 0.28],
    [0.77, 0.18],
    [0.85, 0.12],
    [0.94, 0.07],
  ]

  const points = anchors.map(([x, y]) => [toX(x), toY(y)] as const)
  const [x0, y0] = points[0]
  const [x1, y1] = points[1]
  const [c1x, c1y, c2x, c2y] = firstControls

  const commands = [
    `M ${x0} ${y0}`,
    `C ${toX(c1x)} ${toY(c1y)}, ${toX(c2x)} ${toY(c2y)}, ${x1} ${y1}`,
  ]

  for (let i = 2; i < points.length; i++) {
    const [cx, cy] = smoothControls[i - 2]
    const [x, y] = points[i]
    commands.push(`S ${toX(cx)} ${toY(cy)}, ${x} ${y}`)
  }

  return commands.join(' ')
}

export const clampProgress = (progress: number) => clamp(progress, 0, 1)
