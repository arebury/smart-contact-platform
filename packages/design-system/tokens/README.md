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

> **A note on "AED".** Throughout this technical doc, **AED** is the internal name
> of the supervision/config domain — the source folder is `features/config/aed/`,
> the preset is `aed-preset.ts`, and the layer-5 extensions are "AED-only". S67
> renamed the **user-facing** product surface to **Contact Center** (nav labels,
> the config index title, the breadcrumb), but the code paths, selectors and token
> names were intentionally left unchanged. So "AED" here = the engineering name of
> what the UI now calls Contact Center.

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

> **Component token-consumption is documented per component, not here.** The
> divider, for instance, consumes `--sc-border-default` (gray-200, `#dadfe6`); its
> Figma Kit node and variant axes are recorded in
> [`../docs/code-connect-mapping.md`](../docs/code-connect-mapping.md). This README
> covers the layers and the ramp, not each component's bindings.

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
8px grid. When an external spec is drawn on an 8px grid, **snap each value to
the nearest 14-base step** rather than forking a parallel 8-grid ramp — keeps one
scale (see `customs-catalog.md §2.7`).

**Aliases, not parallel scales**: `--sc-spacing-*`, `--sc-font-size-*`,
`--sc-line-height-*` and `--sc-icon-size-*` are semantic aliases (layer 2) that
point *at* `--sc-scale-*`. There is exactly one ramp.

> **Typography rides this same ramp — for now.** Today `--sc-font-size-*` resolve to
> `--sc-scale-*` steps (e.g. `--sc-font-size-200: var(--sc-scale-1)` = 14px;
> `--sc-font-size-900: var(--sc-scale-5)` = 70px). Detail in §"Typography — the
> migration-safe belt" below.
>
> ⚠️ **DD-13 (S72) decouples this.** The typography scale is decided to become **round**
> (12/14/16/18/20/24/32, rem root-16), **independent of `--sc-scale`** (spacing keeps the
> 14-base ramp; the letter gets its own round set). This README describes the **current
> code state** (still base-14-aliased); when DD-13 is reflected to code, `--sc-font-size-*`
> stop aliasing `--sc-scale` and `tokens:type-parity` retargets from base-14-snap to round.
> Canonical decision → **DD-13** in [`../docs/DECISIONS.md`](../docs/DECISIONS.md).
>
> **Unit = `rem`, not px (validated S72b).** PrimeNG ships type in `rem` — the Theme Designer
> converts Figma px → rem ÷16, and round sizes give clean rem (16→1, 24→1.5, 32→2). Our tokens are
> still **px today**, so we break PrimeNG's global scale dial (the `<html>` root font-size) and a11y.
> The px→rem migration is tracked in `../docs/inconsistencies-backlog.md` #88. Type variable naming is
> **per-layer**: the exposed layer (App, what the dev consumes → `--app-font-size`) uses slash
> hierarchy mirroring PrimeNG's dot-path; the scale primitive stays flat (`typography/font-size/14`,
> name=value, internal) — see DD-13.

**Code-only steps** — three exist in code but not in the current `tokensprime.json`
export (surfaced by `tokens:parity` section 5):

- `--sc-scale-0` = `0` — reset, not a metric step.
- `--sc-scale-1-25` = 17.5px and `--sc-scale-2-5` = 35px — natural 14-base steps
  used by checkbox / dialog / hero. `customs-catalog.md` records them as Kit
  `scale.1-25` / `scale.2-5`, but they're absent from this export → **reconcile on
  the next Kit re-export** (either the team adds them, or we mark them SC-custom).

> **Missing-token debt is tracked, not hacked.** Example: there is no single token
> for the page canvas (white in light / gray-950 in dark), so the config shell
> overrides it per theme as a stopgap. The fix — promote a `--sc-bg-canvas`
> primitive once it has ≥2 consumers, via the Figma Custom collection — is logged as
> debt #73 in [`../docs/inconsistencies-backlog.md`](../docs/inconsistencies-backlog.md).
> The rule: a gap goes to the backlog with a promotion plan, never a fallback hex
> (which Rule 2 already bans).

**Radius is a separate scale** — `--sc-radius-*` is **not** 14-based. It's a fixed
step set mirroring the Kit's `borderRadius`: `xs` 2 / `sm` 4 / `md` 6 / `lg` 8 /
`xl` 12, plus two SC customs (`2xl` 16, `full` 9999). Numeric aliases
(`--sc-radius-50/100/200/300/400/500`) map onto those steps for call sites that
prefer the numeric convention. The base steps are now **also generated** from the
export (`primitive.borderRadius*`) — see the bridge below.

