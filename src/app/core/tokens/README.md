# Design tokens

The seven layers under `layers/` are the **single source of truth** for
every visual decision in the application. All `--sc-*` custom properties
live here, and PrimeNG `--p-*` variables are bridged to them in layer 6.

The structure mirrors PrimeNG's official design-token model
(primitive → semantic → component → preset overrides) and adds two
layers PrimeNG doesn't provide: domain palettes (3) and AED-only
extensions (5).

## Layout

```
core/tokens/
├── index.css                  # orchestrator — imports all layers in cascade order
├── aed-preset.ts              # PrimeNG preset (replaces the old layer-6 CSS bridge)
├── layers/
│   ├── 01-primitive.css       # raw values (color scales, font, spacing, radius)
│   ├── 02-semantic.css        # purpose-bound aliases (text, surface, border, type roles)
│   ├── 03-palette.css         # domain palettes (label hues, agent presence, group priority)
│   ├── 04-component.css       # pre-baked component specs (button, modal, toast)
│   ├── 05-extensions.css      # AED-only (layout dims, shadows, z-index, motion)
│   └── 07-dark.css            # `.aed-dark` overrides for layers 2 / 3 / 4
└── README.md
```

> **Note**: layer 6 used to be `06-primeng-bridge.css` — a flat-CSS file
> that redirected every `--p-*` runtime variable to a `--sc-*` token.
> PrimeNG 21 prefers a JS-defined preset, so the bridge moved to
> [`aed-preset.ts`](./aed-preset.ts), which `definePreset(Aura, …)`s
> our overrides and is wired up in `app.config.ts` via
> `providePrimeNG({ theme: { preset: AedPreset, … } })`. Same effect
> (PrimeNG components consume AED brand), same source of truth (the
> preset's values are `var(--sc-…)` references), but expressed in
> the place PrimeNG expects in v21.

Cascade matters. Each layer reads tokens declared earlier in the chain.
A semantic token (layer 2) can reference a primitive (layer 1); a
component token (layer 4) can reference primitives or semantics; the
PrimeNG bridge (layer 6) reaches into all four.

## Rules

1. **Never declare `--p-*` variables manually.** PrimeNG emits them at
   runtime from the preset registered in `app.config.ts`. To change a
   `--p-*` mapping, edit [`aed-preset.ts`](./aed-preset.ts), not a
   CSS file.
2. Components must reference `--sc-*` tokens — never raw `#hex`, `Npx`,
   or numeric values for color, spacing, typography, or radius.
3. When adding a token, place it in the lowest applicable layer first
   (primitive → semantic → palette/component → extension), never higher
   up. If PrimeNG components need to consume it, also map the matching
   `--p-*` slot in `aed-preset.ts`.
4. To change a value globally, edit the lowest-layer declaration. Every
   alias above picks up the change automatically — including PrimeNG
   components, because the preset's values are `var(--sc-*)` references
   that resolve through the cascade.

## Adding a new token

```css
/* layers/01-primitive.css — add the raw value */
--sc-color-magenta-500: #d946ef;

/* layers/02-semantic.css — add a purpose-bound alias */
--sc-bg-magenta: var(--sc-color-magenta-500);
```

```ts
/* aed-preset.ts — (optional) expose to PrimeNG components */
primitive: {
  magenta: { 500: 'var(--sc-color-magenta-500)' },
}
```

Dark-mode behaviour: most aliases inherit through the cascade, so a
new semantic token usually does NOT need a dark override. Add an entry
in `07-dark.css` only when the dark variant has a different visual
shape (different surface tint, translucent overlay, etc.).

## Token naming

`--sc-<category>-<variant>-<modifier>`

- `<category>`: `color`, `text`, `bg`, `border`, `icon`, `font-size`,
  `line-height`, `font-weight`, `spacing`, `radius`, `shadow`, `z`,
  `transition`, `easing`, `presence`, `priority`, `label`.
- `<variant>`: scale step (`50`, `100`, …, `950`) or semantic name
  (`primary`, `danger`, `subtle`, `accent`, …).
- `<modifier>`: optional state (`hover`, `active`, `disabled`, `subtle`)
  or shade (`deep`, `available`, `paused`).

Examples: `--sc-color-blue-700`, `--sc-bg-primary-hover`,
`--sc-text-on-danger`, `--sc-radius-full`, `--sc-z-modal`,
`--sc-presence-available-deep`.
