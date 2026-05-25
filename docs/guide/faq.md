# FAQ / Troubleshooting

**Q: Why doesn't the liquid glass effect work in Safari / Firefox?**

A: The SVG `backdrop-filter: url(#filter)` is a Chromium-only feature. Safari and Firefox don't support using SVG filters as `backdrop-filter`. `<Liqvued>` automatically detects this and applies a glassmorphism blur fallback instead.

**Q: Will it work on Windows / Linux?**

A: Yes. The limitation is browser-engine based, not OS based. Any Chromium browser on any platform will work.

**Q: Why is the glass effect not showing at all?**

A: Make sure the `<Liqvued>` element is placed over a visible background (image, gradient, or colored element). The effect refracts the content behind it — without a background behind the glass, there's nothing to refract.

**Q: Can I use multiple `<Liqvued>` components on the same page?**

A: Yes. Each instance generates a unique `filterId` (`liquid-glass-{random}`) to avoid SVG ID collisions.

**Q: Can I nest `<Liqvued>` inside another `<Liqvued>`?**

A: Technically nothing prevents it, but nested instances won't render the liquid glass effect. The SVG `backdrop-filter` only captures the background behind the outermost glass layer — there's no layered refraction to capture inside. The component automatically detects nesting via `provide/inject` and skips the effect on inner instances. Unsupported browsers (fallback mode) will still apply the CSS blur as usual.

**Q: Does the component work with Nuxt / SSR?**

A: Yes. The component renders the container and slot content on the server. The SVG filter generation runs client-side only (Canvas API).

**Q: What is the performance impact?**

A: The displacement map is regenerated whenever the element resizes or any prop changes. For static-sized elements, the maps are generated once and cached. In unsupported browsers (non-Chromium), all canvas/filter generation is skipped entirely — only the lightweight CSS fallback is applied.

**Q: Can I render the glass effect on a different HTML element or a custom component?**

A: Yes. Use the `as` prop to render the glass container as any HTML tag or Vue component:

```vue
<Liqvued as="section" :as-props="{ class: 'my-panel' }">
  <p>Section with glass effect</p>
</Liqvued>
```

This is useful for SEO (semantic HTML), accessibility, or when integrating with UI libraries.
