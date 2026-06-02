# Smart Contact Design System

> Architecture and conventions for the Smart Contact design-token layer.
> The full token catalog lives at [`src/app/core/tokens/`](../src/app/core/tokens/).
>
> **Stack reference**: **Angular 21.2 + PrimeNG 21.1** (current
> `package.json`). The token-layering model below mirrors PrimeNG's
> design-token architecture; the bridge layer (06) is the inheritance
> layer that pipes Smart Contact's `--sc-*` source-of-truth tokens into
> the `--p-*` runtime variables PrimeNG components consume.

## TL;DR

The Smart Contact design system is built on a **six-layer CSS-variable
cascade plus a JS-defined PrimeNG preset**. The CSS layers mirror PrimeNG's
official design-token model (primitive → semantic → component) and
add two layers PrimeNG doesn't provide; the JS preset replaces what
used to be the seventh CSS layer ("PrimeNG bridge"), aligned with
the v21-preferred way of customizing PrimeNG.

| Layer | Concern | Token prefix | Example |
| :---: | --- | --- | --- |
| 1 | Primitive — raw values | `--sc-color-*` `--sc-spacing-*` `--sc-font-*` | `--sc-color-blue-700: #1b273d` |
| 2 | Semantic — purpose-bound aliases | `--sc-text-*` `--sc-bg-*` `--sc-border-*` `--sc-icon-*` | `--sc-bg-primary` |
| 3 | Domain palette — categorical color sets | `--sc-label-*` `--sc-presence-*` `--sc-priority-*` | `--sc-presence-available` |
| 4 | Component — pre-baked specs | `--sc-btn-*` `--sc-modal-*` `--sc-toast-*` | `--sc-btn-primary-bg-hover` |
| 5 | Extensions — outside PrimeNG's catalog | `--sc-shadow-*` `--sc-z-*` `--sc-transition-*` `--sc-sidebar-*` | `--sc-shadow-popover` |
| 7 | Dark mode — overrides for layers 2/3/4 | (re-declared inside `.aed-dark`) | `--sc-text-primary` flips to gray-50 |
| **JS preset** | PrimeNG bridge — `--p-*` ↦ `--sc-*` | `--p-*` emitted by PrimeNG | `--p-primary-500: var(--sc-color-blue-500)` |

The CSS layers live under
[`src/app/core/tokens/layers/`](../src/app/core/tokens/layers/) and
are loaded in order by the
[`index.css`](../src/app/core/tokens/index.css) orchestrator. The
cascade enforces direction: a layer can read from itself or any
earlier layer, never later. The JS preset lives at
[`src/app/core/tokens/aed-preset.ts`](../src/app/core/tokens/aed-preset.ts)
and is registered in `app.config.ts` via
`providePrimeNG({ theme: { preset: AedPreset } })`.

(Layer 6 is intentionally absent — the previous
`06-primeng-bridge.css` was retired when we adopted
PrimeNG 21's JS-preset pattern. The numbering preserves the old
mental model so future readers know which layer is which.)

> This page is the **conceptual overview**. The canonical technical
> reference for the scale (the single 14-base ramp, naming law,
> `tokens:gen` / `tokens:parity` enforcement) and the token rules lives
> in [`../tokens/README.md`](../tokens/README.md). When the two
> overlap, README.md wins.

## Why this shape

PrimeNG's design-token system has three abstraction layers
(primitive, semantic, components) that you compose via a JavaScript
`definePreset()` call which generates `--p-*` CSS variables at runtime.

