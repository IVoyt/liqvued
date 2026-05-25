<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Bubble {
  x: number
  y: number
  r: number
  speed: number
  drift: number
  opacity: number
  hue: number
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animId = 0
let bubbles: Bubble[] = []
let w = 0
let h = 0

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

function draw(ctx: CanvasRenderingContext2D) {
  const dpr = window.devicePixelRatio || 1
  ctx.clearRect(0, 0, w * dpr, h * dpr)
  ctx.save()
  ctx.scale(dpr, dpr)

  for (const b of bubbles) {
    b.x += b.drift
    b.y -= b.speed

    if (b.x < -b.r) b.x = w + b.r
    if (b.x > w + b.r) b.x = -b.r
    if (b.y + b.r < 0) {
      Object.assign(b, createBubble(false))
      continue
    }

    const grad = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, 0, b.x, b.y, b.r)
    grad.addColorStop(0, `hsla(${b.hue}, 80%, 55%, ${b.opacity})`)
    grad.addColorStop(0.5, `hsla(${b.hue}, 75%, 45%, ${b.opacity * 0.85})`)
    grad.addColorStop(1, `hsla(${b.hue}, 65%, 35%, ${b.opacity * 0.5})`)

    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
    ctx.fillStyle = grad
    ctx.fill()

    const highlight = ctx.createRadialGradient(
      b.x - b.r * 0.35, b.y - b.r * 0.35, 0,
      b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.7,
    )
    highlight.addColorStop(0, `rgba(255, 255, 255, ${b.opacity * 0.6})`)
    highlight.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
    ctx.fillStyle = highlight
    ctx.fill()
  }

  ctx.restore()
}

function tick() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  draw(ctx)
  animId = requestAnimationFrame(tick)
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
}

onMounted(() => {
  resize()
  tick()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
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
