<script setup lang="ts">
import {
  type Component,
  type ComponentPublicInstance,
  computed,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  watch,
} from 'vue'
import type { Surface } from './types'

const props = withDefaults(defineProps<{
  as?: string | Component
  asProps?: object
  radius?: number
  bezel?: number
  thickness?: number
  refraction?: number
  blur?: number
  surface?: Surface
  specularOpacity?: number
  glareAngle?: number
  glassBackground?: string
}>(), {
  as: 'div',
  asProps: () => ({}),
  radius: 32,
  bezel: 22,
  thickness: 42,
  refraction: 1,
  blur: 0.4,
  surface: 'convex',
  specularOpacity: 0.45,
  glareAngle: -60,
  glassBackground: undefined,
})

const root = ref<HTMLElement | ComponentPublicInstance | null>(null)

const width = ref(1)
const height = ref(1)
const mapUrl = ref('')
const specularUrl = ref('')
const scale = ref(1)
const supportsLiquidGlass =
  CSS.supports?.('backdrop-filter', 'url(#x)') &&
  /Chrome/.test(navigator.userAgent)

const id = `lg-${Math.random().toString(36).slice(2)}`
const filterId = `${id}-filter`
const isNested = inject('_liqvued', false)
provide('_liqvued', true)
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
  if (!root.value) return null
  if (root.value instanceof Element) return root.value as HTMLElement
  return (root.value as ComponentPublicInstance).$el ?? null
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

function surfaceFn(x: number) {
  if (props.surface === 'concave') return 1 - convex(x)
  if (props.surface === 'lip') {
    const t = smootherStep(x)
    return convex(x) * (1 - t) + (1 - convex(x)) * t
  }
  return convex(x)
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

function distanceToRoundedRectEdge(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const cx = clamp(x, r, w - r)
  const cy = clamp(y, r, h - r)

  const dx = x - cx
  const dy = y - cy

  const cornerDistance = Math.hypot(dx, dy)
  const edgeDistance = Math.min(x, y, w - x, h - y)

  if (dx !== 0 && dy !== 0) {
    return r - cornerDistance
  }

  return edgeDistance
}

function normalFromRoundedRect(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const cx = clamp(x, r, w - r)
  const cy = clamp(y, r, h - r)

  let nx = x - cx
  let ny = y - cy

  if (nx === 0 && ny === 0) {
    const left = x
    const right = w - x
    const top = y
    const bottom = h - y
    const m = Math.min(left, right, top, bottom)

    if (m === left) nx = -1
    else if (m === right) nx = 1
    else if (m === top) ny = -1
    else ny = 1
  }

  const len = Math.hypot(nx, ny) || 1

  return {
    x: nx / len,
    y: ny / len,
  }
}

function canvasToUrl(canvas: HTMLCanvasElement) {
  return canvas.toDataURL('image/png')
}

function buildMaps() {
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

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dist = distanceToRoundedRectEdge(x, y, w, h, resolvedRadius.value)
      const t = clamp(dist / props.bezel)

      let vx = 0
      let vy = 0
      let spec = 0

      if (dist >= 0 && dist < props.bezel) {
        const n = normalFromRoundedRect(x, y, w, h, resolvedRadius.value)
        const slope = derivative(t)
        const bend = refractSlope(slope)

        const amount =
          bend * props.thickness * (1 - t) * props.refraction

        vx = -n.x * amount
        vy = -n.y * amount

        max = Math.max(max, Math.abs(vx), Math.abs(vy))

        const facing = clamp(n.x * light.x + n.y * light.y, 0, 1)
        spec = Math.pow(facing, 18) * props.specularOpacity
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
  if (supportsLiquidGlass) {
    return `url(#${filterId}) blur(${props.blur}px)`
  }
  return 'blur(12px)'
})

const rootStyle = computed(() => ({
  borderRadius: `${resolvedRadius.value}px`,
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
    props.surface,
    props.specularOpacity,
    props.glareAngle,
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
  <component
    :is="as"
    ref="root"
    class="liquid-glass"
    v-bind="asProps"
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

          <feDisplacementMap
            in="SourceGraphic"
            in2="displacement_map"
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

    <slot />
  </component>
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
