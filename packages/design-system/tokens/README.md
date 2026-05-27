# Design tokens

> Looking for the friendly, design-side walkthrough in Spanish?
> See [`GUIA.md`](./GUIA.md) — written for designers coming from Figma,
> with STAR-format walkthroughs of common situations ("I changed a brand
> color in Figma, how does it reach the product?", "I need a color that
> doesn't exist yet", etc.). This README is the technical reference.

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
| A raw value (a specific gray, a specific radius step) | **01-primitive** | `--sc-color-gray-200`, `--sc-radius-200`, `--sc-spacing-1` |
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

## Figma parity — `tokensprime.json`

`tokensprime.json` (this folder) is the **exported Variable Collections of the
Smart Contact Prime Kit** — the clean PrimeNG duplicate in Figma (only the
primary color is rebranded to our navy). It is the **metric source of truth**
when porting from Figma: every `scale`, `borderRadius`, and component sizing
value (`buttonSmFontSize`, `formFieldSmPaddingY`, `buttonIconOnlyWidth`…) is
the exact number Figma shows. The seven `layers/*.css` files remain the source
of truth for the *running app*; `tokensprime.json` is what we **check those
layers against**.

`npm run tokens:parity` (`scripts/token-parity.mjs`) does the diff, deterministically:

1. **scale / radius** — every export value must have a matching `--sc-scale-*` /
   `--sc-radius-*`.
2. **value → token map** — prints e.g. `5.25px → --sc-scale-0-375`, so when you
   inspect a Figma node the mapping into our vocabulary is exact, never eyeballed.
3. **component sizing** — verifies `sc-preset.ts` actually fixes the sm/lg
   paddings, font-sizes and icon-only widths the export declares.

It runs in the **pre-commit hook** and exits non-zero on any gap. Re-export from
Figma and overwrite `tokensprime.json` whenever the Kit's variables change; then
run the parity check and reconcile. Born in S62, after three "1:1" claims made
from memory/greps turned out false against the actual export.

## The scale — formal definition

The metric scale is a **single 14-based ramp**. Every `--sc-scale-{m}` token holds
exactly `m × 14px`:

| Token | Multiplier | Value |
| --- | --- | --- |
| `--sc-scale-0-375` | 0.375 | 5.25px |
| `--sc-scale-1` | 1 | 14px (the base — Kit Pro root font) |
| `--sc-scale-1-125` | 1.125 | 15.75px |
| `--sc-scale-12-5` | 12.5 | 175px |

**Naming is mechanical**: the suffix is the multiplier with `.` written as `-`
(`0.375` → `0-375`), negatives prefixed `neg-` (`-0.75 × 14 = -10.5px` →
`--sc-scale-neg-0-75`). So the name is derivable from the value alone —
`name(v) = (v < 0 ? "neg-" : "") + |v|/14` with dots → dashes. **Derive names from
the value, never from the export's key string**: the Kit export keys are lossy
(`scale125` = 175px = ×12.5, while `scale1125` = 15.75px = ×1.125 — the decimal
point isn't encoded). `v / 14` is unambiguous.

**Why 14, not 8**: the Kit Pro (a clean PrimeNG duplicate) bases its scale on the
14px root font, so steps land on 3.5 / 5.25 / 7 / 8.75 / 10.5 / 12.25 …, not on an
8px grid. When a SnowUI-flavored spec is drawn on an 8px grid, **snap each value to
the nearest 14-base step** rather than forking a parallel 8-grid ramp — keeps one
scale (see `customs-catalog.md §2.7`).

**Aliases, not parallel scales**: `--sc-spacing-*`, `--sc-font-size-*`,
`--sc-line-height-*` and `--sc-icon-size-*` are semantic aliases (layer 2) that
point *at* `--sc-scale-*`. There is exactly one ramp.

**Code-only steps** — three exist in code but not in the current `tokensprime.json`
export (surfaced by `tokens:parity` section 5):

- `--sc-scale-0` = `0` — reset, not a metric step.
- `--sc-scale-1-25` = 17.5px and `--sc-scale-2-5` = 35px — natural 14-base steps
  used by checkbox / dialog / hero. `customs-catalog.md` records them as Kit
  `scale.1-25` / `scale.2-5`, but they're absent from this export → **reconcile on
  the next Kit re-export** (either the team adds them, or we mark them SC-custom).

**Radius is a separate scale** — `--sc-radius-*` is **not** 14-based. It's a fixed
step set mirroring the Kit's `borderRadius`: `xs` 2 / `sm` 4 / `md` 6 / `lg` 8 /
`xl` 12, plus two SC customs (`2xl` 16, `full` 9999). Numeric aliases
(`--sc-radius-50/100/200/300/400/500`) map onto those steps for call sites that
prefer the numeric convention.

**Enforcement**: `tokensprime.json` is the metric source of truth; the `layers/`
are the source for the running app; `npm run tokens:parity` enforces export ⊆ code
(§1–2) + sizing value-parity (§4) + flags code-only steps (§5). `npm run
tokens:scale` derives the canonical `--sc-scale-*` set from the export (names by the
`v/14` law) and verifies `01-primitive.css` matches it — **including the naming law,
which parity doesn't check** (it only compares values); `--emit` prints the block to
paste. Both run in the pre-commit hook; drift blocks the commit. (Radius is out of
scope for the generator — a fixed 6-value set with no naming ambiguity, already
value-checked by parity §2.)

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
