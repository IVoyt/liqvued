# Browser Compatibility

The Liquid Glass SVG effect relies on `backdrop-filter: url(#filter)` — a feature currently only supported in **Chromium-based browsers** (Chrome, Edge, Opera, Brave, etc.). Detection uses both `CSS.supports('backdrop-filter', 'url(#x)')` and a Chrome user-agent check.

| Browser                 | Support                       |
|-------------------------|-------------------------------|
| Chrome / Edge / Opera   | ✅ Full liquid glass effect    |
| Safari                  | ❌ Glassmorphism blur fallback |
| Firefox                 | ❌ Glassmorphism blur fallback |

## Platform Support

The limitation is **browser-engine based**, not OS based. Any Chromium browser on any platform (Windows, macOS, Linux) will render the full effect.

| OS | Chrome | Edge | Opera | Safari | Firefox |
|----|--------|------|-------|--------|---------|
| Windows | ✅ Full | ✅ Full | ✅ Full | — | ❌ Fallback |
| macOS | ✅ Full | ✅ Full | ✅ Full | ❌ Fallback | ❌ Fallback |
| Linux | ✅ Full | ✅ Full | ✅ Full | — | ❌ Fallback |

## Fallback Behaviour

In unsupported browsers, `<Liqvued>` automatically detects the lack of support and applies a glassmorphism blur fallback:

```
backdrop-filter: blur(12px)
border: 1px solid rgba(255, 255, 255, 0.15)
box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2)
```

The SVG filter generation (displacement map) is **skipped entirely** in unsupported browsers, so no unnecessary CPU/GPU work is performed.
