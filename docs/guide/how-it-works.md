# How It Works

The component renders an inline SVG `<filter>` definition and applies it via CSS `backdrop-filter`:

```
SourceGraphic (background content)
    │
    ├──► feImage (displacement map) ──► feDisplacementMap
    │                                      │
    ├──► feImage (specular highlight) ─────┤
    │                                      ▼
    │                              feBlend (screen mode)
    │                                      │
    ▼                                      ▼
CSS backdrop-filter: blur()
    │
    ▼
Final output
```

1. **Displacement Map** — An RGBA canvas image where the red/green channels encode X/Y displacement direction and magnitude. The displacement is calculated per-pixel based on the signed distance to the element edge and the surface profile's slope at that distance.

2. **Specular Highlight Map** — A separate canvas image that encodes surface lighting. Pixel alpha corresponds to highlight intensity, computed via Blinn-Phong shading against a configurable `glareAngle`.

3. **SVG Filter** — The displacement map is loaded via `<feImage>` and used by `<feDisplacementMap>` to warp the background pixels. The specular map is composited on top using `feBlend` with `screen` mode.

4. **CSS Blur** — A `backdrop-filter: blur()` is layered on top of the SVG displacement to simulate the frosted glass look.

## Surface Types

Each surface type is a mathematical profile that defines the displacement slope along the bezel:

| Type      | Function                                         | Visual                                  |
|-----------|--------------------------------------------------|-----------------------------------------|
| `convex`  | `(1 - (1-x)⁴)^0.25`                              | Squircle bulge — soft pill-like edges   |
| `concave` | `1 - convex(x)`                                  | Inverted bulge — dish-like inward curve |
| `lip`     | Smooth convex→concave blend via smootherstep     | Raised rim, shallow dip                 |

The slope (derivative) of the height function at each bezel position determines the displacement vector magnitude. Pixels at the outer edge get the maximum displacement, while interior pixels remain unaffected.
