# Decisions log

> Permanent record of decisions that shape the codebase. Each entry says what
> we decided, *why*, and what we discarded *and why*. We add to this file
> whenever a session locks in something that future contributors would
> otherwise have to re-derive.

---

## 1 — JSON design tokens win over the prototype's look (2026-05-05)

**Decision.** Brand visuals are driven by `design-tokens-complete.json`, not
by the React prototype's CSS.

**Concretely.** Primary color is blue/700 (`#1b273d`); accent is
soft-blue/500 (`#5ad3e6`); default border radius is 6 px (`radius-200`).
Typography scale (10 / 12 / 14 / 16 / 18 / 20 / 24 / 28 / 32 / 36 / 48 / 64
px) lives in tokens, not in component styles.

**Why.** The prototype was a low-fi monochrome with `--radius: 0`. The JSON
described the actual SmartContact brand. Building Angular against the proto
would have meant the design system was decorative.

**Discarded.** "Use the prototype look as-is" (decorative tokens) and "use a
hybrid" (proto density + JSON colors) were rejected for the same reason.

---

## 2 — Migrate every screen the prototype built; defer screens it never built (2026-05-05)

**Decision.** Every implemented React page becomes an Angular page. The 16
placeholder routes (Dashboard, Servicios, Conversaciones, Informes…) ship as
the same `PlaceholderPageComponent` that was used in the proto.

**Why.** The user owns the prototype and explicitly asked us to migrate "lo
construido". Trying to invent the unbuilt pages would expand scope without
upstream agreement.

**Discarded.** Building the supervisor dashboard from scratch (out of scope)
and dropping the placeholder routes (would silently change the URL contract).

---

## 3 — Stack: Angular 18 standalone + PrimeNG 18 (Aura) + signals + ngx-translate (2026-05-05)

**Decision.** Standalone components, signals for state, OnPush change
detection everywhere, signal-input API (`input()` / `output()` / `model()`).
PrimeNG with the **Aura** preset. `@ngx-translate/core` for runtime i18n.

**Why.** Aura is the only PrimeNG preset PrimeTek actively maintains and
matches the official Figma kit. Standalone + signals removes NgModule
boilerplate and wires up the reactive change graph correctly. ngx-translate
swaps locales at runtime, which Angular i18n nativo cannot do without a
rebuild.

**Discarded.** Angular Material (would conflict with PrimeNG theming),
NgRx / Akita (overkill — services + signals do the job), Angular i18n
nativo (rebuild-per-locale rules out a runtime language switcher).

---

## 4 — File-system convention: aliases + per-feature routes + flat pages (2026-05-05)

**Decision.** Every feature follows the same shape:
```
features/<scope>/<feature>/
├── <feature>.routes.ts      # composer mapped from the parent
├── data/                    # types + seed data
├── state/                   # @Injectable signal stores
├── components/              # feature-private UI
└── pages/<page>.component.{ts,html,scss,spec.ts}
```
Imports use `@core/*`, `@shared/*`, `@features/*` aliases (configured in
`tsconfig.json`). Sibling files inside the same feature stay relative.

**Why.** Predictability — a new contributor knows exactly where every file
goes without asking. Aliases keep cross-tree imports readable when feature
folders are 4–5 levels deep.

**Discarded.** Per-feature `pages/<name>/<name>-page.component.ts` (extra
folder for a single component is noise) and a flat `features/admin.routes.ts`
that grows linearly with every new page (rejected as it would have hit ~70
inline routes by Phase 3.7).

---

## 5 — Defer infrastructure-heavy migrations until first real consumer (2026-05-05)

**Decision.** These prototype patterns are deliberately not migrated yet:
undo stack with `Ctrl+Z`, cross-tab warning, navigation guard with
`DiscardDialog`, photo upload preview, inline-rename-while-editing on the
list page, column-visibility selector with localStorage persistence,
frozen-column tables.

**Why.** Each one is non-trivial (50–200 LoC of shared infra) and the
features in this migration round can ship credibly without them. Adding
them speculatively would inflate the diff and slow down the user-visible
progress.

**Discarded.** Doing 1:1 of every prototype hook now. Documented in
`roadmap.md` as deferred work; will land alongside the first feature that
actually requires them.

---

## 6 — CI uses `npm install`, not `npm ci` (2026-05-05)

**Decision.** Both `netlify.toml` and `.github/workflows/ci.yml` install
with `npm install --no-audit --no-fund` instead of `npm ci`.

