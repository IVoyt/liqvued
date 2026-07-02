import { strict as assert } from 'node:assert'
import { normalFromRoundedRect } from './shape'

function closeTo(actual: number, expected: number, tolerance = 0.001) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}`,
  )
}

function assertUnitNormal(point: [number, number]) {
  const normal = normalFromRoundedRect(point[0], point[1], 200, 120, 40)
  const length = Math.hypot(normal.x, normal.y)

  closeTo(length, 1)
}

function dot(a: [number, number], b: [number, number]) {
  return a[0] * b[0] + a[1] * b[1]
}

function normalAt(point: [number, number]): [number, number] {
  const normal = normalFromRoundedRect(point[0], point[1], 200, 120, 40)
  return [normal.x, normal.y]
}

assertUnitNormal([20, 30])
assertUnitNormal([180, 30])
assertUnitNormal([20, 90])
assertUnitNormal([180, 90])

const topLeft = normalAt([20, 30])
const topRight = normalAt([180, 30])
const bottomLeft = normalAt([20, 90])
const bottomRight = normalAt([180, 90])

closeTo(topLeft[0], -topRight[0])
closeTo(topLeft[1], topRight[1])
closeTo(topLeft[0], bottomLeft[0])
closeTo(topLeft[1], -bottomLeft[1])
closeTo(topLeft[0], -bottomRight[0])
closeTo(topLeft[1], -bottomRight[1])

assert.ok(
  dot(normalAt([39, 10]), normalAt([40, 10])) > 0.99,
  'Expected top edge to top-right corner transition to be smooth',
)

assert.ok(
  dot(normalAt([39, 10]), normalAt([41, 10])) > 0.98,
  'Expected rounded corner seam to remain visually continuous',
)

console.log('shape geometry tests passed')
