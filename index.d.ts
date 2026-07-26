import type { Component } from 'vue'

export type Surface =
  | 'convex'
  | 'concave'
  | 'lip'
  | 'bowl'
  | 'bevel'
  | 'saddle'
  | 'ripple'
  | 'noise'
  | 'asymmetric'

export type RefractionMode = 'edge' | 'center' | 'split'

export interface LiqvuedProps {
  as?: string | Component
  asProps?: Record<string, unknown>
  radius?: number
  borderRadius?: string
  bezel?: number
  thickness?: number
  refraction?: number
  refractionMode?: RefractionMode
  magnification?: number
  magnificationFocus?: number
  blur?: number
  surface?: Surface
  specularOpacity?: number
  glareAngle?: number | false
  glassBackground?: string
  fallbackOnly?: boolean
}

export declare const Liqvued: new() => {
  $props: LiqvuedProps
}

declare const _default: {
  install(app: unknown): void
}

export default _default