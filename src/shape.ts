export interface Point {
  x: number
  y: number
}

export function distanceToRoundedRectEdge(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const hr = Math.min(r, Math.min(w, h) / 2)
  const hw = w / 2 - hr
  const hh = h / 2 - hr
  const ax = Math.abs(x - w / 2) - hw
  const ay = Math.abs(y - h / 2) - hh

  const outsidePart = Math.hypot(Math.max(ax, 0), Math.max(ay, 0))
  const insidePart = Math.min(Math.max(ax, ay), 0)

  return -(insidePart + outsidePart - hr)
}

export function normalFromRoundedRect(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): Point {
  const delta = 1.5
  const nx = distanceToRoundedRectEdge(x - delta, y, w, h, r)
    - distanceToRoundedRectEdge(x + delta, y, w, h, r)
  const ny = distanceToRoundedRectEdge(x, y - delta, w, h, r)
    - distanceToRoundedRectEdge(x, y + delta, w, h, r)

  const len = Math.hypot(nx, ny)
  if (len < 1e-10) return { x: 0, y: -1 }

  return { x: nx / len, y: ny / len }
}
