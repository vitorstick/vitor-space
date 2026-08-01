const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export const createRoutePath = (width: number, height: number) => {
  const horizontalPadding = Math.max(120, width * 0.08)
  const topPadding = Math.max(130, height * 0.14)
  const bottomPadding = Math.max(90, height * 0.12)

  const minX = horizontalPadding
  const maxX = width - horizontalPadding
  const minY = topPadding
  const maxY = height - bottomPadding

  const toX = (ratio: number) => minX + ratio * (maxX - minX)
  const toY = (ratio: number) => minY + ratio * (maxY - minY)

  // All values are normalized viewport ratios.
  // x = width * ratio, y = height * ratio (y grows downward).
  // 16 anchors correspond 1-to-1 with timeline items (routeProgressPercentage → x).
  // Mountain-road profile: multiple sharp peaks and valleys across the career arc.
  const anchors: Array<[number, number]> = [
    [0.01, 0.48],  // mealhada-00  — start, mid-left
    [0.067, 0.72], // coimbra-01   — dropping
    [0.133, 0.82], // porto-02     — LOW POINT (location)
    [0.20, 0.38],  // wecreateyou-03 — sharp climb
    [0.267, 0.22], // lisboa-04    — location, mini peak
    [0.333, 0.65], // global-media-group-05 — sharp descent
    [0.40, 0.74],  // anf-06       — valley
    [0.467, 0.30], // bnp-paribas-07 — sharp climb
    [0.533, 0.18], // hovione-08   — secondary peak
    [0.60, 0.45],  // rydoo-09     — descent
    [0.667, 0.22], // pagerduty-10 — rising to main peak
    [0.733, 0.08], // berlin-11    — HIGH PEAK (location)
    [0.80, 0.30],  // bigenius-12  — descent
    [0.867, 0.78], // amsterdam-13 — LOW VALLEY (location)
    [0.90, 0.55],  // dialog-14    — recovery
    [0.98, 0.40],  // semmiewealth-15
  ]

  // First cubic segment requires two control points.
  const firstControls: [number, number, number, number] = [0.01, 0.48, 0.04, 0.66]

  // Remaining controls map to anchors[2]..anchors[15] as smooth S segments.
  // Second control point steers each bezier into its target anchor.
  const smoothControls: Array<[number, number]> = [
    [0.10, 0.86],  // into porto-02        — pull to valley
    [0.175, 0.32], // into wecreateyou     — sharp climb
    [0.248, 0.20], // into lisboa-04       — mini peak
    [0.31, 0.68],  // into global-media    — sharp drop
    [0.385, 0.76], // into anf-06          — deepen valley
    [0.448, 0.28], // into bnp-paribas     — sharp climb
    [0.515, 0.14], // into hovione         — secondary peak
    [0.575, 0.48], // into rydoo           — descent
    [0.645, 0.18], // into pagerduty       — rising
    [0.715, 0.06], // into berlin-11       — HIGH PEAK
    [0.775, 0.24], // into bigenius        — leaving peak
    [0.848, 0.82], // into amsterdam-13    — deep valley
    [0.888, 0.52], // into dialog-14       — recovery
    [0.955, 0.40], // into semmiewealth
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
