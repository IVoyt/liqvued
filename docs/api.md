# API Reference

## Liqvued Component

The `<Liqvued>` component wraps content in a liquid glass effect using SVG filter primitives. It accepts the following props:

### Props

| Prop              | Type                   | Default    | Description                                                                           |
|-------------------|------------------------|------------|---------------------------------------------------------------------------------------|
| `as`              | `string \| Component`  | `'div'`    | HTML tag or Vue component to render as (rendered as a child of the glass root)        |
| `asProps`         | `object`               | `{}`       | Props passed to the rendered element/component                                        |
| `radius`          | `number`               | `32`       | Corner radius in pixels                                                               |
| `borderRadius`    | `string`               | —          | Per-corner border-radius CSS value (e.g. `"10px 20px 10px 20px"`); overrides `radius` |
| `bezel`           | `number`               | `22`       | Width of the displacement bezel in pixels                                             |
| `thickness`       | `number`               | `42`       | Maximum displacement magnitude in pixels                                              |
| `refraction`      | `number`               | `1`        | Refraction index multiplier                                                           |
| `refractionMode`  | [`RefractionMode`](#types) | `'edge'` | Refraction direction mode                                                             |
| `magnification`   | `number`               | `0`        | Center magnification amount. Positive values enlarge, negative values shrink          |
| `magnificationFocus` | `number`            | `0.82`     | Focus radius of the magnification area. Lower values keep the lens tighter            |
| `blur`            | `number`               | `0.4`      | CSS backdrop-filter blur amount                                                       |
| `surface`         | [`Surface`](#types)    | `'convex'` | Glass surface profile shape                                                           |
| `specularOpacity` | `number`               | `0.45`     | Opacity of the specular highlight                                                     |
| `glareAngle`      | `number \| false`      | `-60`      | Light source angle in degrees for specular highlight. Set `false` to disable          |
| `glassBackground` | `string`               | —          | Glass panel background color (auto-derived from `asProps.color` when available)       |
| `fallbackOnly`    | `boolean`              | `false`    | When `true`, disables the SVG displacement effect and uses only CSS blur              |

### Slots

The component provides a single default slot:

```vue
<Liqvued>
  <p>Content rendered on the glass surface</p>
</Liqvued>
```

## Types

The `Surface` and `RefractionMode` types are exported from the package:

```ts
import type { RefractionMode, Surface } from 'liqvued'
```

```ts
type Surface = 'convex' | 'concave' | 'lip' | 'bowl' | 'bevel' | 'saddle' | 'ripple' | 'noise' | 'asymmetric'
type RefractionMode = 'edge' | 'center' | 'split'
```

### Surface Types

| Type          | Description                                                                    |
|---------------|--------------------------------------------------------------------------------|
| `convex`      | Squircle convex profile — soft pill-like edges. Default.                       |
| `concave`     | Inverted convex profile — inward-curving dish-like refraction.                 |
| `lip`         | Smooth transition from convex at center to concave at edge — S-curve profile. |
| `bowl`        | Deeper concave profile with a more even inward pull.                           |
| `bevel`       | Linear edge ramp for harder, cleaner refraction.                               |
| `saddle`      | Mirrored S-curve that changes direction through the middle.                    |
| `ripple`      | Periodic wave modulation across the edge band.                                 |
| `noise`       | Deterministic irregular profile for organic glass distortion.                  |
| `asymmetric`  | Biased convex profile with more weight on one side of the edge band.           |

### Refraction Modes

| Type      | Description                                                                    |
|-----------|--------------------------------------------------------------------------------|
| `edge`    | Original behavior; displacement follows the rounded edge normal. Default.       |
| `center`  | Displacement points inward from each edge toward the shape centerline.          |
| `split`   | Outer and inner bezel halves bend in opposite directions with a neutral midpoint. |
