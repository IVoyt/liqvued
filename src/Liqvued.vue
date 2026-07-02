<script setup lang="ts">
import {
  type Component,
  computed,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  watch,
} from 'vue'
import { distanceToRoundedRectEdge, normalFromRoundedRect } from './shape'
import type { Surface } from './types'

const props = withDefaults(defineProps<{
  as?: string | Component
  asProps?: object
  radius?: number
  borderRadius?: string
  bezel?: number
  thickness?: number
  refraction?: number
  magnification?: number
  magnificationFocus?: number
  blur?: number
  surface?: Surface
  specularOpacity?: number
  glareAngle?: number
  glassBackground?: string
  fallbackOnly?: boolean
}>(), {
  as: 'div',
  asProps: () => ({}),
  fallbackOnly: false,
  radius: 32,
  bezel: 22,
  thickness: 42,
  refraction: 1,
  magnification: 0,
  magnificationFocus: 0.82,
  blur: 0.4,
  surface: 'convex',
  specularOpacity: 0.45,
  glareAngle: -60,
  glassBackground: undefined,
})

const root = ref<HTMLElement | null>(null)

const width = ref(1)
const height = ref(1)
const mapUrl = ref('')
const specularUrl = ref('')
const scale = ref(1)
const supportsLiquidGlass =
  typeof CSS !== 'undefined' &&
  typeof navigator !== 'undefined' &&
  CSS.supports?.('backdrop-filter', 'url(#x)') &&
  /Chrome/.test(navigator.userAgent)

const id = `lg-${Math.random().toString(36).slice(2)}`
const filterId = `${id}-filter`
const isNested = inject('_liqvued', false)
provide('_liqvued', true)

if (import.meta.env.DEV && typeof props.as !== 'string') {
  console.warn('[Liqvued] `as` prop should be a string (HTML tag name). For Vue components, use Liqvued as a wrapper instead of `as`.')
}

const glassReady = ref(false)

const roundedMap: Record<string, number> = {
  '0': 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 9999,
  circle: 9999,
  shaped: 16,
}

function getRootEl(): HTMLElement | null {
  return root.value
}

function clamp(v: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v))
}

function smootherStep(x: number) {
  x = clamp(x)
  return x * x * x * (x * (x * 6 - 15) + 10)
}

function convex(x: number) {
  return Math.pow(1 - Math.pow(1 - clamp(x), 4), 1 / 4)
}

function wave(x: number, frequency: number, amplitude: number) {
  return clamp(x + Math.sin(clamp(x) * Math.PI * frequency) * amplitude)
}

function deterministicNoise(x: number) {
  const t = clamp(x)
  return clamp(t + Math.sin(t * 39.1) * 0.06 + Math.sin(t * 91.7) * 0.035)
}

function magnificationVector(
  x: number,
  y: number,
  w: number,
  h: number,
  magnification: number,
  magnificationFocus: number,
) {
  const cx = w / 2
  const cy = h / 2
  const rx = Math.max(1, w / 2)
  const ry = Math.max(1, h / 2)
  const dx = (x - cx) / rx
  const dy = (y - cy) / ry
  const radius = Math.hypot(dx, dy)
  const focusRadius = clamp(magnificationFocus, 0.2, 1.4)
  const focus = Math.pow(
    smootherStep(1 - clamp(radius / focusRadius)),
    1.6,
  )
  const zoom = magnification >= 0
    ? 1 + magnification * focus
    : 1 / (1 + Math.abs(magnification) * focus)

  return {
    x: (x - cx) / zoom - (x - cx),
    y: (y - cy) / zoom - (y - cy),
  }
}

function surfaceFn(x: number) {
  const t = clamp(x)

  switch (props.surface) {
    case 'concave':
    case 'bowl':
      return 1 - convex(t)
    case 'lip':
      return convex(t) * (1 - smootherStep(t)) + (1 - convex(t)) * smootherStep(t)
    case 'bevel':
      return t
    case 'saddle':
      return 0.5 + Math.sin((t - 0.5) * Math.PI) * 0.5
    case 'ripple':
      return wave(t, 3, 0.12)
    case 'noise':
      return deterministicNoise(t)
    case 'asymmetric':
      return clamp(Math.pow(t, 0.65) * 0.65 + smootherStep(t) * 0.35)
    case 'convex':
      return convex(t)
  }
}

