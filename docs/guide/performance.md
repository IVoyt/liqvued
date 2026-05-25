# Performance

## Map Generation

The displacement map is regenerated whenever the element **resizes** or any prop changes. The generation pipeline involves:

1. Iterating over every bezel pixel to compute displacement vectors
2. Encoding the result as a base64 PNG data URL
3. Injecting it into the SVG filter definition

The canvas operations run on the **main thread**, so map generation blocks briefly.

## Optimisation Tips

- **Static sizing** — For elements that don't resize, the maps are generated once and cached. Use fixed dimensions where possible.
- **Avoid rapid prop changes** — Each prop change triggers a full regeneration. Debounce prop updates if animating.
- **Reduce element size** — Map generation cost scales with pixel count. Keep glass elements reasonably sized.
- **Unsupported browsers** — In non-Chromium browsers, all canvas/filter generation is skipped entirely. Only the lightweight CSS fallback is applied, so there is zero performance impact.

## Multiple Instances

Multiple `<Liqvued>` components on the same page each have their own SVG filter ID (`liquid-glass-{random}`), so they coexist without conflicts. Each instance generates its own maps independently.
