# Decisions log

> Permanent record of decisions that shape the codebase. Each entry says what
> we decided, *why*, and what we discarded *and why*. We add to this file
> whenever a session locks in something that future contributors would
> otherwise have to re-derive.

---

## 43 — List-page action bar is sticky on scroll, with a 12 px gradient mask, no backdrop blur (2026-05-07)

**Decision.** The `.page__action-bar` (column manager + search +
export divider + export button) on agents, users and groups uses
`position: sticky; top: 0;` so it stays reachable as the user
scrolls long lists. A `::after` pseudo-element below the bar paints
a 12 px `surface → transparent` gradient so table content slides
under the bar gradually instead of cutting off at a hard edge.
**No `backdrop-filter: blur(...)`** — that's the AI-SaaS-default
fingerprint and we walk away from it everywhere else (DD#39).

**Why.**
- For long lists (200+ entries on the production-scale future),
  search is iterative: type → scroll → refine → repeat. A sticky
  search input removes the round-trip.
- The column manager + export are secondary tools but useful
  mid-scroll (e.g. selecting rows then exporting just the visible
  set). Keeping them anchored saves a return trip.
- The pattern is convention in admin tools (Linear, Notion, GitHub,
  Airtable). The "edited" version vs convention is the gradient
  mask + the explicit no-blur rule.

**Discarded.**
- **`backdrop-filter: blur(20px)`** — recognisable AI-SaaS pattern.
  Solid surface + soft gradient looks deliberate.
- **Hide-on-scroll-down / show-on-scroll-up** (Linear pattern) —
  rejected because the motion is distracting while reading and
  breaks the "always reachable" expectation that justifies sticky
  in the first place.
- **Compact-when-stuck** (smaller padding + icon-only buttons once
  the bar reaches `top: 0`) — useful when the dataset is large and
  every vertical pixel counts. Documented as the next iteration in
  `roadmap.md` "Future-leaning, already prototyped". Needs an
  `IntersectionObserver` sentinel because CSS doesn't expose a
  `:stuck` pseudo-class. Held off because today's seed (~30
  entities) doesn't make the trade-off worth the complexity.

**Real estate accounting (1366×768 enterprise laptop).** Topbar
(56) + page header (~80) + sticky action bar (~60) = ~196 px of
fixed chrome before the table starts. On a 768 px viewport that
leaves ~520 px for table content, ~7-8 rows visible. Acceptable;
if an audit ever calls it cramped, "compact-when-stuck" is the
next move.

**How to roll back.** Revert the `position: sticky` block + the
`::after` pseudo on the three list pages' SCSS files. The action
bar returns to in-flow scrolling. ~5 minutes.

---

## 42 — Sistema page is the prototype-only kitchen sink (2026-05-07)

**Decision.** The `/config/sistema` page hosts two unrelated
features that share the property of being prototype-only or
prototype-adjacent:
  - **Apariencia** — the three-state theme picker
    (Claro / Oscuro / Sistema), production-ready, owned by
    `ThemeService`.
  - **Datos** — the "Restaurar datos de fábrica" button, prototype-
    only, removed when the real backend lands. See DD#38.

**Why this structure.** The two affordances have different
lifecycles (theme is permanent; reset is temporary), but they
share the same conceptual "system / settings" home. Splitting
them into two pages would inflate the config sidebar tree for
no real reason. Grouping them on `/sistema` lets the prototype
ship the reset path without giving it more UI weight than it
deserves, and makes the eventual deletion of the reset section
(when the backend lands) a clean local change.

**Discarded.** Putting the reset button on a separate
`/config/datos` page — over-architecture for one button.

**How to apply.** New cross-cutting client-side preferences land
in this same page as additional `<section class="card">` blocks.
Production-only items go above the fold; prototype-only items go
below with a clearly-labelled section title.

---

## 41 — Avatar system: two pools (illustrated + abstract), deterministic hash, photo override, hover zoom via CSS (2026-05-07)

**Decision.** A single `<aed-illustrated-avatar>` component drives
every entity-shaped avatar slot in the app. Two SVG pools live under
`src/assets/avatars/`:
  - `illustrated/` — 24 person portraits. Default. Used wherever
    the entity is conceptually a person (agents, users, the topbar
    supervisor avatar).
  - `abstract/` — 3 non-personal abstract patterns. Used for
    entities that are NOT people (groups). Picked via `[pool]
    ="'abstract'"`.

The component picks one SVG from the active pool by hashing the
entity name (djb2 + modulo). When `[photo]` is set, the photo wins.
Hover applies a `transform: scale(1.125)` to the inner SVG inside
an outer wrapper with `border-radius: 50%; overflow: hidden;` —
the SVG's own circular clip-path scales along and the outer
wrapper re-clips, producing the same "image fills more of the
circle on hover" effect as the Figma source's separate `Default` /
`Hover` SVG pair without shipping two assets.

`PhotoUploadComponent` accepts an optional `[name]` so its
no-photo placeholder renders the same hashed illustration the
list shows — the form preview matches the row cell.

**Why.**
- **Initials over hashed colour was the original treatment**
  (`EntityAvatarComponent`). It read fine in dense lists but
  flat in detail / form views. The illustrated portraits have
  more personality without claiming photographic realism.
- **Hashing instead of an avatar picker** keeps the form simple
  and the avatar consistent across pages without an extra UI
  surface to maintain. Same name → same illustration, every page,
  every reload.
- **Two pools instead of one** because assigning a person face to
  a group like "Ventas Nacional" reads accidental — the same
  shape as the original initials problem in reverse. The abstract
  pool ships only 3 patterns (intentionally low variance — groups
  rarely number in the dozens, so collisions are tolerable).