function derivative(x: number) {
  const d = 0.001
  return (surfaceFn(x + d) - surfaceFn(x - d)) / (2 * d)
}

function refractSlope(slope: number) {
  const n1 = 1
  const n2 = 1.5

  const normalAngle = Math.atan(slope)
  const theta1 = normalAngle

  const sinTheta2 = (n1 / n2) * Math.sin(theta1)
  const theta2 = Math.asin(clamp(sinTheta2, -1, 1))

  return Math.tan(theta1 - theta2)
}

function canvasToUrl(canvas: HTMLCanvasElement) {
  return canvas.toDataURL('image/png')
}

function buildMaps() {
  if (props.fallbackOnly) {
    return
  }

  const w = Math.max(1, Math.round(width.value))
  const h = Math.max(1, Math.round(height.value))

  const displacement = document.createElement('canvas')
  displacement.width = w
  displacement.height = h

  const highlight = document.createElement('canvas')
  highlight.width = w
  highlight.height = h

  const dctx = displacement.getContext('2d')!
  const hctx = highlight.getContext('2d')!

  const dImage = dctx.createImageData(w, h)
  const hImage = hctx.createImageData(w, h)

  const vectors: Array<[number, number]> = []
  let max = 1

  const light = {
    x: Math.cos((props.glareAngle * Math.PI) / 180),
    y: Math.sin((props.glareAngle * Math.PI) / 180),
  }
  const edgeBand = Math.max(
    1,
    Math.min(props.bezel, Math.min(w, h) * 0.28),
  )

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dist = distanceToRoundedRectEdge(x, y, w, h, resolvedRadius.value)
      const t = clamp(dist / edgeBand)

      let vx = 0
      let vy = 0
      let spec = 0

      if (dist >= 0 && dist < edgeBand) {
        const n = normalFromRoundedRect(x, y, w, h, resolvedRadius.value)
        const slope = derivative(t)
        const bend = refractSlope(slope)

        const amount =
          bend *
          props.thickness *
          smootherStep(1 - t) *
          props.refraction

        vx = -n.x * amount
        vy = -n.y * amount

        max = Math.max(max, Math.abs(vx), Math.abs(vy))

        const facing = clamp(n.x * light.x + n.y * light.y, 0, 1)
        spec = Math.pow(facing, 18) * props.specularOpacity
      }

      if (props.magnification !== 0 && dist >= 0) {
        const lens = magnificationVector(
          x,
          y,
          w,
          h,
          props.magnification,
          props.magnificationFocus,
        )
        vx += lens.x
        vy += lens.y
      }

      vectors.push([vx, vy])

      const hi = (y * w + x) * 4
      const alpha = Math.round(spec * 255)

      hImage.data[hi] = 255
      hImage.data[hi + 1] = 255
      hImage.data[hi + 2] = 255
      hImage.data[hi + 3] = alpha
    }
  }

  max = vectors.reduce((currentMax, [vx, vy]) => {
    return Math.max(currentMax, Math.abs(vx), Math.abs(vy))
  }, 1)

  vectors.forEach(([vx, vy], index) => {
    const i = index * 4

    dImage.data[i] = Math.round(128 + (vx / max) * 127)
    dImage.data[i + 1] = Math.round(128 + (vy / max) * 127)
    dImage.data[i + 2] = 128
    dImage.data[i + 3] = 255
  })

  dctx.putImageData(dImage, 0, 0)
  hctx.putImageData(hImage, 0, 0)

  mapUrl.value = canvasToUrl(displacement)
  specularUrl.value = canvasToUrl(highlight)
  scale.value = max
}

function updateSize() {
  const el = getRootEl()
  if (!el) return

  width.value = Math.max(1, el.offsetWidth)
  height.value = Math.max(1, el.offsetHeight)
}

const defaultBg = supportsLiquidGlass
  ? 'rgba(255, 255, 255, 0.08)'
  : 'rgba(255, 255, 255, 0.22)'

const resolvedRadius = computed(() => {
  if (props.radius !== 32) return props.radius
  const a = props.asProps as Record<string, unknown>
  if (typeof a.rounded === 'string' && a.rounded in roundedMap) {
    return roundedMap[a.rounded]
  }
  return props.radius
})

