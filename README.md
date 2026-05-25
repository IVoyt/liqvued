# Liqvued (Liquid Vue)

[![npm](https://img.shields.io/npm/v/liqvued.svg)](https://www.npmjs.com/package/liqvued)
[![npm](https://img.shields.io/npm/dw/liqvued.svg)](https://www.npmjs.com/package/liqvued)
[![GitHub](https://img.shields.io/github/license/ivoyt/liqvued)](./LICENSE)

A Vue 3 component for creating liquid glass effects using SVG filter primitives. Generates realistic SVG displacement maps on the fly.

Inspired by [Liquid Glass CSS/SVG](https://kube.io/blog/liquid-glass-css-svg/)

## Features

- **Real-time SVG filter generation** — displacement maps computed via Canvas API
- **Multiple surface types** — convex, concave, lip
- **Configurable optics** — bezel width, corner radius, displacement thickness, refraction index, glare angle
- **Built-in glassmorphism styling** — gradient backgrounds, inset shadows, highlight overlays
- **TypeScript** — full type definitions
- **Lightweight** — minimal runtime dependencies beyond Vue
- **Flexible composition** — `as` prop allows rendering as any HTML element or component

## Installation

```bash
pnpm add liqvued
```

## Usage

```vue
<script setup lang="ts">
import { Liqvued } from 'liqvued'
</script>

<template>
  <div style="background: url('bg.jpg') center/cover;">
    <Liqvued
      :radius="32"
      :bezel="22"
      :thickness="42"
      :refraction="1"
      :blur="0.4"
      surface="convex"
    >
      <p>Content behind the glass</p>
    </Liqvued>
  </div>
</template>
```

## Props

| Prop            | Type                | Default    | Description                                                                     |
|-----------------|---------------------|------------|---------------------------------------------------------------------------------|
| radius          | number              | 32         | Corner radius in pixels                                                         |
| bezel           | number              | 22         | Width of the displacement bezel in pixels                                       |
| thickness       | number              | 42         | Maximum displacement magnitude in pixels                                        |
| refraction      | number              | 1          | Refraction index multiplier                                                     |
| blur            | number              | 0.4        | CSS backdrop-filter blur amount                                                 |
| surface         | string              | `'convex'` | Glass surface profile shape                                                     |
| specularOpacity | number              | 0.45       | Opacity of the specular highlight                                               |
| glareAngle      | number              | -60        | Light source angle in degrees for specular highlight                            |
| glassBackground | string              | —          | Glass panel background color (auto-derived from `asProps.color` when available) |
| as              | string \| Component | `'div'`    | HTML tag or Vue component to render as                                          |
| asProps         | object              | `{}`       | Props passed to the rendered element/component                                  |

### Surface Types

- `convex` — squircle convex profile — soft pill-like edges
- `concave` — inverted convex — inward-curving dish-like refraction
- `lip` — smooth transition from convex at center to concave at edge

## Dynamic Element Rendering

Use the `as` prop to render the glass effect on any element or component:

```vue
<template>
  <Liqvued as="section" :as-props="{ class: 'my-panel' }">
    <p>Section with glass effect</p>
  </Liqvued>
</template>
```

## Browser Compatibility

| Browser                 | Effect                                                                            |
|-------------------------|-----------------------------------------------------------------------------------|
| Chrome / Edge / Opera   | ✅ Full liquid glass (SVG backdrop-filter)                                         |
| Safari / Firefox        | ❌ Glassmorphism blur fallback (auto-detected via `CSS.supports()` + UA check)     |

The fallback applies `backdrop-filter: blur(12px)` with a subtle border and shadow, so the component still looks like frosted glass in unsupported browsers. SVG filter generation is skipped entirely in fallback mode — no unnecessary CPU/GPU work.

## How It Works

The component generates a per-pixel displacement map as an RGBA PNG (red/green channels encode X/Y displacement vectors), injects it into an SVG `<feDisplacementMap>` filter, and applies it via `backdrop-filter` combined with CSS blur. The surface profile functions (`convex`, `concave`, `lip`) define the slope at each point along the bezel, which determines the displacement magnitude. A separate specular highlight map is generated and composited via `feBlend` to simulate surface lighting.

## License

MIT — see [LICENSE](LICENSE)