**Why.** Karma 6.4 transitively pins `chokidar@3.x`; `@angular/compiler-cli`
18.2 transitively pins `chokidar@4.x`. npm's local install resolves the
two with a hoisted tree, but `npm ci` validates the lockfile strictly and
refuses the same tree (`npm error Invalid: lock file's chokidar@4.0.3 does
not satisfy chokidar@3.6.0`). Switching to `npm install` accepts the
resolved tree the same way local development does.

**Trade-off.** Slightly less reproducibility — two installs on different
days could theoretically resolve a different transitive minor. Acceptable
until we either drop Karma or pin overrides in `package.json`.

**Discarded.** `"overrides": { "chokidar": "^4" }` — would work but pins
through a Karma transitive that we did not author.

---

## 7 — Label colors are a separate token namespace (2026-05-05)

**Decision.** Eight tag colors (gray / red / orange / amber / green / teal /
blue / purple) live under `--sc-label-<color>-{bg,text,border,dot}` in
`sc-tokens.css`. Four of them (orange, amber, teal, purple) are not in the
JSON, so they are declared as direct hex values right next to the others
that piggy-back on the JSON scales.

**Why.** A "red" tag is not a "danger" signal and a "green" tag is not a
"success" signal. Folding label colors into the brand semantics would
couple unrelated meanings.

**Discarded.** Reducing the palette to the 4 JSON-mapped colors (would
break the prototype's seed data) and adding 4 full new color scales (88
tokens) for one-off label uses (over-engineering).

---

## 8 — Layout shift is a defect, not a stylistic nit (2026-05-06)

**Decision.** Components that toggle visibility or change state must not
push surrounding content. Bulk action bars overlay (always-reserved
bottom padding, `position: fixed`). Inline editors share the resting
cell's height. Validation slots reserve `min-height` so messages appear
*into* an allocated space.

**Concretely.** Three sites refactored: list pages no longer animate
`padding-bottom` on selection (always reserved). `InlineRenameCellComponent`
matches name-cell line-height with `min-height: 1.6em`. Presence selector
on Agents reserves `min-width: 96px` so the longest option label doesn't
re-flow the row.

**Why.** Visual stability is part of the "elegancia" the brand promises.
A bar that pops in by jolting content reads cheap, even when the rest
of the design is right.

**Discarded.** Animating the shift (transform/opacity instead of layout)
— still better than CLS but loses focus when the user is mid-interaction.
"Just adapt to whatever happens" — only acceptable when the user explicitly
caused new content to appear (e.g. duplicated row pinned to top).

---

## 9 — Inline duplicate edits the cell, not a new ghost row (2026-05-06)

**Decision.** When the user duplicates an entity from the list, the store
creates the draft (pinned to top via `isDraft`), and the list page enters
"renaming" mode for that row's name cell only. The cell renders an
`InlineRenameCellComponent` instead of the resting span. Cancel deletes
the just-created draft so no orphan "Copia de …" remains.

**Why.** The React prototype renders a separate ghost row below the source
with the editable name. Replicated literally in Angular, that ghost row
would push the rest of the table down — CLS. Editing the cell of the
already-pinned draft preserves the same UX (autofocus, edit-and-confirm,
toast on commit) without the shift.

**Discarded.** Literal port (ghost row below source) — broke the no-CLS
rule. "Edit only after navigating to form" — too many clicks for the
common case of "duplicate then change one word".

---

## 10 — `bulkUpdate` lives on the store, `BulkEditMenu` is field-shape-agnostic (2026-05-06)

**Decision.** Each domain store owns `bulkUpdate(ids, field, value)` with
a tightly typed `XBulkField` enum. The shared `BulkEditMenuComponent`
takes a generic `BulkEditFieldOption[]` shape and emits a `BulkEditCommit`
event — it knows nothing about Agents, Groups, etc. The list page
translates that commit into the domain field and opens
`ImpactPreviewDialog` with the affected rows for the user to prune
before commit.

**Why.** Field validation lives in the store (only fields the schema
allows). UX of "pick a field, pick a value, preview impact" is identical
across entities, so the menu stays generic. Keeps the dialog and the
store as separate concerns the page composes.

**Discarded.** A single `BulkEditPanel` that owns both the picker and
the dialog — reduces parent boilerplate but couples picker UX changes
to dialog UX changes. "Inline bulk edit in the action bar" (proto-style
dropdown that mutates immediately) — surprises the user; preview-then-confirm
is safer and matches the destructive-action pattern.

---

## How to add a new entry

When a session decides something load-bearing, append a numbered section
here. Lead with **what** in one sentence, then **why** (the actual reason,
not a paraphrase of the decision), and **what was discarded and why**. Date
in `YYYY-MM-DD` to anchor it in time.