Smart Contact has its own token catalog (`--sc-*`) declared in CSS (the
six-layer cascade above). The bridge between the two — *which `--sc-*`
token feeds which `--p-*` slot* — lives in `aed-preset.ts`. The
preset's values are CSS-variable references like
`'var(--sc-color-blue-500)'`, so PrimeNG's compiler emits
`--p-primary-500: var(--sc-color-blue-500)` and the browser resolves
the `var()` at paint time. Same effect as a flat-CSS shadow, but
expressed in the place v21 expects (and shorter — Aura's preset
inherits all the parts Smart Contact doesn't override).

Two extra layers handle what PrimeNG leaves to per-component CSS:

- **Layer 3 — domain palette.** Categorical color sets that aren't
  brand semantics: the eight label hues a user picks for a tag, the
  five agent presence states, the three group priority rungs. They're
  not "danger" or "warning" or "primary"; they're orthogonal data
  colors.
- **Layer 5 — extensions.** Layout dimensions (sidebar widths, topbar
  height), the shadow scale, the z-index stack, motion tokens. PrimeNG
  has no equivalent — these are app-level concerns.

## How dark mode works

Layer 7 (`07-dark.css`) re-declares only the tokens whose dark variant
has a different visual shape. Most semantic tokens cascade through
unchanged because layer 1 primitives stay constant — flipping
`--sc-text-primary` from gray-800 to gray-50 is enough to recolour
every text reference downstream.

The PrimeNG preset inherits automatically: `--p-primary-500`
points at `--sc-color-blue-500` which is a primitive (constant), but
`--p-primary-color` points at `--sc-bg-primary` which IS overridden in
dark mode → so the brand colour shifts on PrimeNG components without
any extra dark declarations.

> **Known gap (S67):** there is no single semantic token for a page
> canvas (white in light / gray-950 in dark). Surfaces that need it
> currently override `:host` / `:host-context(.sc-dark)` locally. The
> clean fix — a `--sc-bg-canvas` token — is tracked as #73 in
> [`inconsistencies-backlog.md`](inconsistencies-backlog.md).

## Rules

1. **One source of truth.** `--sc-*` tokens are it. `--p-*` is a
   read-only mirror declared exclusively in layer 6.
2. **Components reference `--sc-*`, never raw values.** No raw `#hex`,
   `Npx`, or unitless numbers for color, spacing, typography, radius.
   Use a token; if the right token doesn't exist, add it. Typography is
   now fully tokenised: as of S67 every `font-size` resolves to a
   `--sc-font-size-*` token (one literal — the 88px display hero — is the
   only allow-listed exception, mapped to `--sc-font-size-900`), and a
   token guard blocks any new `font-size` literal. Tooling lives in
   [`../tokens/README.md`](../tokens/README.md); the migration-safe
   rationale lives in [`migration-safety.md`](migration-safety.md).
3. **Add tokens in the lowest applicable layer.** A new color goes in
   layer 1; the alias in layer 2; the bridge entry (if PrimeNG
   needs it) in layer 6. Never skip up.
4. **Dark mode is last resort.** Most additions don't need a dark
   override. Add to layer 7 only when the dark variant has a visually
   different shape, not just a different shade of the same primitive.
5. **PrimeNG-side overrides go in layer 6, not the component.** Don't
   override `.p-button` directly; if PrimeNG's button doesn't read
   the right value, add the missing `--p-*` redirect to layer 6.

## Wiring

The runtime entry points are:

- [`src/styles/main.scss`](../src/styles/main.scss) — loads
  `core/tokens/index.css` so the cascade is in the global scope.
- [`src/styles/_tokens.scss`](../src/styles/_tokens.scss) — re-exports
  the same import for SCSS partials that need access to the tokens.
- [`src/app/app.config.ts`](../src/app/app.config.ts) — registers the
  `Aura` preset with `darkModeSelector: '.aed-dark'`. The preset's
  default values are immediately shadowed by layer 6's `--p-*`
  redirects, so Smart Contact branding wins.

## Adding a new component-level token

```css
/* layers/04-component.css */
--sc-card-bg: var(--sc-bg-surface);
--sc-card-border: var(--sc-border-subtle);
--sc-card-radius: var(--sc-radius-300);
--sc-card-padding-x: var(--sc-spacing-1-5);
--sc-card-padding-y: var(--sc-spacing-1-125);
--sc-card-shadow: var(--sc-shadow-card);
```

Then use it in the component's SCSS:

```scss
.card {
  background: var(--sc-card-bg);
  border: 1px solid var(--sc-card-border);
  border-radius: var(--sc-card-radius);
  padding: var(--sc-card-padding-y) var(--sc-card-padding-x);
  box-shadow: var(--sc-card-shadow);
}
```

If the dark variant needs different colors, append:

```css
/* layers/07-dark.css */
.aed-dark {
  --sc-card-bg: var(--sc-color-gray-900);
  --sc-card-border: var(--sc-color-gray-800);
}
```

## Inheriting from PrimeNG

Any time a PrimeNG component renders something Smart Contact hasn't
styled, the component reads its own `--p-*` tokens. Those tokens resolve
through the bridge (layer 6) to Smart Contact's `--sc-*` source of
truth. Tags, badges,
toasts, dialogs, tooltips, dropdowns, datepickers — they all consume
the same brand palette without per-component overrides.

When PrimeNG ships a new version that changes which `--p-*` tokens it
reads, the only file that needs to change is layer 6. Everything else
is insulated.