**Enforcement**: `tokensprime.json` is the metric source of truth; the `layers/`
are the source for the running app; `npm run tokens:parity` enforces export ⊆ code
(§1–2) + sizing value-parity (§4) + flags code-only steps (§5) + **brand-colour
parity (§6, light+dark)** — it resolves our `--sc-*` tokens to hex through the var()
chain and asserts the primary ramp / surface scale / content match the export, so
colour drift (e.g. the navy hover step) fails the build instead of slipping by.
`npm run tokens:gen` derives the canonical `--sc-scale-*` set (names by the `v/14`
law) **and `--sc-radius-*`** from the export and verifies `01-primitive.css` matches
— **including the naming law parity doesn't check** (it only compares values);
`--emit` prints the blocks. Both run in the pre-commit hook; drift blocks the commit.

**Figma→code bridge (`npm run tokens:import` = `tokens:gen -- --write`)**: rewrites
the `--sc-scale-*` **and** `--sc-radius-*` blocks **in place**, between the
`/* @sc-gen:scale … */` … `:end` and `/* @sc-gen:radius … */` … `:end` markers in
`01-primitive.css`, straight from the export. This is the one manual seam automated:
a Figma metric change → re-export `tokensprime.json` → `tokens:import` → the cascade
propagates everywhere automatically. The cascade reaches **components too**: the
PrimeNG preset (`sc-preset.ts`) references these tokens (`paddingX: var(--sc-scale-0-75)`),
**never raw px** — every pinned component metric (button/formField/tabs/tooltip) is a
`--sc-scale-*` / `--sc-radius-*` / `--sc-font-size-*` reference, so it follows the
generated primitives with no hand-editing. **Scoped on purpose**: only the marked
regions are touched — colours, brand, aliases and comments stay hand-authored (brand
colours are a documented decision, guarded by parity §6, not auto-imported). Verified
idempotent. Unlike a full theme generator, it never rewrites the curated layers wholesale.

## Typography — the migration-safe belt

`font-size` is fully tokenized: every SCSS declaration reads a `--sc-font-size-*`
alias, never a literal `px`/`rem`. Those aliases ride the **same 14-base ramp** as
spacing (each one resolves to a `--sc-scale-*` step — see §"The scale"), so there is
no separate type scale to keep in sync. Why this is migration-safe: the type values
live in `--sc-*` plus the `sc-preset.ts` bridge, **not** inside PrimeNG — a PrimeNG
upgrade can't erase them. (Architectural rationale + the one residual risk — a
renamed `--p-*` slot, caught by parity — live in
[`../docs/migration-safety.md`](../docs/migration-safety.md).)

Three pieces enforce the belt:

1. **`npm run tokens:type-parity`** (`scripts/token-type-parity.mjs`) — a
   **read-only** sibling of `tokens:parity`, scoped to typography. It resolves each
   `--sc-font-size-*` to px through the 14-base ramp, then reports coverage
   (`var(--sc-font-size-*)` vs literal) and classifies any remaining literal into
   **wave 1** (snap Δ ≤ 0.5px, visually invisible) or **wave 2** (off-scale, needs a
   human call — e.g. `13px` → `font-size-200` for legibility, not the nearest
   12.25). Read-only: it never writes a token.
2. **Waves 1 + 2** (S67) tokenized **367** literal `font-size` declarations into
   `--sc-font-size-*`, taking coverage from **48% → 99% → 100% of actionable
   declarations**. The last off-scale display (an 88px hero) was snapped to
   `--sc-font-size-900` (70px = ×5).
3. **The Dura 4 guard** (`scripts/token-guard.mjs`, run in the pre-commit hook)
   blocks any **new** literal `font-size: Npx`/`Nrem` in component SCSS — it must be
   a `--sc-font-size-*` token. The allow-list is **empty** (0 exceptions): the belt
   is closed.

**`line-height` is deliberately NOT migrated** — those literals are deferred to a
later phase because retokenizing them carries layout-shift risk. They stay as-is for
now (tracked in [`../docs/inconsistencies-backlog.md`](../docs/inconsistencies-backlog.md) #74).
**Direction now decided** in DD-13 (S72: line-heights by rule — body ~1.5, headings ~1.25, even px);
implementation (reflect to code + visual diff) still pending.

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
