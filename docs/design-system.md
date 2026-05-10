# AED Design System

> Architecture and conventions for the AED design-token layer.
> The full token catalog lives at [`src/app/core/tokens/`](../src/app/core/tokens/).
>
> **Stack reference**: **Angular 21.2 + PrimeNG 21.1** (current
> `package.json`). The token-layering model below mirrors PrimeNG's
> design-token architecture; the bridge layer (06) is the inheritance
> layer that pipes AED's `--sc-*` source-of-truth tokens into the
> `--p-*` runtime variables PrimeNG components consume.

## TL;DR

The AED design system is built on a **seven-layer CSS-variable cascade**
that mirrors PrimeNG's official design-token model
(primitive → semantic → component → preset overrides) and adds two
layers PrimeNG doesn't provide:

| Layer | Concern | Token prefix | Example |
| :---: | --- | --- | --- |
| 1 | Primitive — raw values | `--sc-color-*` `--sc-spacing-*` `--sc-font-*` | `--sc-color-blue-700: #1b273d` |
| 2 | Semantic — purpose-bound aliases | `--sc-text-*` `--sc-bg-*` `--sc-border-*` `--sc-icon-*` | `--sc-bg-primary` |
| 3 | Domain palette — categorical color sets | `--sc-label-*` `--sc-presence-*` `--sc-priority-*` | `--sc-presence-available` |
| 4 | Component — pre-baked specs | `--sc-btn-*` `--sc-modal-*` `--sc-toast-*` | `--sc-btn-primary-bg-hover` |
| 5 | Extensions — outside PrimeNG's catalog | `--sc-shadow-*` `--sc-z-*` `--sc-transition-*` `--sc-sidebar-*` | `--sc-shadow-popover` |
| 6 | PrimeNG bridge — `--p-*` ↦ `--sc-*` | `--p-*` (only) | `--p-primary-500: var(--sc-color-blue-500)` |
| 7 | Dark mode — overrides for layers 2/3/4 | (re-declared inside `.aed-dark`) | `--sc-text-primary` flips to gray-50 |

Each layer is one CSS file under
[`src/app/core/tokens/layers/`](../src/app/core/tokens/layers/), loaded
in order by the [`index.css`](../src/app/core/tokens/index.css)
orchestrator. The cascade enforces direction: a layer can read from
itself or any earlier layer, never later.

## Why this shape

PrimeNG's design-token system has three abstraction layers
(primitive, semantic, components) that you compose via a JavaScript
`definePreset()` call which generates `--p-*` CSS variables at runtime.

AED already has its own token catalog (`--sc-*`), so we do the
equivalent thing in CSS instead of JS. **Layer 6** is the bridge —
every `--p-*` variable PrimeNG components might consume is redirected
to a `--sc-*` token. PrimeNG's runtime sees its own variable names;
they resolve to AED values. No fork, no preset compilation step.

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

The PrimeNG bridge in layer 6 inherits automatically: `--p-primary-500`
points at `--sc-color-blue-500` which is a primitive (constant), but
`--p-primary-color` points at `--sc-bg-primary` which IS overridden in
dark mode → so the brand colour shifts on PrimeNG components without
any extra dark declarations.

## Rules

1. **One source of truth.** `--sc-*` tokens are it. `--p-*` is a
   read-only mirror declared exclusively in layer 6.
2. **Components reference `--sc-*`, never raw values.** No raw `#hex`,
   `Npx`, or unitless numbers for color, spacing, typography, radius.
   Use a token; if the right token doesn't exist, add it.
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
  redirects, so AED branding wins.

## Adding a new component-level token

```css
/* layers/04-component.css */
--sc-card-bg: var(--sc-bg-surface);
--sc-card-border: var(--sc-border-subtle);
--sc-card-radius: var(--sc-radius-300);
--sc-card-padding-x: var(--sc-spacing-400);
--sc-card-padding-y: var(--sc-spacing-300);
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

Any time a PrimeNG component renders something AED hasn't styled, the
component reads its own `--p-*` tokens. Those tokens resolve through
the bridge (layer 6) to AED's `--sc-*` source of truth. Tags, badges,
toasts, dialogs, tooltips, dropdowns, datepickers — they all consume
the same brand palette without per-component overrides.

When PrimeNG ships a new version that changes which `--p-*` tokens it
reads, the only file that needs to change is layer 6. Everything else
is insulated.
