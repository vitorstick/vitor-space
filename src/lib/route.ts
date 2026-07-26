const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export const createRoutePath = (width: number, height: number) => {
  // All points are proportional to viewport size:
  // x = width * ratio, y = height * ratio.
  // y grows downward, so smaller y means higher on screen.

  // Start near lower-left.
  const x0 = width * 0.001
  const y0 = height * 0.99

  // Segment 1 (C): initial climb.
  // c1/c2 are the Bezier control points, x1/y1 is the segment end.
  const c1x = width * 0.16
  const c1y = height * 0.84
  const c2x = width * 0.07
  const c2y = height * 0.69
  const x1 = width * 0.16
  const y1 = height * 0.51

  // Segment 2 (S): smooth continuation that dips toward lower-middle.
  // S reuses the previous tangent; only one new control point is provided.
  const c3x = width * 0.42
  const c3y = height * 0.78
  const x2 = width * 0.4
  const y2 = height * 0.32

  // Segment 3 (S): turn upward into mid-right.
  const c4x = width * 0.64
  const c4y = height * 0.28
  const x3 = width * 0.54
  const y3 = height * 0.37

  // Segment 4 (S): broad swing to the right with a gentle rise.
  const c5x = width * 0.8
  const c5y = height * 0.58
  const x4 = width * 0.72
  const y4 = height * 0.26

  // Segment 5 (S): push toward upper-right.
  const c6x = width * 0.96
  const c6y = height * 0.04
  const x5 = width * 0.86
  const y5 = height * 0.13

  // Segment 6 (S): final taper ending near top-right edge.
  const c7x = width * 1.04
  const c7y = height * 0.22
  const x6 = width * 0.98
  const y6 = height * 0.05

  // Path command order:
  // M = move to start, C = cubic Bezier, S = smooth cubic Bezier.
  return [
    `M ${x0} ${y0}`,
    `C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x1} ${y1}`,
    `S ${c3x} ${c3y}, ${x2} ${y2}`,
    `S ${c4x} ${c4y}, ${x3} ${y3}`,
    `S ${c5x} ${c5y}, ${x4} ${y4}`,
    `S ${c6x} ${c6y}, ${x5} ${y5}`,
    `S ${c7x} ${c7y}, ${x6} ${y6}`,
  ].join(' ')
}

export const clampProgress = (progress: number) => clamp(progress, 0, 1)
