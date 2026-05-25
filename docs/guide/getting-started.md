# Getting Started

This project draws inspiration and ideas from Chris Feijoo's article [Liquid Glass in the Browser: Refraction with CSS and SVG](https://kube.io/blog/liquid-glass-css-svg).

> **Browser compatibility:** The Liquid Glass effect relies on SVG filters as `backdrop-filter`, which is currently only supported in Chromium-based browsers (Chrome, Edge, Opera, etc.). For unsupported browsers, a glassmorphism blur fallback is applied automatically.

## Installation

Install the package via your preferred package manager:

::: code-group

```bash [pnpm]
pnpm add liqvued
```

```bash [npm]
npm install liqvued
```

```bash [yarn]
yarn add liqvued
```

:::

## Global Registration

Register the plugin globally in your app entry point:

```ts
import { createApp } from 'vue'
import LiqvuedPlugin from 'liqvued'
import App from './App.vue'

const app = createApp(App)
app.use(LiqvuedPlugin)
app.mount('#app')
```

Now the `<Liqvued>` component is available anywhere in your templates.

## Local Import

You can also import the component locally in individual SFCs:

```vue
<script setup lang="ts">
import { Liqvued } from 'liqvued'
</script>

<template>
  <Liqvued :radius="32" :bezel="22" :thickness="42" :refraction="1" :blur="0.4" surface="convex">
    <p>Your content here</p>
  </Liqvued>
</template>
```

## Basic Usage

Wrap any content in `<Liqvued>` and place it over a background to see the refraction effect:

<DemoShowcase />

```vue
<script setup lang="ts">
import { Liqvued } from 'liqvued'
</script>

<template>
  <div
    style="background: url('https://picsum.photos/seed/liqvued/1200/600') center/cover;"
  >
    <Liqvued
      :bezel="45"
      :thickness="60"
      :refraction="3"
      :glare-angle="285"
      :specular-opacity="0.2"
      glass-background="#00f0f055"
      :blur="0.8"
      surface="convex"
    >
      <h2>Hello from behind the glass</h2>
    </Liqvued>
  </div>
</template>
```

The glass effect is driven by two key primitives:

- **SVG `<feDisplacementMap>`** — refracts the background based on the surface profile
- **CSS `backdrop-filter: blur()`** — adds frosted glass blur

A per-pixel displacement map is generated on a Canvas, encoded as a PNG data URL, and injected into the SVG filter via `<feImage>`.

## Surface Types

| Type      | Description                          | Appearance                                      |
|-----------|--------------------------------------|-------------------------------------------------|
| `convex`  | Squircle convex profile              | Soft, pill-like edges with inward refraction    |
| `concave` | Inverted convex profile              | Inward-curving dish-like refraction             |
| `lip`     | Smooth convex-to-concave transition  | S-curve that lifts at center and dips at edges  |

## Props

| Prop               | Type                    | Default    | Description                                                                      |
|--------------------|-------------------------|------------|----------------------------------------------------------------------------------|
| `as`               | `string \| Component`   | `'div'`    | HTML tag or Vue component to render as                                           |
| `asProps`          | `object`                | `{}`       | Props passed to the rendered element/component                                   |
| `radius`           | `number`                | `32`       | Corner radius in pixels                                                          |
| `bezel`            | `number`                | `22`       | Width of the displacement bezel in pixels                                        |
| `thickness`        | `number`                | `42`       | Maximum displacement magnitude in pixels                                         |
| `refraction`       | `number`                | `1`        | Refraction index multiplier                                                      |
| `blur`             | `number`                | `0.4`      | CSS backdrop-filter blur amount                                                  |
| `surface`          | [`Surface`](/api#types) | `'convex'` | Surface profile shape                                                            |
| `specularOpacity`  | `number`                | `0.45`     | Opacity of the specular highlight                                                |
| `glareAngle`       | `number`                | `-60`      | Light source angle in degrees for specular highlight                             |
| `glassBackground`  | `string`                | —          | Glass panel background color (auto-derived from `asProps.color` when available)  |
