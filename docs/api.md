# API Reference

## Liqvued Component

The `<Liqvued>` component wraps content in a liquid glass effect using SVG filter primitives. It accepts the following props:

### Props

| Prop              | Type                  | Default    | Description                                                                     |
|-------------------|-----------------------|------------|---------------------------------------------------------------------------------|
| `as`              | `string \| Component` | `'div'`    | HTML tag or Vue component to render as                                          |
| `asProps`         | `object`              | `{}`       | Props passed to the rendered element/component                                  |
| `radius`          | `number`              | `32`       | Corner radius in pixels                                                         |
| `bezel`           | `number`              | `22`       | Width of the displacement bezel in pixels                                       |
| `thickness`       | `number`              | `42`       | Maximum displacement magnitude in pixels                                        |
| `refraction`      | `number`              | `1`        | Refraction index multiplier                                                     |
| `blur`            | `number`              | `0.4`      | CSS backdrop-filter blur amount                                                 |
| `surface`         | [`Surface`](#types)   | `'convex'` | Glass surface profile shape                                                     |
| `specularOpacity` | `number`              | `0.45`     | Opacity of the specular highlight                                               |
| `glareAngle`      | `number`              | `-60`      | Light source angle in degrees for specular highlight                            |
| `glassBackground` | `string`              | —          | Glass panel background color (auto-derived from `asProps.color` when available) |

### Slots

The component provides a single default slot:

```vue
<Liqvued>
  <p>Content rendered on the glass surface</p>
</Liqvued>
```

## Types

The `Surface` type is exported from the package:

```ts
import type { Surface } from 'liqvued'
```

```ts
type Surface = 'convex' | 'concave' | 'lip'
```

### Surface Types

| Type       | Description                                                                   |
|------------|-------------------------------------------------------------------------------|
| `convex`   | Squircle convex profile — soft pill-like edges. Default.                      |
| `concave`  | Inverted convex profile — inward-curving dish-like refraction.                |
| `lip`      | Smooth transition from convex at center to concave at edge — S-curve profile. |
