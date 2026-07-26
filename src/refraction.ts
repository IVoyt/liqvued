import type { RefractionMode } from './types'

export const refractionModeOptions = [
  'edge',
  'center',
  'split',
] as const satisfies readonly RefractionMode[]

interface Vector {
  x: number
  y: number
}

export function refractionDirection(
  mode: RefractionMode,
  normal: Vector,
  _x: number,
  _y: number,
  _width: number,
  _height: number,
  t: number,
): Vector {
  if (mode === 'center') {
    return normal
  }

  const edge = {
    x: -normal.x,
    y: -normal.y,
  }

  if (mode === 'split') {
    const side = t < 0.5 ? -1 : 1

    return {
      x: edge.x * side,
      y: edge.y * side,
    }
  }

  return edge
}

export function refractionModeStrength(mode: RefractionMode, t: number): number {
  if (mode !== 'split') {
    return 1
  }

  return Math.min(1, Math.abs(t - 0.5) * 2)
}
