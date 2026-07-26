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
  // This path now uses 16 anchor points for finer shaping.
  // Ratios may overshoot for stronger curves, but output is clamped to viewport-safe bounds.
  const anchors: Array<[number, number]> = [
    [0.01, 0.04],
    [0.06, 0.14],
    [0.11, 0.3],
    [0.17, 0.52],
    [0.24, 0.75],
    [0.31, 0.92],
    [0.39, 0.82],
    [0.47, 0.64],
    [0.55, 0.5],
    [0.62, 0.58],
    [0.69, 0.43],
    [0.76, 0.28],
    [0.83, 0.17],
    [0.9, 0.22],
    [0.95, 0.12],
    [0.995, 0.03],
  ]

  // First cubic segment requires two control points.
  // Slight overshoot (<0 or >1) is intentional for broader arcs.
  const firstControls: [number, number, number, number] = [-0.01, 0.0, 0.03, 0.07]

  // Remaining controls map to anchors[2]..anchors[15] as smooth S segments.
  const smoothControls: Array<[number, number]> = [
    [0.1, 0.2],
    [0.15, 0.4],
    [0.21, 0.63],
    [0.28, 0.88],
    [0.35, 1.04],
    [0.43, 0.9],
    [0.51, 0.67],
    [0.59, 0.45],
    [0.66, 0.63],
    [0.73, 0.38],
    [0.8, 0.2],
    [0.87, 0.1],
    [0.93, 0.29],
    [1.04, -0.03],
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
