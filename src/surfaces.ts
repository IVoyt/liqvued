import type { Surface } from './types'

export const surfaceOptions = [
  'convex',
  'concave',
  'lip',
  'bowl',
  'bevel',
  'saddle',
  'ripple',
  'noise',
  'asymmetric',
] as const satisfies readonly Surface[]
