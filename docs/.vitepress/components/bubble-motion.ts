export interface BubbleMotionSeed {
  x: number
  y: number
  r: number
  speed: number
  drift: number
}

export interface BubblePosition {
  x: number
  y: number
}

function wrap(value: number, min: number, max: number) {
  const range = max - min
  return ((((value - min) % range) + range) % range) + min
}

export function bubblePositionAt(
  bubble: BubbleMotionSeed,
  width: number,
  height: number,
  timeline: number,
): BubblePosition {
  const cycleFrames = 1200
  const frames = Math.max(0, timeline) * cycleFrames
  const x = wrap(bubble.x + bubble.drift * frames, -bubble.r, width + bubble.r)
  const y = wrap(bubble.y - bubble.speed * frames, -bubble.r, height + bubble.r)

  return { x, y }
}
