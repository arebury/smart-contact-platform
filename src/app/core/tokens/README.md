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
├── layers/
│   ├── 01-primitive.css       # raw values (color scales, font, spacing, radius)
│   ├── 02-semantic.css        # purpose-bound aliases (text, surface, border, type roles)
│   ├── 03-palette.css         # domain palettes (label hues, agent presence, group priority)
│   ├── 04-component.css       # pre-baked component specs (button, modal, toast)
│   ├── 05-extensions.css      # AED-only (layout dims, shadows, z-index, motion)
│   ├── 06-primeng-bridge.css  # `--p-*` redirected to `--sc-*` source of truth
│   └── 07-dark.css            # `.aed-dark` overrides for layers 2 / 3 / 4
└── README.md
```

Cascade matters. Each layer reads tokens declared earlier in the chain.
A semantic token (layer 2) can reference a primitive (layer 1); a
component token (layer 4) can reference primitives or semantics; the
PrimeNG bridge (layer 6) reaches into all four.

## Rules

1. **Never declare `--p-*` variables outside layer 6 (`06-primeng-bridge.css`).**
   They're a one-way mapping FROM the PrimeNG runtime INTO our `--sc-*`
   source of truth — equivalent to a programmatic `definePreset()` call,
   but readable as a flat file.
2. Components must reference `--sc-*` tokens — never raw `#hex`, `Npx`,
   or numeric values for color, spacing, typography, or radius.
3. When adding a token, place it in the lowest applicable layer first
   (primitive → semantic → palette/component → extension/bridge), never
   higher up.
4. To change a value globally, edit the lowest-layer declaration. Every
   alias above picks up the change automatically — including PrimeNG
   components, because the bridge layer points back to the same token.

## Adding a new token

```css
/* layers/01-primitive.css — add the raw value */
--sc-color-magenta-500: #d946ef;

/* layers/02-semantic.css — add a purpose-bound alias */
--sc-bg-magenta: var(--sc-color-magenta-500);

/* layers/06-primeng-bridge.css — (optional) expose to PrimeNG components */
--p-magenta-500: var(--sc-color-magenta-500);
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