**Discarded.**
- **Manual avatar picker.** Considered for the agent form (the 8
  named avatars in `src/assets/avatars/named/` are kept around for
  this in case it's ever wanted). Cut for now: the deterministic
  hash already removes the "blank face" problem; an admin picking
  an avatar manually is one more form step without a clear use
  case yet.
- **Group avatar as a horizontal stack of member portraits**
  (`special/group.svg`, the 120×24 strip). Rejected because the
  strip is too horizontal to fit a row cell — kept as an asset for
  a future "group members" surface (member roster, dashboard
  card) where its aspect ratio works.
- **Loading both `Default.svg` and `Hover.svg` at runtime to
  toggle on hover.** Rejected because the same effect is one CSS
  transform on the original asset.

**How to roll back.** Revert agents-list and groups-list HTML to
the previous `<aed-entity-avatar>` (initials on color); the
component is still in the registry. Revert the
`PhotoUploadComponent.name` input to drop the illustrated
fallback. The 24+3 SVGs can stay shipped — they're small.

---

## 40 — Column manager: visibility + order via CDK Drag-Drop in a popover, never on the header (2026-05-07)

**Decision.** Each list page exposes column **visibility** AND
**display order** through the same popover (the column-selector icon
button in the action bar). The popover renders one row per column
with a checkbox (visibility) and a vertical-grip handle (drag
target). Reorder is implemented with `@angular/cdk` drag-drop. State
is persisted to `localStorage` as a `string[]` of visible keys in
display order. Header columns themselves are NOT draggable.

**Why.** Three options were on the table when reorder was requested:

  - **(a) Migrate to `<p-table>` for `[reorderableColumns]="true"`.**
    Rejected because of DD#39 — kills the custom design system.
  - **(b) CDK Drag-Drop inside the column-manager popover.** The
    convention used by Notion, Linear, Airtable's settings panels,
    GitHub's project boards. Discoverable via the explicit "columns"
    affordance, low layout risk (the popover handles overflow
    locally), no contention with sortable headers (which already
    consume header clicks).
  - **(c) Drag from the `<th>` headers themselves**, spreadsheet-
    style. Rejected as too rare in admin tools — users don't expect
    `<table>` headers to be draggable, and the gesture collides
    with the existing sort-on-header-click. Plus it requires
    custom drop-zone math across cells, a lot of code for a
    rarely-used affordance.

Locked columns (e.g. `name`) are NOT draggable and pin to the top
of the menu. The data-driven render loop keeps them at slot 0 of
every row (after the leading checkbox column). The `<th
class="table__th-actions">` slot at the row's tail is also fixed —
not in the column manager at all, hard-coded in the template.

The persisted shape is `string[]` (visible keys in order) instead
of `Set<string>`. This carries both axes (visibility + order) in
one value with no schema duplication. Reading the stored list:
  - keys not in the current declaration are dropped (column
    removed from code);
  - newly-declared keys not in the stored list are appended in
    declaration order, honouring `defaultVisible: false` if set
    (so a developer can add a hidden-by-default column without
    surprising existing users).

`storageKey` carries a `_v<N>` suffix; bumping invalidates stale
caches. Bumped to `_v2` in this commit for agents and groups when
the schema changed and `code` shipped hidden by default.

**Discarded.**
- A separate "Reset" button per axis (one for visibility, one for
  order). The single "Restablecer" link in the popover head resets
  both — clearer mental model.
- Header-drag fallback for keyboard users. Reorder is currently
  mouse-only via the grip. Considered acceptable because the
  feature is power-user adjacency; keyboard-only users still get
  visibility checkboxes and the columns render in declaration
  order if they never reorder.

**How to roll back.** Strip the CDK imports from
`column-selector.component.ts`, drop the grip from the row
template, and emit the `Set<string>` again instead of `string[]`.
The list pages already accept `(visibilityChange)` for backward
compat — no template changes required to lose reorder, only to
lose the order axis.

---

## 39 — Hybrid table architecture: native `<table>` + custom `.sc-*` design system, no PrimeNG p-table (2026-05-07)

**Decision.** The three list pages (agents, users, groups) keep using
native HTML `<table>` markup styled by a hand-rolled `.sc-*` design
system (`.sc-label`, `.sc-channel-row`, `.sc-type-tag`, `.sc-icon-btn`,
`.sc-action-divider`, `.sc-table-zebra` — all in
`src/styles/_table-elements.scss`). PrimeNG's `<p-table>` is **NOT**
adopted, even though the project already loads PrimeNG.

**Why.** The audit pass that produced these tokens (commit `11dceab`,
"replace AI-default chrome with custom design system") explicitly
called out the dot+text status pill, identical-chip channels column,
generic ghost export button and `MoreHorizontal` row menu icon as the
most recognisable AI-default tropes in the screen. The `.sc-*`
vocabulary replaced each of those with a deliberately edited
treatment (typographic uppercase tracked label on a tinted bg, bare
icons tinted per channel, 32px ghost square + 1px divider, vertical
ellipsis). Migrating to `p-table` would force most of that work to
either be redone fighting PrimeNG's selectors, or to be lost
entirely — `p-table` ships a strong opinionated chrome that is the
exact convention we walked away from.

The hybrid name comes from this split:
  - **HTML semantics** stay native: `<table>`, `<thead>`, `<tbody>`,
    `<tr>`, `<th>`, `<td>`. Screen readers, keyboard navigation,
    print, and copy-paste all work the way browsers expect — no
    custom ARIA scaffolding required.
  - **Design system** is custom: every cell type (`status`,
    `channels`, `type`, `actions`) renders through a `.sc-*` class
    owned by us, so the visual language is a single source of truth
    across the three list pages.
  - **Render logic** is Angular component-driven: each list page
    composes `aed-illustrated-avatar`, `aed-group-popover`,
    `aed-inline-rename-cell`, `aed-bulk-edit-menu`, etc into the
    `<td>` slots it needs. We get the productive pieces of
    component-driven UI without ceding the chrome to a black-box
    grid component.

**Discarded.**
- **`<p-table>` migration** (option a in the audit). Cost: rewrite
  the three list pages, fight `:host ::ng-deep` to override
  `.p-datatable-*` selectors that don't accept the `.sc-*` tokens
  cleanly, lose `cdk drag-drop` integration ergonomics. Benefit:
  built-in pagination + filters + virtual scroll. We don't need
  those at the current dataset sizes.
- **CSS Grid table** (with `display: grid` on `<table>`). Cost:
  loses semantic table behaviour at a11y boundary. Benefit:
  finer-grained cell layout. Not worth the trade.

**How to roll back if production needs `p-table`.** Drop
`src/styles/_table-elements.scss`, remove the `@use 'table-elements'`
line in `main.scss`, replace each list-page table with `<p-table>`
+ column templates, and accept that the agents/users/groups screens
will adopt PrimeNG's chrome. Estimate: ~1 day per list page.

---

## 38 — Factory-reset for app data is prototype-only (2026-05-06)

**Decision.** The "Restaurar datos de fábrica" button in
`/config/sistema` (`SistemaPageComponent.resetData()`) is a
prototype-only affordance. It clears every `smartcontact_*`
localStorage key and reloads so each store re-seeds from its
in-code defaults. Production strips this button.

**Why.** The whole app runs on `createLocalStore` — there is no
backend, so the only "source of truth" is each store's `defaults`
seed. A tester exploring the prototype can easily delete seed
agents/groups/users while clicking around and end up with an empty
list and no way back short of clearing browser storage manually.
The button is the supported escape hatch.

It deliberately does NOT clear theme, column visibility prefs, or
any non-data UI state — only keys under the `smartcontact_` prefix.

**How to roll back when production lands.** Remove the "Datos"
section from `sistema-page.component.html`, drop `resetData()` and
its imports from the component, delete the i18n keys under
`config.sistema.data.*` in `assets/i18n/es.json`, and remove this
DD entry. ~10 minutes of cleanup.

**Discarded.** A `localStorage.clear()` button — too aggressive,
would also wipe theme + column prefs that the user actively
configured. The prefix filter keeps the action surgical.

---

## 37 — Command palette and shortcuts overlay are prototype-only (2026-05-06)

**Decision.** The `<aed-command-palette>` (⌘K / Ctrl+K) and
`<aed-keyboard-shortcuts>` (`?`) overlays are mounted in this
prototype to demo a "modern-SaaS personality" upgrade, but they are
explicitly NOT marked as production features. Final dev decides
whether to keep them based on whether the demo earns the complexity
they introduce (global keydown listener, modal-layer chrome,
command catalogue). Their absence is also explicitly OK — the rest
of the app works unchanged without them.

**Why.** Command palettes are the canonical "modern SaaS"
signature (Linear / Notion / Vercel / Stripe / GitHub all ship one),
and an admin tool with this many list pages benefits from a
"jump anywhere" shortcut. But the cost is real: a global keydown
handler, a service-driven modal mounted in the app shell, a
command catalogue derived from the nav tree, and a maintenance
contract for adding new commands as features ship. The team
hasn't agreed yet that the cost is justified — the prototype
lets the team feel it before deciding.

**How to roll back if not adopted.** Delete the component folders
(`shared/components/command-palette/`, `shared/components/keyboard-
shortcuts/`), drop the `<aed-…>` tags from `app.component.html`,
remove the registry entries in `shared/components/index.ts` and
`core/services/index.ts`, delete the `.page__search-kbd` rule in
`main.scss`, and strip the `<kbd class="page__search-kbd">⌘K</kbd>`
markup from the six list-page templates. ~30 minutes of cleanup.

**Discarded.** Shipping the palette as a "1.0 feature" without the
team having seen it — technically simpler but bypasses the team's
input on a load-bearing UX call.

---

## 36 — Typography roles match the Figma spec 1:1; brand fonts loaded explicitly (2026-05-06)

**Decision.** Updated `sc-tokens.css` so every Smart Contact Figma
typography role (display-1, H1–H4, subtitle-1/2, body-1/2/3, caption,
caption-bold) has exact-pixel parity with the design system: font-size,
line-height, font-weight and font-family are all addressable as
`--sc-font-{size,weight,family}-{role}` and `--sc-line-height-{role}`.
Inter (400/500/600/700) and Open Sans (400/600) now load explicitly
from Google Fonts in `index.html` with `preconnect` warm-up and
`display=swap` so the page paints with the fallback first. Four
page-title SCSS files (`labels`, `repos-list`, `repos-hub`, `templates`)
that referenced `--sc-line-height-400` for an H3 now use the semantic
`--sc-line-height-h3` token directly.

**Why.** Two gaps were hidden in the previous setup:
1.  The token `--sc-font-family-primary: 'Inter', system-ui, sans-serif`
    was declared, but no `<link>` to Google Fonts existed in
    `index.html`. The browser silently fell back to `system-ui` for
    every screen, drifting the entire UI away from the Figma. This is
    the kind of mismatch that goes unnoticed in design review until a
    visiting designer points at a heading and says "that's not Inter."
2.  Four primitive line-heights were 1–2 px off (`-400: 27 → 28`,
    `-700: 54 → 52`) and two were missing (`-450: 30` for H3,
    `-650: 48` for H1). The `27` line-height was accidentally adopted
    by four list-page titles that wanted H3, baking the drift in.

Adding **explicit semantic role tokens** (instead of forcing every
consumer to compose `font-size + line-height + weight + family`
manually) closes the loop: a future component that needs an H4 just
references `--sc-font-size-h4` + `--sc-line-height-h4` +
`--sc-font-weight-h4` and gets exactly the Figma value.

**Discarded.** A bundled CSS class per role (`.sc-text-h3 { ... }`) —
nicer DX but pulls the project away from the token-only architecture
and adds a parallel system. The role tokens give the same parity
without introducing a class layer. Loading H5 / Public Sans (a third
family that appears in one Figma node but not the canonical
type-scale node) — punted; introduces a third font for a use case
nobody needs today and the spec itself is internally inconsistent
between the two Figma typography pages.

---

## 35 — Collapsed sidebar shows the full icon column; hierarchy on hover only (2026-05-06)

**Decision.** When the sidebar is collapsed (no hover, no
`:focus-within`), depth-1+ nav items collapse onto the depth-0
left padding via `--sidebar-pad-l-{0,1,2,3}` locals declared on
`.sidebar`. Children of expandable parents stay rendered (no
`display: none`), so every icon — top-level parents, their
children, grandchildren — sits in a single clean vertical column.
Labels and chevrons fade to `opacity: 0` so partial letters
("V…") never bleed past the gutter edge. A new `effectivelyExpanded`
computed (`expanded() || isChildActive()`) auto-renders the
children of whichever branch contains the current route — the
active page's icon is always visible without the user having to
click the parent first. Hierarchy in the collapsed view is
communicated by **icon size** (16 / 14 / 13 px from the existing
`iconSize` ramp), not indentation. After every `NavigationEnd`
the sidebar component blurs whatever inside it still has focus,
so a click on a nav item doesn't pin the sidebar in its expanded
state via `:focus-within`. The width transition has a `100 ms`
delay on collapse and `0 ms` on expand, so cursor jitter past the
gutter doesn't flicker.

**Why.** Without flattening, a previously-expanded section's
children showed their icons at `padding-left: 32 / 48 px`, which
is past or near the 64 px collapsed-gutter edge — partially
clipped, reading as broken. Without auto-expanding the active
branch, navigating to a deep route (e.g. `/admin/agentes` under
"Administración") rendered the section's children, but navigating
to a sibling deep route under a different section that wasn't
`defaultExpanded` would not. Flattening + auto-expand together
guarantee that the collapsed sidebar always shows the active
page's icon, and clicking it from the collapsed state works
without pre-expansion. Hiding labels via `opacity` (instead of
relying on `overflow: hidden` to clip them) is the only way to
prevent the "V…" partial-letter bleed at the column edge —
clipping leaves ~12 px of letter visible.

**Discarded.** Keep the previous "only top-level parents visible
when collapsed" behaviour — loses the active-page-context cue.
Show ALL children of ALL sections when collapsed (regardless of
expand state) — too dense, no respect for user-controlled
expansion. Tooltip-only labels on hover of individual icons —
fights with the whole-sidebar hover-expand pattern; would need a
separate interaction model.

---

## 34 — List-page count removed entirely; no header / footer count component (2026-05-06, amended)

**Decision (current).** No count component lives on the list pages.
The bottom-of-table `<aed-result-counter>` was removed in Session 7,
and the inline `<aed-page-title-count>` (rendered inside the
`<h1>` as `· 14` or `· 12 de 57`) — added in the same session as
its replacement — was removed in Session 8 and the component folder
deleted.

**Why this changed.** The first iteration of this entry kept a
counter "with sense" inline in the heading, on the theory that
filter context is meaningful. In review the inline `·` separator +
small grey number read as the same AI-dashboard touch the original
footer counter was — just relocated. In a non-paginated table the
operator already sees the rows; the counter was decorative chrome,
not information.

**Where filter feedback should live (when needed).** Inside or
adjacent to the search input, surfaced only when a filter is
active (e.g. a small "12 resultados" hint that disappears when
the search clears). Out of scope for this session — added when
a real flow demands it.

**Discarded.** Keeping the inline header count "with sense" — it's
still slop in disguise. A floating pill near the search field —
adds positioning complexity for marginal information value.

---

## 33 — Toasts live bottom-right at a fixed 400 px width; indigo wires PrimeNG `secondary` (2026-05-06)

**Decision.** `<p-toast position="bottom-right">` (was `top-right`)
plus `--sc-toast-width: 400px` applied as a single fixed width on
`.aed-toast` (was `min-width: 320px; max-width: 440px`). PrimeNG's
`severity: 'secondary'` is the canonical "indigo" variant for
neutral notices (state changes, draft creation), wired in the SCSS
via `[data-severity='secondary']` and in `iconFor()` so it shares
the `Info` glyph but uses the indigo palette. Three "duplicado como
borrador" toasts (groups, agents, users) reclassified
`success` → `secondary`.

**Why.** Top-right toasts sat directly over the page header CTAs
("Crear", "Exportar") on every list page — operators reported
covered controls. The original concern about top-right preserving
visibility-over-modals dissolved on inspection: by the time a
post-action toast fires, the modal has closed, so the position is
irrelevant. Bottom-right anchors the toast to the same corner as
the bulk action bar (DD#28), keeping notification space conceptually
unified. Fixed width keeps the visual stack aligned regardless of
message length — short notices don't shrink to 320 px while long
ones balloon to 440 px, which previously made stacked toasts read
as visually unrelated. Indigo for "duplicado": creating a draft
isn't really a celebration of user intent (the user clicked
"Duplicar" and got a side-effect — a draft entity); the indigo
"neutral notice" tone is honest about that.

**Discarded.** Position-aware toasts that flip top↔bottom based on
modal state — solves a non-problem and adds maintenance. Width
clamp via `min/max-width` with content-driven sizing — gives the
inconsistent stack widths we just removed.

---

## 32 — Sidebar collapses to a 64 px gutter, expands on hover via fixed-position overlay (2026-05-06)

**Decision.** `<aed-sidebar>` is `position: fixed` with width
`--sc-sidebar-width-collapsed: 64px` by default and transitions to
`--sc-sidebar-width-expanded: 240px` on `:hover` / `:focus-within`.
The page-layout reference `--sc-sidebar-width` aliases the collapsed
value, so every fixed element anchored to the right of the sidebar
(bulk action bar, etc.) reserves the gutter and never reflows when
the sidebar expands. The expanded sidebar OVERLAYS the page content
instead of pushing it. CSS-only — no toggle button, no JS state.

**Why.** The operator profile (calm·dense·operational) values screen
real estate; a 220 px sidebar always-on stole 14 % of viewport width
on a 1440 px display while the user is actively working in tables
that benefit from every extra column. Hovering to expand is the
Notion / Linear pattern — users discover it on the second day, never
forget it, and avoid the toggle-button accidental clicks. Overlay
(rather than push) means no page reflow during the 200 ms expand
transition, which would otherwise janky-shift the table the user is
mid-clicking. The brand follows: a 32 px isotype is always visible
(centered in the 64 px gutter via `margin-left: calc(...)`); the
"SmartContact / a Digital Virgo tool" wordmark fades in on expand.

**Discarded.** Click-to-toggle pattern (Linear / Slack) — adds a
button to find and a state to persist; less elegant for an
always-active sidebar in an admin panel where nav happens
constantly. Always-expanded fixed 240 px sidebar — wastes pixels on
list pages where the table benefits from every column. Push-to-shift
expansion (no overlay) — every page would jitter on cursor entry into
the sidebar.

---

## 31 — Tokens JSON (DTCG) deferred; `sc-tokens.css` stays the source of truth (2026-05-06)

**Decision.** No tokens JSON spec yet. `sc-tokens.css` remains the
single source of truth for visual decisions: primitives in §1,
semantic aliases in §2, custom extensions (shadow, z-index, motion)
in §3, PrimeNG `--p-*` overrides pointing at `--sc-*` in §4. New
tokens are added directly here.

**Why.** A full DTCG / Style Dictionary / Tokens Studio pipeline is
the right end state — bidirectional Figma ⇄ JSON ⇄ code sync, no
drift, scriptable theme changes — but the migration is still fresh
and the tokens are still cristalizing. Building the pipeline now
would freeze decisions that may still need to flex. Deferred until
the design system stabilizes, with a phased rollout queued for when
the moment arrives:

1. Mirror today's `sc-tokens.css` into a DTCG-format `tokens.json`.
   Documentation pass only — no behavior change.
2. Flip the dependency: `tokens.json` becomes the source; a build
   step regenerates `sc-tokens.css` (and the `--p-*` overrides).
3. Integrate Tokens Studio (Figma plugin) so designer-side edits
   round-trip into the JSON.

**Discarded for now.** Standing up Style Dictionary today —
premature infrastructure. Hand-maintained JSON + manual CSS regen
— gives drift between the two artifacts with no real win over CSS
alone.

---

## 30 — Programmatic confirms render through a single `aed-modal`-backed host (2026-05-06)

**Decision.** A `ConfirmHostService` (`@core/services`) exposes
`request(opts): Promise<boolean>` plus `visible` / `state` signals.
A single `<aed-confirm-host>` component, mounted once in
`app.component.html`, binds those signals to an `<aed-modal>` and
routes button clicks back into the service.
`DiscardDialogService.confirm()` keeps its public signature and now
calls `confirmHost.request({...})` internally. `ConfirmDialogModule`
+ PrimeNG's `ConfirmationService` removed from `app.config.ts` and
`app.component.ts`.

**Why.** `ConfirmationService` rendered the raw PrimeNG
`<p-confirmDialog>` chrome — different geometry, no leading icon
slot, no `aria-labelledby` to a stable id, none of the Figma
1037:34069 visual decisions. The DX of `await`-ing a Promise was
worth keeping; the visual layer just needed to route through the
canonical shell. One host instance handles every programmatic
confirm in the app (today: discard-changes; tomorrow: sign-out,
bulk discard, etc.) so a future tone change is a single edit.

**Discarded.** Convert each consumer to a declarative
`<aed-discard-dialog>` per page — works but loses centralization
and forces every dirty-aware page to wire it up. Keep
`<p-confirmDialog>` and theme it via overrides — possible, but the
overrides would have to fight PrimeNG header geometry, and the
icon slot still wouldn't exist.

---

## 29 — Destructive actions live in an end-of-form danger zone, not the sticky header (2026-05-06)

**Decision.** The "Eliminar" button on Group / Agent / User edit pages
moved out of `<aed-sticky-form-header>` and into a shared
`<aed-form-danger-zone>` rendered at the bottom of each form (only
when `mode() === 'edit'`). The zone is a single white card with a
`red-200` border, gray-800 title, gray-600 description, and a
right-aligned `btn--danger-subtle` trigger.
`<aed-sticky-form-header>` lost `canDelete`, the `delete` output,
the `trashIcon`, and the now-dead `--ghost-danger` button class.

**Why.** The header is the page's highest-protagonism zone — putting
the most irreversible action there competes with primary actions
(Save) and breaks symmetry with the form-detail patterns where
Delete already lives in the footer. The Stripe / GitHub / Linear
"danger zone" pattern is the canonical low-protagonism placement:
same horizontal padding as the form's section-cards, but at the
very bottom so the operator only encounters it deliberately. Subtle
red button (not solid) — solid red would re-introduce the protagonism
the move was meant to remove.

**Discarded.** Sticky footer mirroring the sticky header — keeps the
button always-visible, which is exactly the prominence we wanted
to remove. Severity `border-left` stripe — banned by impeccable
guidelines (most overused AI design tell). All-caps "DANGER ZONE"
heading — wrong tone for the calm·dense·operational brief.

---

## 28 — Bulk action bar is a floating light card with an inline edit form (2026-05-06)

**Decision.** `<aed-bulk-action-bar>` renders as a white, rounded
(`radius-200`), drop-shadow card inset from the viewport edges
(`bottom: spacing-400`, `left: sidebar-width + spacing-500`,
`right: spacing-500`), not as an edge-to-edge dark bar pinned to the
bottom. The "Editar" popover trigger is gone; in its place,
`<aed-bulk-edit-menu>` renders an inline `Cambiar [select] a [select]
[Aplicar]` form directly in the bar. `.btn--bulk-danger` is now solid
red-600 (it was subtle red — that pairing only made sense on the old
dark bar).

**Why.** Figma 81:10750 specifies a floating light card with rounded
corners and shadow on all sides — matching every other surface in the
app. The dark edge-to-edge bar was a pre-Figma carryover. The popover
trigger added one click between "I selected rows" and "I committed
the change"; on a high-frequency operational tool that click is
friction. Inline form removes the click and the overlay (no more
z-index / popover-positioning concerns). The `BulkEditCommit` output
contract stayed identical so the 6 list pages projecting
`<aed-bulk-edit-menu>` didn't have to change.

**Discarded.** Keeping the popover with a re-skin only — preserves
the extra click. Making the inline form a separate component and
changing the selector — would have churned every consumer for no
benefit. Solid-red `Eliminar` regardless of bar surface — was the
right Figma reading.

---

## 27 — Toggle switch is a real `<input type="checkbox" role="switch">` (2026-05-06)

**Decision.** `<aed-toggle-switch>` wraps a real
`<input type="checkbox" role="switch">` with a CSS-painted track and
thumb on top. The visible UI is a floated absolute layer; the input
itself fills the same box transparently so clicks, focus and form
submission all hit the native control.

**Why.** A `<button>`-based toggle has to manually wire keyboard
support (Space toggles, Enter doesn't), screen-reader role, and form
participation. `<input type="checkbox" role="switch">` gets all of
that for free from the platform. The `role="switch"` override is the
right ARIA semantics for a binary toggle (vs the default "checkbox"
which announces "checked" instead of "on/off"). `prefers-reduced-motion`
removes the thumb-slide animation but keeps the colour change.

**Discarded.** A `<button aria-pressed="true|false">` — works but
re-implements form association manually. Pure CSS-only with no input
— breaks `<form>` submission. `<input type="checkbox">` *without*
`role="switch"` — visually a switch, semantically a checkbox; screen
readers say the wrong thing.

---

## 26 — Routes preload with `PreloadAllModules` (2026-05-06)

**Decision.** `provideRouter(appRoutes, ..., withPreloading(PreloadAllModules))`
in `app.config.ts`. Every lazy chunk fetches in the background as
soon as the shell is interactive.

**Why.** The whole app is `loadComponent` / `loadChildren`. Before
preloading, each navigation paid a fetch + parse cost on the click
— ~50–200 ms perceived as a small lag between cursor and content.
For an admin panel where the user navigates constantly, that delay
is the most visible perf complaint. Preloading shifts the cost off
the click and onto the post-paint background, which is exactly when
the user has nothing to do anyway.

**Discarded.** `QuicklinkStrategy` (only preload visible links) —
right answer for a marketing site where most chunks won't be
visited in a session; wrong here because the user navigates
*everywhere*. Removing lazy loading entirely (single bundle) —
inflates initial paint and main-thread parse for no gain on a
client-only app of this size.

---

## 25 — Modal slots project via attribute selector (2026-05-06)

**Decision.** `<aed-modal>` projects its action row via
`<ng-content select="[modal-actions]">`. Consumers wrap the buttons
in a sentinel `<div modal-actions>` block inside the modal's content.

**Why.** The body of a modal varies wildly per consumer (forms,
chip lists, copy-to-confirm inputs); the action row is always a
horizontal flex of 1–2 buttons. An attribute selector lets the
caller put the actions block anywhere in the markup (it gets
plucked out and rendered in the modal's footer slot) without
forcing a `TemplateRef` import + outlet dance. Every existing
consumer already has the buttons inline; the modal just rehomes
them.

**Discarded.** `pTemplate="footer"` template projection — same
ergonomics as PrimeNG, requires `TemplateRef` and a separate file-
level template ref. A second `<ng-content>` without a selector —
ambiguous about which content is body vs footer.

---

## 24 — Bulk-delete dialog stays open at zero chips (2026-05-06)

**Decision.** When the user prunes the last chip from
`<aed-delete-entity-dialog>` bulk mode, the dialog no longer auto-
cancels. Instead it shows an empty-state row ("Has descartado todos
los elementos. Restaura la lista o cancela.") with a "Restaurar lista"
button that re-stages the original ids. Confirm stays disabled
because `canConfirm` reads `visibleItems().length > 0`. Same pattern
landed in `<aed-impact-preview-dialog>` (the chip-remove button is
template-disabled when only one item remains, so the auto-cancel
path can't even be reached).

**Why.** Auto-closing the dialog when the last chip is pruned was a
footgun: the user was actively configuring a delete, removed an item
they didn't mean to, and the whole action vanished. They had to start
over from the list page. Keeping the dialog open with a recovery
button preserves intent and matches the "destructive ops route through
a deliberate confirm gate" rule (DD#18).

**Discarded.** Disabling the chip-remove button when one chip is
left in delete-entity (so you can't reach zero) — works for impact-
preview but is wrong in delete-bulk where prune-and-cancel is a
legitimate "actually I don't want to delete any of these" intent.
The empty-state with reset preserves both flows.

---

## 23 — `.btn` is a global system; per-page redefinitions forbidden (2026-05-06)

**Decision.** The canonical button system lives in
`src/styles/_buttons.scss`, imported once from `main.scss`. It defines
`.btn` plus the `--primary / --secondary / --ghost / --danger /
--primary-subtle / --danger-subtle / --bulk-danger / --sm / --icon`
modifiers. Every per-page SCSS that previously declared its own
`.btn { … }` block (10 files) has had that block deleted.

**Why.** The user reported that adjacent buttons looked different
sizes — and they were: 10 different `.btn` definitions across pages,
each drifted slightly during their original commits. A single source
of truth from the Smart Contact Figma (node 195:283) keeps every
button identical no matter where it's rendered. Templates didn't
change; the global rule just reaches them.

**Discarded.** A wrapper component `<aed-btn>` — would force every
template to migrate from `class="btn btn--primary"` to
`<aed-btn variant="primary">`, which is more churn than the bug
warranted. Library-style `@mixin btn-base` — same boilerplate,
SCSS-only, harder to extend later.

---

## 22 — Side-stripe borders > 1px are banned (2026-05-06)

**Decision.** No element in the codebase uses `border-left:` or
`border-right:` greater than 1px as a colored severity / accent
stripe. Existing offenders (the cross-tab warning banner, the
sidebar nav-item active state) were rewritten to use full borders +
background tint + bold weight instead.

**Why.** Carry-over from `/impeccable absolute_bans`: the side-stripe
pattern is the single most overused "design touch" in admin and
medical UIs, regardless of the colour or radius applied. It always
reads as templated. Background tint + full border communicates the
same severity hierarchy without the cliché.

**Discarded.** Inset box-shadow as a "thin stripe" alternative —
same visual outcome, same problem. Coloured icons next to the title
without any container tint — fine for inline notices, not for
banner-style elements that need to register as "the whole row is
warning".

---

## 21 — Press feedback is `scale(0.98)` with zero transition (2026-05-06)

**Decision.** Every `.btn`, `.empty-state__cta`, `.aed-toast__action`,
`.rename__btn` and `.profile-tabs__tab` gets a global rule in
`main.scss`: 100ms transitions on hover-state changes (background,
border, color, shadow) and `:active { transform: scale(0.98);
transition-duration: 0ms }`. `prefers-reduced-motion` removes both
effects.

**Why.** Click on a CTA used to feel "fuzzy" — a 150ms hover-fade
that lingered as the page navigated read as lag. The press snap is
the opposite: instant tactile feedback the moment the click lands,
and because the transition duration is zero on `:active`, there's no
fade-out animation racing the navigation. Hover stays soft (100ms)
because hover *is* a continuous gesture.

**Discarded.** Removing transitions entirely — hover changes look
abrupt and unfinished. Bouncier press (`scale(0.95)`, spring easing)
— reads as toy-like, doesn't match the calm/dense brand. Box-shadow
press feedback — visible, but doesn't communicate the same "I
pressed it" signal a transform does.

---

## 20 — `ResultCounter` takes an already-translated literal, not a key (2026-05-06)

**Decision.** `<aed-result-counter>` declares a single `entityPlural:
string` input. Callers translate at the binding site —
`[entityPlural]="'agents.entity_plural' | translate"` for static
features, `[entityPlural]="config().entityPluralSpanish"` for the
generic `repo-list-page` whose plural name varies per repository
instance.

**Why.** Two consumer shapes — static i18n keys (Agents, Groups, Users,
Labels, Templates) and a runtime string (the 9 repo instances each
have their own `entityPluralSpanish` in their config). One signature
that fits both is a literal string; the alternative would be two
inputs (`entityPluralKey` *or* `entityPlural`) with a runtime
"exactly-one-of" check. The component stays dumb, the caller decides
where the string comes from.

**Discarded.** Two inputs with a guard — extra surface, easy to
mis-bind. A `TranslateModule` import inside the counter so it can
take a key — couples a leaf component to i18n infra it doesn't need.

---

## 19 — CI runs on every pull_request, not only main/develop (2026-05-06)

**Decision.** `.github/workflows/ci.yml` declares `pull_request:` with
no `branches:` filter (push still gates on `[main, develop]`).

**Why.** Stacked PRs — opening a feature branch on top of an open
fix branch — get CI feedback before the base merges. Saved a full
round-trip during this session: PR #2 (form-safety) was based on
PR #1 (CI green) and could not have validated without this change.
Per-PR cost is the same; we just allow more PRs to use the channel.

**Discarded.** Adding the specific base branches to the filter
(`branches: [main, develop, "fix/**", "feat/**"]`) — works, but
turns into trivia every time a new branch convention shows up.
Keeping the filter only on push covers the "block merges to
main/develop on red CI" use case which was its real purpose.

---

## 18 — Delete is excluded from undo, by design (2026-05-06)

**Decision.** `UndoStackService.push` is wired into presence change,
bulk update, and duplicate. It is **not** wired into single-item
delete or bulk delete.

**Why.** Direct port of the prototype's DD#2173 — destructive
operations route through `DeleteEntityDialog` (text-typing
confirmation in single mode, chip pruning in bulk mode), which is
already a deliberate "are you really sure?" gate. Adding undo on top
of a confirmation dialog dilutes both: the dialog stops being the
final word, and the undo toast becomes a fallback users learn to
rely on instead of reading the dialog.

**Discarded.** Symmetric undo on every mutating action — feels
consistent on paper, but the dialog is a stronger signal for
deletion. "Soft delete + 8s undo, no dialog" — would change the
trust model for destructive ops; out of scope here.

---

## 17 — Undo stack is a non-reactive service (2026-05-06)

**Decision.** `UndoStackService` holds a private mutable array of
`UndoEntry`. It exposes `push`, `popLatest`, `runById`, `hasUndo` —
no signals, no observables. The visible UI is the toast that each
`push` fires via `MessageService`; the post-undo confirmation is
another toast.

**Why.** The stack itself is internal plumbing — no consumer needs
to react to "stack changed". The user-visible artifact is the toast,
which is already reactive through PrimeNG's `MessageService`. Adding
signals around the array would only buy reactivity for a "history
panel" UI that doesn't exist. The Ctrl+Z handler (in `AppComponent`)
calls `popLatest()` synchronously and is happy with a non-reactive
read.

**Discarded.** `signal<UndoEntry[]>` + `computed` for `hasUndo` —
correct if there were a future undo-history panel; YAGNI. Storing
toast IDs in the entry to programmatically dismiss them on undo —
PrimeNG's `MessageService.clear()` is per-key, not per-id, which
would force every toast to carry a unique key just for this case.
The original toast simply expires on its own 8-second life.

---

## 16 — Validation messages render into a reserved slot (2026-05-06)

**Decision.** Inline form validation errors render as
`<span class="field__error" aria-live="polite">` that is **always**
in the DOM. CSS gives the span `min-height: 1.25em`. The `@if`
controls only the *text* inside the span, not the element itself.

**Why.** The previous pattern (`@if (errors()['x']; as err) { <span>…</span> }`)
adds the span to the DOM only when an error exists, which pushes
every field below it down by ~20px on first validation — exactly the
layout-shift defect we banned in DD#8. Reserving the slot keeps the
form geometry stable, and `aria-live="polite"` lets screen readers
announce the error as it appears.

**Discarded.** `visibility: hidden` on the span — accomplishes the
same height reservation but the empty span is still announced by
some screen readers as an empty live region. A wrapper div with
`min-height` and the span inside via `@if` — extra DOM node for no
benefit.

---

## 15 — Form keyboard shortcuts inline via `@HostListener` (2026-05-06)

**Decision.** Ctrl/Cmd+S and `beforeunload` are wired with
`@HostListener` directly on each form page (`AgentFormPage`,
`GroupFormPage`, `UserFormPage`). Roughly 18 lines per form, no
shared abstraction.

**Why.** Three forms × 6 lines of HostListener each = 18 lines. A
shared `aedSaveShortcut` directive would be ~30 lines plus an import
in each consumer plus an output binding for the save callback —
strictly more surface for the same behavior. Each form's save logic
already has the right gating (`canSave()`, `!saving()`); a directive
would force us to expose those as inputs.

**Discarded.** A `FormShortcutsDirective` that emits `(saveRequested)`
— right answer if there were 6+ consumers; over-engineered for 3.
A global keydown service — couples unrelated forms to a single
listener and leaks on route changes if not cleaned up carefully.

---

## 14 — Cross-tab lock returns an explicit release function (2026-05-06)

**Decision.** `CrossTabLockService.acquire(entityType, entityId, onConflict)`
returns a `() => void` release function. The form page calls it from
`ngOnDestroy` (or holds it in a private field and clears on save/cancel).

**Why.** `effect(onCleanup => …)` would also work, but the form
already has a non-reactive `OnDestroy` for breadcrumbs. Threading the
lock release through the same lifecycle path keeps the code linear
and avoids a second teardown surface (effect cleanup runs in a
separate phase from `ngOnDestroy`). It also makes the contract
explicit at the callsite — `releaseLock?.()` reads as "release the
lock now" rather than "magic auto-cleanup".

**Discarded.** `effect` with `onCleanup` — works, hides the lifecycle.
A `LockHandle` class with `.release()` — same shape, more surface.

---

## 13 — DiscardDialog reuses PrimeNG `ConfirmationService` (2026-05-06)

**Decision.** "¿Descartar cambios?" renders through PrimeNG's
`<p-confirmDialog />` (already mounted in the app shell) via a thin
`DiscardDialogService` that wraps `confirm({...})` into a
`Promise<boolean>` API.

**Why.** The shell already has `<p-toast />` + `<p-confirmDialog />`
mounted globally. A custom modal would have re-implemented focus
trap, ESC handling, accessibility, and animation — all of which
PrimeNG already does. The wrapper exists only to convert the callback
API into a promise the `CanDeactivate` guard can `await`.

**Discarded.** A literal port of the prototype's hand-rolled
`<DiscardDialog>` — duplicates infra we already have. A custom
`<aed-discard-dialog>` over PrimeNG `Dialog` — same amount of code as
the wrapper, with extra component-discovery cost for callers.

---

## 12 — Form-dirty contract is a `Signal<boolean>`, not a method (2026-05-06)

**Decision.** Components that opt into the form-dirty guard implement
`DirtyAware { readonly formDirty: Signal<boolean> }`. The
`formDirtyGuard` (`CanDeactivateFn`) reads `component.formDirty()`; if
true, it shows the discard dialog and resolves on the user's choice.
The form page is responsible for setting `formDirty.set(true)` in each
mutator and `formDirty.set(false)` after save/delete.

**Why.** Signals are how the rest of the codebase models reactive
state, so the guard composes cleanly with the form's existing
`canSave`/`saving`/`form` signals. A method (`isDirty(): boolean`)
would be a second style of "reactive read" sitting next to the
signals — more surface, no real benefit. Manual marking (rather than
`effect(() => this.form()).set(true)`) avoids a false-positive on the
initial `form.set()` in `ngOnInit`.

**Discarded.** A library-style "dirty form" decorator — too much
ceremony for three forms. Angular's reactive forms `dirty` flag — we
don't use reactive forms here; the forms are signal-driven for
unification with the rest of the page state.

---

## 11 — `cancel` is a forbidden output name (2026-05-06)

**Decision.** Components must not name an `@Output` / `output()` `cancel`.
Rename pattern is past-tense: `cancel` → `cancelled`, `delete` stays fine,
`nameChange` stays fine. Applied across 8 components and the 23 template
bindings + 11 self-emit `(click)="cancel.emit()"` references.

**Why.** `cancel` is a real DOM event (fires on `<input type="file">`
when the user closes the file picker). The Angular template compiler
binds outputs by name, so a component output called `cancel` shadows
the native event listener and `@angular-eslint/no-output-native`
correctly rejects it. Past-tense reads better as "this is what just
happened" — Angular convention for output names.

**Discarded.** Disabling the lint rule globally — losing a real safety
net. Prefixing every output (`onCancel`) — breaks the event-binding
ergonomics of `(cancelled)="…"` and clashes with the React-style `onX`
prop convention which is not how Angular outputs are written.

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

## How to add a new entry

When a session decides something load-bearing, append a numbered section
here. Lead with **what** in one sentence, then **why** (the actual reason,
not a paraphrase of the decision), and **what was discarded and why**. Date
in `YYYY-MM-DD` to anchor it in time.
