const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export const createRoutePath = (width: number, height: number) => {
  const x0 = width * 0.12
  const y0 = height * 0.88

  const c1x = width * 0.34
  const c1y = height * 0.68
  const c2x = width * 0.08
  const c2y = height * 0.52
  const x1 = width * 0.38
  const y1 = height * 0.48

  const c3x = width * 0.82
  const c3y = height * 0.42
  const c4x = width * 0.24
  const c4y = height * 0.24
  const x2 = width * 0.58
  const y2 = height * 0.2

  const c5x = width * 0.94
  const c5y = height * 0.12
  const c6x = width * 0.7
  const c6y = height * 0.06
  const x3 = width * 0.84
  const y3 = height * 0.08

  return [
    `M ${x0} ${y0}`,
    `C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x1} ${y1}`,
    `C ${c3x} ${c3y}, ${c4x} ${c4y}, ${x2} ${y2}`,
    `C ${c5x} ${c5y}, ${c6x} ${c6y}, ${x3} ${y3}`,
  ].join(' ')
}

export const clampProgress = (progress: number) => clamp(progress, 0, 1)
