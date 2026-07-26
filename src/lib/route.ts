const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export const createRoutePath = (width: number, height: number) => {
  const x0 = width * 0.045
  const y0 = height * 0.95

  const c1x = width * 0.16
  const c1y = height * 0.84
  const c2x = width * 0.07
  const c2y = height * 0.69
  const x1 = width * 0.26
  const y1 = height * 0.61

  const c3x = width * 0.42
  const c3y = height * 0.78
  const x2 = width * 0.4
  const y2 = height * 0.52

  const c4x = width * 0.64
  const c4y = height * 0.28
  const x3 = width * 0.54
  const y3 = height * 0.37

  const c5x = width * 0.8
  const c5y = height * 0.58
  const x4 = width * 0.72
  const y4 = height * 0.26

  const c6x = width * 0.96
  const c6y = height * 0.04
  const x5 = width * 0.86
  const y5 = height * 0.13

  const c7x = width * 1.04
  const c7y = height * 0.22
  const x6 = width * 0.98
  const y6 = height * 0.05

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
