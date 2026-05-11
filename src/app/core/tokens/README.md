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
   **Fallback hex (`var(--sc-x, #aaa)`) counts as raw hex.** If you need
   a fallback, the token doesn't exist yet — add it to a layer.
3. When adding a token, place it in the lowest applicable layer first
   (primitive → semantic → palette/component → extension), never higher
   up. If PrimeNG components need to consume it, also map the matching
   `--p-*` slot in `aed-preset.ts`.
4. To change a value globally, edit the lowest-layer declaration. Every
   alias above picks up the change automatically — including PrimeNG
   components, because the preset's values are `var(--sc-*)` references
   that resolve through the cascade.

## "Which layer does my new token belong to?"

The mental model mirrors PrimeNG's: **primitive → semantic → component**,
plus two AED-only layers for things PrimeNG doesn't model.

| You want to express... | Layer | Examples |
| --- | --- | --- |
| A raw value (a specific gray, a specific radius step) | **01-primitive** | `--sc-color-gray-200`, `--sc-radius-200`, `--sc-spacing-250` |
| A *role* in the UI ("text-primary", "bg-surface", "border-default") | **02-semantic** | `--sc-text-primary`, `--sc-bg-surface`, `--sc-border-focus` |
| An AED-specific domain palette (agent presence, group priority, label color) | **03-palette** | `--sc-presence-available`, `--sc-priority-medium-deep`, `--sc-label-amber-bg` |
| A pre-baked spec for a specific reusable component | **04-component** | `--sc-btn-primary-bg`, `--sc-modal-radius`, `--sc-toast-padding-x` |
| Something PrimeNG doesn't model: z-index scale, motion, layout dims, shadow recipes | **05-extensions** | `--sc-z-modal`, `--sc-transition-fast`, `--sc-shadow-card`, `--sc-topbar-height` |

**Quick test when you reach for a value in a component's SCSS:**

1. Is this a *role* (border on focus, text muted, surface elevated)?
   → semantic. Use it.
2. Is it a *specific scale step* (gray-200, blue-500, spacing-300)?
   → primitive. Use it directly only if no semantic role exists. If
   you're using `--sc-color-blue-500` for "the primary brand color",
   reach for `--sc-bg-primary` instead.
3. Is it a *component spec* (button padding, modal radius)?
   → component layer. If it's a one-off, declare locally in the
   component SCSS — don't pollute the global component layer.
4. Is it *specific to AED's domain* (agent state, group priority)?
   → palette.

**When in doubt:** semantic over primitive. The semantic alias rarely
needs to change, but if it does, every consumer updates with it.

## PrimeNG-as-reference

When PrimeNG names a concept (`text.mutedColor`, `formField.shadow`,
`overlay.select.background`), **map our token to PrimeNG's name in the
preset, not the other way around**. PrimeNG's vocabulary is the
upstream source — `aed-preset.ts` is the bridge.

Where AED's semantic name diverges from PrimeNG's (e.g. our
`--sc-text-secondary` ↔ PrimeNG's `text.mutedColor`), the divergence
is intentional but **documented in the preset comments**, never
silent. New contributors coming from PrimeNG docs should be able to
trace any PrimeNG concept to the AED token it maps to.

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
