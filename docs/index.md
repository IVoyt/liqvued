---
layout: home

hero:
  name: Liqvued
  text: Liquid Glass Effects for Vue 3
  tagline: Realistic SVG displacement map refraction via SVG filter primitives — zero runtime dependencies beyond Vue.
  image:
    src: /brand_logo.png
    alt: Liqvued
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/IVoyt/liqvued

features:
  - icon: 🔬
    title: Surface Refraction
    details: Per-pixel displacement maps computed from mathematical surface profiles — each shape produces a distinct refraction pattern.
  - icon: 🎨
    title: Multiple Surface Types
    details: Choose from convex, concave, and lip profiles — each producing a distinct glass shape and edge distortion.
  - icon: ⚡
    title: Real-Time SVG Filters
    details: Displacement maps are generated on-the-fly via Canvas API and injected as an inline SVG filter primitive.
  - icon: 🧩
    title: Vue 3 Native
    details: Built as a Vue 3 component with full TypeScript support. Slot-based content lets you wrap any element in glass.
  - icon: 🎛️
    title: Fully Configurable
    details: Control corner radius, bezel width, displacement thickness, refraction index, blur, and surface type through component props.
  - icon: 🌐
    title: Lightweight
    details: Zero runtime dependencies beyond Vue. Just pure math, Canvas, and SVG.
---