const borderRadios = computed(() => {
  return props.borderRadius || `${resolvedRadius.value}px`
})

const vuetifyThemeColors = new Set([
  'primary', 'secondary', 'accent', 'info', 'warning', 'error', 'success',
  'surface', 'background',
])

function toTransparent(str: string, alpha: number): string {
  if (vuetifyThemeColors.has(str)) {
    return `rgba(var(--v-theme-${str}), ${alpha})`
  }
  if (str.startsWith('#')) {
    const h = str.replace('#', '')
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  if (str.startsWith('rgb')) {
    return str.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`)
  }
  return defaultBg
}

const glassBgValue = computed(() => {
  if (props.glassBackground !== undefined) return props.glassBackground
  const a = props.asProps as Record<string, unknown>
  if (typeof a.color === 'string') {
    return toTransparent(a.color, 0.6)
  }
  return defaultBg
})

const backdropFilter = computed(() => {
  if (props.fallbackOnly || !supportsLiquidGlass) {
    return 'blur(12px)'
  }
  return `url(#${filterId}) blur(${props.blur}px)`
})

const rootStyle = computed(() => ({
  borderRadius: `${borderRadios.value}`,
  ...(glassBgValue.value !== undefined
    ? { backgroundColor: glassBgValue.value }
    : {}),
  ...(glassBgValue.value !== undefined
    ? {
        boxShadow: [
          'inset 0 0 0 1px rgba(255, 255, 255, 0.28)',
          '0 18px 48px rgba(0, 0, 0, 0.18)',
        ].join(', '),
      }
    : {}),
  ...(glassReady.value && !isNested
    ? {
        backdropFilter: backdropFilter.value,
        WebkitBackdropFilter: backdropFilter.value,
      }
    : {}),
  ...(glassReady.value && isNested && !supportsLiquidGlass
    ? {
        backdropFilter: backdropFilter.value,
        WebkitBackdropFilter: backdropFilter.value,
      }
    : {}),
}))

let ro: ResizeObserver | null = null

onMounted(async () => {
  await nextTick()

  if (supportsLiquidGlass) {
    updateSize()
    buildMaps()
    await nextTick()
    glassReady.value = true

    ro = new ResizeObserver(() => {
      updateSize()
      buildMaps()
      glassReady.value = true
    })

    const el = getRootEl()
    if (el) ro.observe(el)
  } else {
    glassReady.value = true
  }
})

watch(
  () => [
    resolvedRadius.value,
    props.bezel,
    props.thickness,
    props.refraction,
    props.magnification,
    props.magnificationFocus,
    props.surface,
    props.specularOpacity,
    props.glareAngle,
    props.fallbackOnly,
  ],
  () => {
    if (supportsLiquidGlass) {
      buildMaps()
    }
    glassReady.value = true
  },
)

onBeforeUnmount(() => {
  ro?.disconnect()
})
</script>

<template>
  <div
    ref="root"
    class="liquid-glass"
    :style="rootStyle"
  >
    <svg
      v-if="supportsLiquidGlass"
      class="liquid-glass__svg"
      aria-hidden="true"
    >
      <defs>
        <filter
          :id="filterId"
          color-interpolation-filters="sRGB"
          filterUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="10000"
          height="10000"
        >
          <feImage
            :href="mapUrl"
            x="0"
            y="0"
            :width="width"
            :height="height"
            result="displacement_map"
          />

          <feGaussianBlur
            in="displacement_map"
            stdDeviation="2"
            result="smooth_disp"
          />

          <feDisplacementMap
            in="SourceGraphic"
            in2="smooth_disp"
            :scale="scale"
            xChannelSelector="R"
            yChannelSelector="G"
            result="refracted"
          />

          <feImage
            :href="specularUrl"
            x="0"
            y="0"
            :width="width"
            :height="height"
            result="specular"
          />

          <feBlend in="refracted" in2="specular" mode="screen" />
        </filter>
      </defs>
    </svg>

    <component
      :is="as"
      v-bind="asProps"
    >
      <slot />
    </component>
  </div>
</template>

<style scoped>
.liquid-glass {
  position: relative;
  isolation: isolate;
  overflow: hidden;
}

.liquid-glass__svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

@supports not ((backdrop-filter: url("#x"))) {
  .liquid-glass {
    backdrop-filter: blur(12px);
  }
}
</style>
