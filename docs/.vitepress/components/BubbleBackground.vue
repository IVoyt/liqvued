<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { bubblePositionAt } from './bubble-motion'

interface Bubble {
  x: number
  y: number
  r: number
  speed: number
  drift: number
  opacity: number
  hue: number
}

const props = withDefaults(defineProps<{
  animate?: boolean
  timeline?: number
}>(), {
  animate: true,
  timeline: 0,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animId = 0
let observer: ResizeObserver | undefined
let bubbles: Bubble[] = []
let w = 0
let h = 0
let animationTimeline = 0
let lastFrameTime = 0

function initBubbles() {
  const count = Math.max(8, Math.round((w * h) / 18000))
  bubbles = Array.from({ length: count }, (_, i) => {
    const b = createBubble(false)
    b.y = h + 60 - ((h + 60) / count) * i + (Math.random() - 0.5) * 20
    return b
  })
}

function createBubble(randomY: boolean): Bubble {
  return {
    x: Math.random() * w,
    y: randomY ? Math.random() * h : h + 80 + Math.random() * 60,
    r: 12 + Math.random() * 35,
    speed: 0.2 + Math.random() * 0.4,
    drift: (Math.random() - 0.5) * 0.4,
    opacity: 0.3 + Math.random() * 0.4,
    hue: 200 + Math.random() * 60,
  }
}

function draw(ctx: CanvasRenderingContext2D, timeline: number) {
  const dpr = window.devicePixelRatio || 1
  ctx.clearRect(0, 0, w * dpr, h * dpr)
  ctx.save()
  ctx.scale(dpr, dpr)

  for (const b of bubbles) {
    const position = bubblePositionAt(b, w, h, timeline)
    const x = position.x
    const y = position.y

    const grad = ctx.createRadialGradient(x - b.r * 0.3, y - b.r * 0.3, 0, x, y, b.r)
    grad.addColorStop(0, `hsla(${b.hue}, 80%, 55%, ${b.opacity})`)
    grad.addColorStop(0.5, `hsla(${b.hue}, 75%, 45%, ${b.opacity * 0.85})`)
    grad.addColorStop(1, `hsla(${b.hue}, 65%, 35%, ${b.opacity * 0.5})`)

    ctx.beginPath()
    ctx.arc(x, y, b.r, 0, Math.PI * 2)
    ctx.fillStyle = grad
    ctx.fill()

    const highlight = ctx.createRadialGradient(
      x - b.r * 0.35, y - b.r * 0.35, 0,
      x - b.r * 0.35, y - b.r * 0.35, b.r * 0.7,
    )
    highlight.addColorStop(0, `rgba(255, 255, 255, ${b.opacity * 0.6})`)
    highlight.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.beginPath()
    ctx.arc(x, y, b.r, 0, Math.PI * 2)
    ctx.fillStyle = highlight
    ctx.fill()
  }

  ctx.restore()
}

function render() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  draw(ctx, props.animate ? animationTimeline : props.timeline)
}

function tick(timestamp: number) {
  if (!props.animate) return
  if (lastFrameTime === 0) lastFrameTime = timestamp
  const delta = timestamp - lastFrameTime
  lastFrameTime = timestamp
  animationTimeline += delta / 20000
  render()
  animId = requestAnimationFrame(tick)
}

function startAnimation() {
  if (animId || !props.animate) return
  lastFrameTime = 0
  animId = requestAnimationFrame(tick)
}

function stopAnimation() {
  if (!animId) return
  cancelAnimationFrame(animId)
  animId = 0
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  const parent = canvas.parentElement
  if (!parent) return
  const dpr = window.devicePixelRatio || 1
  w = parent.clientWidth
  h = parent.clientHeight
  canvas.width = w * dpr
  canvas.height = h * dpr
  canvas.style.width = w + 'px'
  canvas.style.height = h + 'px'
  initBubbles()
  render()
}

watch(() => [props.animate, props.timeline] as const, ([animate]) => {
  if (animate) {
    startAnimation()
  }
  else {
    stopAnimation()
    render()
  }
})

onMounted(() => {
  resize()
  if (canvasRef.value?.parentElement) {
    observer = new ResizeObserver(resize)
    observer.observe(canvasRef.value.parentElement)
  }
  startAnimation()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  stopAnimation()
  observer?.disconnect()
  window.removeEventListener('resize', resize)
})
</script>

<template>
  <canvas ref="canvasRef" class="bubble-canvas" />
</template>

<style scoped>
.bubble-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}
</style>
