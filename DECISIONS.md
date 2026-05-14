# Decisions log

> Permanent record of decisions that shape the codebase. Each entry says what
> we decided, _why_, and what we discarded _and why_. We add to this file
> whenever a session locks in something that future contributors would
> otherwise have to re-derive.

---

## 62 — Attribute-selector projection wrappers live _outside_ `@if` blocks (2026-05-14)

**Decision.** When a consumer renders content into a component
that uses `<ng-content select="[attr]">`, the wrapping element
that carries the matching attribute (`<span header-pills>`,
`<span modal-actions>`, etc) **must not** sit inside an `@if`
block at the consumer level. Guard only the inner content; the
wrapper stays static.

**Why.** Angular 17+ resolves projection slot membership from
the static template structure of the host. An attribute-selector
slot declared _inside_ an `@if` at the consumer level doesn't
always register — the host's `<ng-content>` sees no children and
renders the slot empty even when the `@if` is true. We hit this
in production on the agent edit header: pills + meta rendered
as empty `<span class="sticky-header__pills"></span>` even with
`mode() === 'edit'`. Confirmed via the live DOM.

**Pattern.**

```html
<!-- Wrong: wrapper inside @if -->
@if (mode() === 'edit') {
  <span header-pills>...</span>
}

<!-- Right: wrapper static, content gated -->
<span header-pills>
  @if (mode() === 'edit') {
    ...
  }
</span>
```

**Cost.** The slot wrapper renders even when its content is
empty. The shared host SCSS already collapses these via
`&:empty { display: none; }`, so this is a zero-visual-cost
trade-off.

**Reference.** PR #43 (`8e1d9a9`). Applied to all three form
headers (agent / group / user) for consistency, even though
only the agent header had surfaced the bug visually.

---

## 61 — `aed-page-header` is the single header recipe for every page in the app (2026-05-14)

**Decision.** Every page in the app — list pages (`/admin/*`),
form pages (entity edit / create), config pages (`/config/*`),
and the repositories hub — renders the same header recipe via
the shared `aed-page-header` component. The recipe matches
`sticky-form-header` exactly: sticky at `top:0`, white surface
fill, bottom border, xs shadow, 44×44 leading icon, padding
12/24, gap 16, optional uppercase eyebrow + title + subtitle +
trailing actions slot.

**Why.**

- The brief was strict: "Prioridad consistencia para la
  expectativa de usuario". Multiple visual styles of "page
  header" across routes broke that expectation.
- The form pages already had a polished `sticky-form-header`
  with photo + name + pills + meta + save. Lists / config had
  ad-hoc `<header class="page__header">` markups with no
  shared rhythm.
- Adopting one recipe (rather than two) means future pages
  inherit the look for free; future tweaks (e.g. typography
  pass) happen in one file.

**How.**

- `aed-page-header` is the static variant; `sticky-form-header`
  remains the form variant (it keeps the name input, status
  pop animation, save/cancel actions).
- Both share visual tokens — same chip background, same
  typography, same vertical weight. Reading both files
  side-by-side feels like sibling components.
- `aed-page-header` exposes `[page-header-actions]` as a
  content-projection slot so list pages project their primary
  CTA ("Nuevo agente", "Nuevo grupo"…) without the component
  needing to know about them.

**Discarded.**

- _Adding the page-header inside each route's `<div class="page">`_
  — visible in early PR #38, undone in PR #41. The
  `.page__inner` padding kept the header from spanning viewport
  edges; lifting it out matches the form pattern.
- _A separate "list page header" component_ — short-lived
  alternative; rejected for the duplication it would cause.

**Reference.** PRs #38, #39, #40, #41.

---

## 60 — `/config` shell lifts the page header out of each leaf via `PageHeaderService` (2026-05-14)

**Decision.** `aed-settings-shell` renders the page header at
the top, spanning the full viewport width above the rail +
main grid — the same structural layout that `/admin` edit
pages have with `sticky-form-header`. Each `/config/*` leaf
component writes its `{ titleKey, subtitleKey, entityKey, icon }`
into a new `PageHeaderService` signal on construction; the
shell reads the signal and renders `aed-page-header`.

**Why.**

- The user said: "el header en configuración de AED... tiene
  que ser igual. Es decir el mismo layout que el resto. Un
  header, y después un sidebar donde está el índice, y el main
  content." That requires the header to span the entire shell
  width, not sit inside the right-column `main` area.
- Each `/config` leaf has a different title / icon / subtitle —
  the shell can't hard-code them. A signal-based service is
  cheap, type-safe, and lets the shell rerender via
  `effect()` / `computed()` without subscriptions.

**Discarded.**

- _Read `data` off the activated route_ — simpler in theory,
  but page metadata can depend on runtime state (an entity name,
  a feature flag). The service form keeps the door open.
- _Content projection from the leaf into the shell_ — Angular
  routes don't compose like nested components; each leaf is
  rendered into a `<router-outlet>`, so there's no host the
  leaf can `[slot]` into.

**Reference.** PR #40 (`PageHeaderService` in
`@core/services/page-header.service.ts`).

---

## 59 — Form section nav is tab-based (controlled), not scroll-spy (2026-05-14)

**Decision.** Each section in the entity edit/create form is a
switchable pane rendered via `@switch (activeSection())`. The
nav (`aed-form-section-nav`) is controlled: the parent owns
the `activeId` signal and the nav emits `activeChange`. No
scroll-spy. **In edit mode, the Identity entry drops to the
end of the nav and the form opens on the second entry**
(channels / groups / sections).

**Why.**

- The form is dense (especially the agent form, with seven
  sub-sections inside "Configuración avanzada" alone).
  Showing every section at once forces the user to scroll
  to find the one they want.
- Identity is **set once and rarely re-edited**. In edit
  mode, opening the user on the section they iterate on
  (channels for groups, groups for agents, sections for
  users) skips an extra click.
- Tab navigation makes section reorganisation cheap: the
  `navSections` is an array — swap entries to change the
  user's mental model without touching the DOM.

**Discarded.**

- _Scroll-spy with smooth scroll_ (the previous behaviour) —
  great for long-read content, not for editing forms where
  each pane is a focused unit.
- _Stack with collapse_ (PR #36 considered) — half-measure;
  hides noise but keeps the navigation problem.

**Reference.** PR #35.

---

## 58 — Danger zone lives at the bottom of the Identidad tab, not in the section nav (2026-05-14)

**Decision.** In edit mode, the "Eliminar este {entity}" card
(`aed-form-danger-zone`) renders at the bottom of the Identidad
pane — not as an entry in the section nav. The nav navigates;
the danger zone acts.

**Why.**

- The brief: "el eliminar del índice... busco consistencia y
  criterio". The user noticed that putting a destructive
  action in the same list as the navigable sections muddied
  what the index _is for_.
- Identity is already the last index entry in edit mode (DD
  #59). Tucking the danger zone at the bottom of that pane
  means the user has to go to Identidad → scroll past the
  identity fields → see the danger card. That's deliberate
  friction, consistent with GitHub / Stripe.

**Discarded.**

- _Kebab menu (⋮) in the sticky-form-header_ — fast access,
  but doesn't punish the destructive choice with appropriate
  friction.
- _Always-visible danger zone at the page footer_ — adds noise
  even when the user is editing channels and has zero intent
  to delete.

**Reference.** PR #36.

---

## 57 — Agent form's tail collapses into one "Configuración avanzada" card with progressive-disclosure sub-sections (2026-05-11)

**Decision.** The agent edit/create form trades two trailing section
cards (Languages, Labels) plus a few orphan fields for a single
**Configuración avanzada** section card with six sub-sections. The
parent card itself is **collapsible and starts collapsed** to hide
advanced-settings noise from the typical user; each inner accordion
also starts collapsed so the expanded parent reads as a quiet summary
(count badges) until the user drills in.

- **Labels** — accordion. Count badge: "N asignada(s)".
- **Agendas** — accordion. Source: `AgendasStore` from
  `Repositorios > Agendas` (no duplicated data; the form just
  reads + assigns). Footnote reminds the user where master data
  lives.
- **Plantillas** — accordion. Source: `TemplatesStore`. Chat/Email
  tabs with `n/total` per-tab counters; select-all-visible header
  checkbox.
- **Comportamiento** — flat sub-section. Houses `pickupType` (moved
  out of Identification), `maxChats`, and `randomOrder`.
- **Integración** — flat sub-section. Houses `iframeUrl` and the
  `externalDevices` toggle.
- **Regional** — flat sub-section. Houses the language picker
  (formerly its own card).

**Section-card primitive becomes collapsible.** `aed-section-card`
gains two optional inputs: `[collapsible]` (turns the header into a
button) and `[initiallyCollapsed]` (start folded). Existing
consumers that don't pass either prop are unaffected.

Visual idiom: small-caps tracked sub-heading + leading icon, matching
the rest of the form's `--sc-text-subtle` head treatment. Adjacent
sub-sections separate with a 1px `--sc-border-default` divider.
Pattern lives inline in the agent-form's SCSS as `.sub-section`
(not extracted yet — only one consumer; revisit if user-form/group-form
adopt the same pattern).

**Why.**

1. The trailing section cards (Languages, Labels) felt heavy for
   what they contained — a single field each — and the form scrolled
   longer than it needed to.
2. Three existing data-model fields (`randomOrder`, `maxChats`,
   `iframeUrl`) were declared on `Agent` but never surfaced in the
   form. They needed a home; bundling them with the trailing cards
   under one "secondary settings" umbrella matches the user's mental
   model of "primary identity vs. tuning knobs".
3. Pickup type belongs with behaviour (chat/call pacing) rather than
   identity (who is this agent). Identification gets crisper:
   "Email/Phone, Extension/Type, Status".
4. Progressive disclosure on Labels keeps the card from ballooning
   when an agent has many labels.

**Side effect — `externalDevices` reverts to per-agent.** Session 20
(`50e7999`) removed the `externalDevices` toggle from the per-agent
permissions matrix, ruling it "global, lives in `/admin/aed/agentes`
defaults only". This decision reinstates it as a per-agent toggle
under Integración. The global toggle in `/admin/aed/agentes` is left
intact for now; its intended role becomes "default for new agents"
rather than "single source of truth". Whether to delete the global
one is deferred to a future session.

**Discarded.**

- _Extract `.sub-section` to `_forms.scss` immediately._ The agent
  form is the only consumer today; premature extraction. Promote on
  the second adopter (likely user-form or group-form when they get
  the same treatment).
- _Add Sesión sub-section from the prototype._ Needs a new
  `loginExtOverride` field on `Agent` plus a "Expirar contraseña"
  dialog/store action. Out of scope for this PR; tracked in
  `roadmap.md`. The sub-section pattern accommodates it cleanly.
- _Add a `pickupTypeChat` field._ Today only one global `pickupType`
  exists. Splitting per-channel is a small data-model expansion;
  deferred until the user confirms it's a real need vs. the
  Voice-only legacy default.
- _Keep the side nav showing Languages and Labels as separate
  entries._ Both now live inside one card; collapsing the nav to
  reference only the parent ("Configuración avanzada") matches the
  user's scroll model.

---

## 56 — Header pill base lives in `_forms.scss`; form-local files keep only their domain variants (2026-05-11)

**Decision.** The base `.pill` rule plus the `--type` (brand-subtle),
`--status` (transition), and `--status-active`/`--status-inactive`
(presence-token bg + `status-pop` animation) variants live in
`src/styles/_forms.scss` under a single canonical block. Form-local
SCSS files own only their domain-specific variants: agent-form keeps
`.pill--presence-*` (5 lowercase-Spanish presence states + the live
dot pulse on `--presence-disponible`); group-form keeps
`.pill--priority-*` and its `pill-pulse` keyframe on
`--priority-Alta`.

**Why.** Audit #1 of DD#54 catalogued the drift: user-form and
group-form re-declared the same `.pill` base independently from
agent-form, and user-form additionally hardcoded `#1a8a4a`/`#1a6a3a`
where the rest of the codebase referenced `--sc-presence-available` /
`--sc-presence-available-deep` (palette layer, line 75-76). Pill
status changes also popped on agent-form but not on user-form,
creating inconsistent feedback for the same control across screens.
Same playbook as DD#55 (extract perm-matrix) and DD#53 (extract
`.field`, `.checkbox-grid`): visual-layer consolidation, not a
component, because each consumer's data binding is form-specific.

**Side effects.**

- Animation is now uniform: every `.pill--status-active` /
  `.pill--status-inactive` in the admin forms pops on render
  (360ms scale 0.94 → 1.05 → 1, with `@media (prefers-reduced-motion)`
  honoured). user-form and group-form inherit it without local code.
- Dead `.pill--type` (agent-form) and `.pill--channel` (group-form)
  variants were dropped — their templates never referenced them.
  `.pill--type` survives in `_forms.scss` because user-form _does_
  use it; `--channel` is gone (group-form's channel chips use a
  different component path).

**Discarded.** (a) Unify `.pill--type` and `.pill--channel` into a
single canonical brand-subtle variant — both render identically, but
template class names communicate intent ("this is a type / role
pill"), so the cost of touching every consumer's HTML outweighs the
saving. (b) Remove the `status-pop` animation across the board to
calm down the surfaces — UX brand-voice says _calm · dense ·
operational_, not motionless; status-pop is subtle and gives genuine
state-change feedback, so we standardised it as on, not off.

---

## 55 — Permission matrix lives in `_forms.scss` as a single shared block (2026-05-11)

**Decision.** The `destino × {llamada, transferencia}` matrix layout
used by the agent-form permissions section and the
`/admin/aed/agentes` defaults page lives in `src/styles/_forms.scss`
under a single canonical `.perm-matrix` class. Each consumer owns its
own HTML and data binding; only the visual layer is shared.

**Why.** Audit #1 of DD#54 catalogued the duplicate styling:
agent-form's `.perm-matrix` (140px columns, padding-200, border-bottom)
vs aed-agentes' `.permisos-table` (% widths, padding-100/200,
border-top). The drift was silent — neither implementation knew about
the other — and would compound every time tokens changed. Same
reasoning as DD#53's `_forms.scss` extraction (form primitives like
`.field`, `.checkbox-grid`).

**Discarded.** (a) Build a real `<aed-permission-matrix>` component —
the two consumers have slightly different data shapes
(`form().permisosLlamadas[row]` vs `form().permissions.callsDestX` +
`PERMISSION_MATRIX_KEYS` lookup), so a shared component would need a
normalisation layer that adds more code than it saves. (b) Keep both
classes named separately and just align them — class-name drift is
itself a maintenance hazard; renaming `.permisos-table` to
`.perm-matrix` is a one-time template churn that future readers
benefit from.

**Side effect.** Column-header DOM order in aed-agentes also flipped
from `<input><span>` to `<span><input>` so the visual reads
"LLAMADA ☐" (label-before-checkbox), matching Voice's Figura 15 and
the agent-form pattern.

---

## 54 — Confirm-host modal uses 50/50 split footer, distinct from base modal flush-right (2026-05-11)

**Decision.** `aed-confirm-host` overrides the base modal footer to
make the two action buttons fill the footer 50/50, while
`<aed-modal>`'s default footer stays flush-right. Implemented by
wrapping the projected buttons in a single
`<div modal-actions class="confirm-host__actions">` with
`display: flex; flex: 1 1 auto; gap: var(--sc-spacing-600)` and
`flex: 1 1 0` on each child `.btn`. The `:host ::ng-deep` rule lives
at the top of `confirm-host.component.scss` (not nested under
`.aed-modal {}` — `:host` cannot be a descendant of an arbitrary
selector).

**Why.** Confirm-host modals are decision flows ("discard" vs
"continue") where the two options carry comparable weight. Visually
equal-sized buttons communicate parity. Destructive modals
(`delete-entity-dialog`, etc.) keep flush-right so the dangerous
action is clearly secondary in visual weight to the cancel/back
action.

**Discarded.** (a) `justify-content: stretch` on the footer — invalid
on flex main-axis, silently falls back to `flex-start`. (b) Projecting
individual buttons inside @if/@else without a wrapper — Angular
NG8011 (multiple root nodes for content projection slot). (c) Nesting
`:host ::ng-deep` inside `.aed-modal {}` — produces
`.aed-modal :host ...` which never matches.

---

## 53 — Per-(agent, group) channel permissions live in a dedicated link store, not on either entity (2026-05-10)

**Decision.** Channel permissions move from a global `Agent.channels[]` +
`Group.assignedAgents[]` pair to a single normalised join table — one
`GroupAgentLink { agentId, groupId, channels, active }` row per pair.
The legacy fields are dropped from the entity interfaces. Links live in
`GroupAgentLinksStore` (a signal-based, localStorage-backed sibling of
`AgentsStore` and `GroupsStore`); the seed is a static
`GROUP_AGENT_LINKS_SEED` array of 159 rows. See
[`docs/dd-53-per-group-channels-ux.md`](docs/dd-53-per-group-channels-ux.md)
for the full UX spec and ASCII mockups.

**Why.** Voice's user manual (Figura 15, page 20) reveals the legacy
platform we're migrating from already models permissions per-pair — an
agent's "phone" capability in group A is independent of their "phone"
capability in group B. Our simplified global model required reconciling
the agent's overall channel list against each group's channel offering
at render time, which surfaced confusing "mismatch" states (agent has
phone+chat globally, group has only phone → what does the agent
actually attend?). The new model has no such mismatch: the link IS the
agent's permission set in that group.

Why a dedicated store instead of embedding the array on `Agent` or
`Group`: a join row by definition is co-owned. Putting it on either
side forces one feature store to import the other (write-fan-out,
circular-import risk) and surfaces N+1 lookups when the other side
needs the same data. The third store lets both feature stores derive
read-only signals (`linksForAgent`, `linksForGroup`) cleanly. Same
pattern as `LabelCascadeService`.

**What we discarded.**

- _Banner / inline-alert approach (mismatch warning)._ Considered as
  the cheaper band-aid: keep the global `Agent.channels` and show a
  "you have channel X but this group doesn't offer it" alert. Rejected
  because the mismatch is a _symptom_, not a _constraint_. Tooling
  around symptoms compounds over time; structural fix doesn't recur.
- _Verbatim copy of Voice's Figura 15 table._ Single ambiguous "channel"
  column with no bulk controls. Works in Voice for trained operators,
  not for a non-dev admin managing dozens of groups + hundreds of agents.
  Replaced with one column per channel the group owns, tri-state column
  headers for bulk-toggle, indeterminate-state semantics, and an inline
  picker with search and paste-list-friendly Enter-to-add.
- _Drag-reorder of agent rows in the group form._ The Voice form had
  none and our user reads visual order as priority — drag-reorder of
  permissions rows would lie about the underlying model (sort is by
  name; level-routing is a separate strategy field).
- _Generic `AedListPickerComponent` extracted up front._ Two callers
  (agent-form, group-form) share the picker pattern, but their data
  shape differs (Group with channels vs Agent alone). Embedded inline
  in each table component for V1; will extract only if a third caller
  emerges.

**Cascade.** When a group drops a channel its `Canales` section used to
own, the form clamps every link's channels in-memory (the table column
disappears immediately) and surfaces a single-shot confirm dialog on
save naming the impact ("Esto desactivará Chat para 8 agentes asignados
a este grupo. ¿Continuar?"). The dialog reads pre-edit channels +
links, so the count reflects real impact, not the already-clamped state.

---

## 52 — Migrate the PrimeNG bridge from a flat CSS layer to a JS-defined preset (2026-05-10)

**Decision.** The previous `06-primeng-bridge.css` — a layer that
hand-declared every `--p-*` runtime variable as an override pointing
at a `--sc-*` token — is replaced by a JS preset in
[`src/app/core/tokens/aed-preset.ts`](src/app/core/tokens/aed-preset.ts).
The preset wraps Aura via `definePreset(Aura, …)` and is registered
in `app.config.ts`:

```ts
providePrimeNG({ theme: { preset: AedPreset, options: {…} } });
```

Each preset value is a `var(--sc-…)` reference (e.g.
`primary: { 500: 'var(--sc-color-blue-500)' }`). PrimeNG's compiler
emits `--p-primary-500: var(--sc-color-blue-500)` at boot, the
browser resolves the `var()` at paint time. Same effect as the old
flat-CSS shadow, same source of truth, but expressed in the place
PrimeNG 21 expects.

**Why.** Three reasons:

- **PrimeNG 21 is JS-first.** v21's design-token catalog includes
  semantic concepts (`disabledOpacity`, `iconSize`, `formField.sm` /
  `lg`, navigation/list nested structures) that aren't emitted as
  `--p-*` CSS variables — they live only in the preset object. A
  flat-CSS bridge can never override them. By moving to the preset
  pattern, we have one place to extend if those v21 niceties ever
  matter.
- **Less duplication, less drift.** Aura already wires the dozens
  of nested semantic structures (`formField`, `list`, `navigation`,
  `overlay.modal`, `overlay.popover`) sensibly. The CSS bridge was
  re-declaring those defaults to "be safe"; the preset inherits
  them automatically, so AED's preset shrinks to the actual brand
  overrides.
- **Truthful documentation.** The CSS bridge looked like the canonical
  v21 way of customising PrimeNG; it isn't. Future readers seeing
  `aed-preset.ts` next to `core/tokens/layers/` immediately
  understand: "the CSS layers carry AED's own `--sc-*` tokens, the
  TS preset bridges them into PrimeNG's `--p-*` runtime."

**Discarded.**

- Keeping the flat-CSS bridge with a docstring saying "this is the
  v18 way." It worked but it lied about the ergonomics — every
  PrimeNG version bump would force a re-audit "did anything change
  upstream?" and the bridge would drift further from the idiom.
- Migrating the preset values to literal hex strings (e.g.
  `primary: { 500: '#344a70' }`). Would have broken the
  single-source-of-truth pattern: tweaking `01-primitive.css` would
  no longer propagate to PrimeNG components automatically. Using
  `var(--sc-…)` values keeps the cascade.
- Splitting the preset into multiple files by concern. The preset
  is ~200 lines and structurally flat once you know
  `primitive` / `semantic` / `colorScheme.{light,dark}`. One file
  is easier to scan than five.

**Files.**

- [`src/app/core/tokens/aed-preset.ts`](src/app/core/tokens/aed-preset.ts) — new, 200 lines.
- [`src/app/app.config.ts`](src/app/app.config.ts) — `Aura` import swapped for `AedPreset`.
- `src/app/core/tokens/layers/06-primeng-bridge.css` — **deleted**.
- [`src/app/core/tokens/index.css`](src/app/core/tokens/index.css) — drops the layer-6 import + adds a comment explaining the move.
- [`src/app/core/tokens/README.md`](src/app/core/tokens/README.md), [`docs/design-system.md`](docs/design-system.md) — refreshed to reflect the new architecture.

**Companion fixes (same branch, scoped tightly).**

- **`ThemeService` bootstrap** — the service was `providedIn: 'root'`
  but never injected anywhere, so its `effect()` (the one that adds
  `.aed-dark` to `<html>`) never ran. Dark mode was silently broken
  in production; the visual A/B with Playwright would have been a
  no-op against the same-coloured surfaces. Fix: inject the service
  in `AppComponent` as a side-effect dependency.
- **Translucencies → `color-mix`** — the dark-layer `rgb(R G B / A)`
  literals across status / button-danger / toast became
  `color-mix(in srgb, var(--sc-color-X-Y) N%, transparent)`.
  Byte-identical output, primitive chain unbroken.
- **Shadow color tokenised** — new `--sc-shadow-color-rgb` and
  `--sc-shadow-focus-ring-rgb` in the extensions layer; the seven
  consumers (six shadow tokens + the modal-shadow + standalone
  `box-shadow`s in five components) read
  `rgb(var(--sc-shadow-color-rgb) / 0.0X)`.

---

## 51 — Upgrade Angular 18 → 21 + PrimeNG 18 → 21 in a single dedicated branch with Playwright visual regression (2026-05-10)

**Decision.** The major-version upgrade across Angular (18 → 19 → 20
→ 21), PrimeNG (18 → 21), and Angular CDK (18 → 21) lands as one PR
from the `chore/upgrade-angular-21` branch. Inside that branch, each
Angular major step is its own commit so a future `git bisect` can
pinpoint which jump introduced any regression. Visual regression at
every step is verified with a Playwright snapshot script
(`e2e/snapshot.ts`) that captures every key screen at 1440×900
@2x and writes `.png` files under `e2e/screenshots/<set>/`. The
`baseline/` set is taken on v18; subsequent sets (`after-ng19/`,
`after-ng20/`, `after-ng21/`) are compared visually before the next
jump.

The local dev environment switched from Node 25 (which the AED
session log flagged as broken with `ng serve`) to Node 20.20.2 via
nvm, installed via Homebrew. `~/.zshrc` got the standard nvm
bootstrap so the switch survives shell restarts.

**Why.** Three reasons:

- **One PR for the merge, granular commits inside.** Bundling all
  three Angular majors into a single branch keeps `main` clean
  during the multi-hour upgrade. The per-major commits give bisect
  resolution without requiring three separate review cycles. If any
  step regresses something that only manifests in production, we
  can revert that one commit instead of the whole upgrade.
- **Playwright as the regression net.** Three majors + three PrimeNG
  bumps without visual checks would be a leap of faith — `tsc
--noEmit` catches type drift but doesn't catch a re-rendered
  PrimeNG component that lost its border-radius. Snapshotting at
  every step makes "did anything visibly change?" answerable in 30
  seconds.
- **Catching the long tail of peer-deps in advance.** PrimeNG 21
  needs CDK ^21; CDK can't skip majors via `ng update`;
  `lucide-angular@^0.460` capped at Angular 18. Doing the upgrade in
  a dedicated branch let us discover and resolve those constraints
  without polluting `main` with intermediate broken states.

**Discarded.**

- Doing the upgrade directly on `main`. Faster if everything works,
  catastrophic if something breaks at step 2 of 3 — main is in a
  half-upgraded state until someone fixes it.
- Using `ng update --force` to bypass peer-deps. Hides real
  conflicts and lets npm install transitive versions that may not
  actually work together. The `--legacy-peer-deps` route documented
  per step is more honest about what we're accepting.
- Skipping the v19 / v20 stops and going straight to v21. `ng
update` doesn't support multi-major hops for the Angular
  schematics; trying to leap would have left half the migrations
  un-applied.
- Trimming the visual regression to "spot-check 2-3 screens." Three
  majors of changes can each contribute a 1-pixel shift; a
  silent stack of small drifts becomes a visible regression on
  someone else's screen. Snapshotting all 10 key screens at every
  step makes drift impossible to miss.

**Files / artifacts.**

- [`e2e/snapshot.ts`](e2e/snapshot.ts) — Playwright driver.
- [`e2e/screenshots/`](e2e/screenshots/) — gitignored; regenerable
  on demand.
- `package.json` — Angular 21.2.10 · PrimeNG 21.1.6 ·
  Angular CDK 21.2.10 · Lucide-angular 1.0.
- `~/.zshrc` — added nvm bootstrap block so Node 20 survives shell
  restarts.
- [`docs/design-system.md`](docs/design-system.md) — stack reference
  updated to Angular 21.2 + PrimeNG 21.1.

**Open follow-ups.** Optional schematics deferred for separate
sessions: `use-application-builder` (build-system swap),
`router-current-navigation` (Router signal API),
`provide-initializer` (APP_INITIALIZER → providers replacement). Each
is a behaviour change worth its own focused commit + visual check.

---

## 50 — Design tokens reorganise into a PrimeNG-style 7-layer cascade (2026-05-10)

**Decision.** The 975-line monolithic `sc-tokens.css` is split into
seven layered files under `src/app/core/tokens/layers/`, mirroring
PrimeNG's official `primitive` → `semantic` → `components` →
`preset-overrides` model and adding two layers PrimeNG doesn't
provide. An `index.css` orchestrator imports them in cascade order:

1. `01-primitive` — raw values (color scales, font, spacing, radius).
2. `02-semantic` — purpose-bound aliases (text, surface, border, type roles).
3. `03-palette` — domain palettes (label hues, agent presence, group priority).
4. `04-component` — pre-baked specs (button, modal, toast).
5. `05-extensions` — AED-only (layout dims, shadows, z-index, motion).
6. `06-primeng-bridge` — `--p-*` redirected to `--sc-*` source of truth.
7. `07-dark` — `.aed-dark` overrides for layers 2/3/4.

**Why.** The monolith worked, but it didn't expose a model — readers
had to scroll to learn the structure. Aligning to PrimeNG's conventions
makes the project legible to any senior design-systems engineer and
future-proofs it: when PrimeNG ships a new version that expects new
`--p-*` tokens, only layer 6 needs to change.

Layer 6 is the inheritance bridge. It's the CSS-level equivalent of a
programmatic `definePreset()` call, but expressed as a flat file. We
get the same effect (PrimeNG components consume AED's brand colors)
with two big advantages: it's readable in browser dev tools, and it
doesn't require a build step or theme-compilation pipeline. The
trade-off is manual maintenance when adding new `--p-*` overrides;
the upside is debuggability and zero magic.

Layers 3 (palettes) and 5 (extensions) capture concerns PrimeNG
deliberately leaves to per-component CSS. Putting them in named
layers keeps AED's vocabulary visible and prevents them from sprawling
into component SCSS.

In the same pass, the agent presence colors (`#1a8a4a`, `#b07e1a`,
`#b91c4b`) and group priority rungs (`#c47a00`, `#8a5500`) — previously
hardcoded inside the form pages — moved into layer 3 as semantic
tokens. New `--sc-font-size-75: 11px` token captures the off-scale
chrome value pills + sidebar use. Internal hardcodes inside the token
files (button geometry, modal padding, toast geometry) tokenised to
their existing `--sc-spacing-*` / `--sc-radius-*` equivalents — same
resolved value, byte-identical CSS output.

**Discarded.**

- A programmatic `definePreset()` setup. PrimeNG supports it, but it
  forks the source of truth: the preset would emit `--p-*` directly,
  and AED's `--sc-*` tokens (the real source of truth) would lose
  their authority. The bridge file keeps `--sc-*` as canonical.
- Aggressive color-scale trimming (deleting unused shades, e.g.
  `--sc-color-indigo-300`). A design system has a vocabulary
  responsibility, not just a "ship today" responsibility — keeping
  the full ladder lets the next feature pick the right shade
  without re-deriving it.
- Migrating all `--sc-*` consumers to `--p-*`. Would erase the
  intent layer (consumers care about "primary background", not "the
  thing PrimeNG calls --p-primary-color") and tightly couple our
  components to PrimeNG's runtime variable names.

**Files.**

- [`src/app/core/tokens/index.css`](src/app/core/tokens/index.css) — orchestrator.
- [`src/app/core/tokens/layers/01-primitive.css`](src/app/core/tokens/layers/01-primitive.css) through [`07-dark.css`](src/app/core/tokens/layers/07-dark.css).
- [`src/app/core/tokens/README.md`](src/app/core/tokens/README.md) — rules for adding new tokens.
- [`docs/design-system.md`](docs/design-system.md) — full architecture overview.

---

## 49 — Identity moves from a persona rail into a rich sticky header; rail keeps only the section index (2026-05-08)

**Decision.** Across the three admin edit forms (agents, groups, users)
the persona rail is dismantled. Photo (44px), name (inline editable in
edit mode), and a pills slot for status / presence / priority / type
chips render in `<aed-sticky-form-header>` at the top of the page. A
new `[header-meta]` slot below the name carries the live identity
summary (agents: email + extension; groups: associated phone; users:
email). The `<aside class="ipanel">` stripped of its identity strip,
stats card, eyebrow and divider — it's now a thin 220px column hosting
only `<aed-form-section-nav>`. The icon-only back button on the rail is
removed, and `StickyFormHeaderComponent.showBack` flips its default
from `true` to `false`; the page-level breadcrumb is the canonical way
back.

In addition, the agent form's body adopts a 2-column inner grid: a
sticky 360px `Identificación` SectionCard on the left consolidates
photo + name (create-only) + email + phone + pickup + extension type/
number + agent type + channel pills + status toggle (edit-only) +
initial presence + recording toggle + PIN. Permisos / Grupos / Idiomas
/ Etiquetas / Danger-zone scroll independently on the right.

**Why.** The persona rail duplicated the identity work the
StickyFormHeader was already doing (entity eyebrow + name) and cost
~280px of horizontal real estate that the form body would rather use.
A rich sticky header collapses both into one place, lifts identity
above the fold, and frees the rail to do exactly one job (let the user
jump between sections). The agent body restructure mirrors a React
reference the user supplied (`Identificación` card + scrollable
settings column) and brings the form's first card much closer to a
form's natural reading order — "who is this and how do I reach them"
before "what can they do."

**Discarded.**

- Keeping the rail's identity strip _and_ a richer header — would
  duplicate state (the avatar, the name, the status pill rendered
  twice) and force every dirty/save event to ripple through two
  surfaces.
- Replacing the rail entirely with no section index — the user
  explicitly asked to keep the index when removing the ID-card
  resumen; the index is the rail's only remaining job.
- Per-form 2-column inner grids (groups, users too) — only the
  agent form has the field volume + the user's reference snippet
  to justify it. Groups and users keep a single-column body.

**Files.**

- [`src/app/shared/components/sticky-form-header/sticky-form-header.component.{ts,html,scss}`](src/app/shared/components/sticky-form-header/) — new `[header-pills]` + `[header-meta]` slots, default `showBack: false`, 44px photo scaling.
- [`src/app/features/admin/agents/pages/agent-form-page.component.{ts,html,scss}`](src/app/features/admin/agents/pages/) — rich header, rail simplified, body 2-column with consolidated Identificación card. Recording moves out of Permisos → Devices.
- [`src/app/features/admin/groups/pages/group-form-page.component.{html,scss,ts}`](src/app/features/admin/groups/pages/) — rich header (avatar + priority pill + phone meta), rail simplified.
- [`src/app/features/admin/users/pages/user-form-page.component.{ts,html,scss}`](src/app/features/admin/users/pages/) — rich header (photo + type/status pills + email meta), rail simplified.
- [`src/assets/i18n/es.json`](src/assets/i18n/es.json) — adds `agents.form.section.identification` + `recording_hint` keys.

---

## 48 — Discard-changes modal inverts priority; other destructive prompts keep loud-accept (2026-05-08)

**Decision.** `ConfirmRequest` gains an optional
`emphasis: 'accept' | 'reject'` flag (defaults to `'accept'`).
`DiscardDialogService` opts in with `'reject'`; the host then swaps
button positions and styles so the safe path "Continuar editando"
renders as `btn--primary` on the right, while "Descartar" stays red
but uses `btn--danger-subtle` (tinted) on the left. Other consumers
of `ConfirmHostService` (sistema-page reset-data, delete-entity)
don't pass the flag and keep the existing loud `btn--danger`
treatment as the trailing primary action.

**Why.** "Discard unsaved changes" is the one destructive prompt
where the destructive option is _not_ the recommended outcome — the
modal exists because the user navigated away by accident, and the
default action should preserve work (NN/g, Apple HIG, Material).
Other destructive prompts (reset all data, delete an entity) are
the opposite: the user explicitly asked for the destructive thing,
so the loud red accept is correct. A per-call flag keeps both
patterns served by the single `confirm-host` shell without
splintering it into two components.

**Discarded.**

- Inverting at the `ConfirmHost` level globally — would have leaked
  into delete-entity / reset-data prompts where loud accept is
  correct.
- Renaming `acceptTone: 'danger'` to imply visual emphasis — the
  tone (color) and the emphasis (which button is primary) are
  orthogonal axes; conflating them makes future variants harder.
- Two separate components (`ConfirmHost` vs `DiscardHost`) — the
  shell, modal, ESC handling, focus trap, and resolver semantics
  are identical; only the button cluster differs.

**Files.**

- [`src/app/core/services/confirm-host.service.ts`](src/app/core/services/confirm-host.service.ts) — `emphasis` field on `ConfirmRequest`.
- [`src/app/core/services/discard-dialog.service.ts`](src/app/core/services/discard-dialog.service.ts) — opts in.
- [`src/app/shared/components/confirm-host/confirm-host.component.ts`](src/app/shared/components/confirm-host/confirm-host.component.ts) — `acceptClass` / `rejectClass` computeds.
- [`src/app/shared/components/confirm-host/confirm-host.component.html`](src/app/shared/components/confirm-host/confirm-host.component.html) — conditional ordering.

---

## 47 — Admin list pages collapse to single-row chrome; live entity count beside the title (2026-05-08)

**Decision.** Agents / groups / users list pages drop the
two-row `header + page__action-bar` pattern in favour of a single
sticky `.page__header`. Identity (title + a live `N <entity_plural>`
count, tabular-nums) sits on the left; search → cols → export → primary
CTA cluster on the right with a divider before the CTA so the visual
weight is "secondary actions · primary action."

- Search width is pinned to 280px (was elastic 1fr up to 480px) so
  the right cluster reads as a tight group rather than an elastic
  strip.
- The bottom 12px surface→transparent gradient that softens the
  scroll cutoff moves with the header — same affordance, one row
  fewer.
- Close-icon size 13 → 14 so all chrome icons sit on the same scale
  (consistency rule from ui-ux-pro-max).
- The count uses `font-variant-numeric: tabular-nums` so it doesn't
  twitch as the table filters.

**Why.** Two rows of chrome were pushing the table down without
adding information. The Linear / Notion / Stripe shape gets the
table to first paint sooner and clusters the actions semantically
(secondary tools vs primary CTA). The live count gives a constant
"where am I after filtering" cue that the original layout was
missing entirely.

**Discarded.**

- Putting count in a subtitle line under the title — added a
  vertical row without giving up the action-bar one. Net loss.
- Moving search into a `Cmd-K` only modal (no inline input) —
  faster keyboard path but worse for occasional users; kept the
  inline search with the kbd hint as the discoverability cue.
- Sweeping templates / labels list pages in the same commit — they
  share the old shape and would benefit, but they have unrelated
  concerns (templates has a kind-filter rail, labels has an inline
  colour editor) that deserve their own pass.

**Files.**

- `src/app/features/admin/{agents,groups,users}/pages/*-list-page.component.html`
- `src/app/features/admin/{agents,groups,users}/pages/*-list-page.component.scss`

(Lives on the `explore/form-aircall-shell` branch — not yet on
`main`. Templates and labels still carry the old two-row pattern.)

---

## 46 — Three AED defaults pages built end-to-end from Figma, per-card dirty/save flows, shared SCSS primitives (2026-05-07)

**Decision.** `/config/aed/servicio`, `/config/aed/agentes` and
`/config/aed/grupos` ship the real Figma forms (nodes 258:9396,
224:9167, 224:9482) — not placeholders.

- Servicio carries **two** independent SettingsCards (Estados +
  Conversaciones), each with its own dirty/saving signals and Save
  button — matches the Figma source which draws two footers. Tag
  input + chips for unavailability states, status visibility list
  with coloured dots, callblending webhook + 6-event notification
  picker.
- Agentes carries one card. The "Llamadas" accordion uses a real
  `<table>` for the destino × LLAMADA × TRANSFERENCIAS grid, with
  `<th scope>` for both axes and column headers that double as
  "select-all-in-column" toggles via `aria-label` on the embedded
  checkbox. Iframe configurable: switch + URL/Título inputs that
  only render when the switch is on (no dead inputs in disabled
  state).
- Grupos carries one card with Capacidad (radio + number),
  Tiempos (2 numbers), Voz/desbordamiento (codec select + 2
  switches), Enrutamiento (2 selects), Apertura de ficha (3 radios).

Shared chrome — `.settings-card`, `.sub-section`, `.divider`,
`.field`, `.grid--2`, `.radio-row`, `.switch-field`, `.btn` — lives
in `features/config/aed/aed-defaults-page.component.scss` and is
loaded by all three pages via `styleUrls`. Page-specific extras
(accordion + table for Agentes; tag-input/chips/visibility/events
list for Servicio) sit alongside in their own component SCSS.

**Why the per-card save (Servicio).** The Figma draws two footers
intentionally — Estados and Conversaciones are conceptually
independent areas; saving one shouldn't save the other. The cost
is two pairs of `dirty()` / `saving()` signals and two Save / Discard
handlers; the win is matching what the user expects from the design
and avoiding an "I changed something in Conversaciones, why did
Estados save too?" surprise.

**Why a real `<table>` for the destino grid.** Per the ui-ux-pro-max
consult: a 4-row × 2-column matrix with row-axis labels and column-
axis labels is exactly what `<table>` semantics serves. A CSS grid
would visually match but lose the row/column relationship for
screen readers. Column-header checkboxes carry `aria-label="Marcar
todos en LLAMADA"` so the icon-only intent is readable.

**Why dirty-only Discard.** Following the `agent-form-page`
convention: Save is always present (disabled until dirty), Discard
appears only when there are changes. Avoids menu noise when the
user is just browsing settings.

**Discarded.**

- _One global Save at page level for Servicio_ — simpler in code,
  but breaks the Figma's two-card mental model and would require
  resolving inter-card dirty interactions. Two saves is closer to
  the source of truth.
- _Sticky page-level "Cambios sin guardar" pill_ (the secondary
  recommendation from the UX consult). Kept it on the shelf — none
  of these pages today is long enough to lose Save out of viewport.
  If the iframe section grows or new sub-sections land, revisit.
- _Reactive Forms / FormGroup._ Each page is a flat list of
  primitives with no validators worth the FormGroup overhead.
  Signals + plain `(input)/(change)` handlers are smaller and
  matched the rest of the codebase.

**How to roll back.** Replace the three component templates with
the previous `aed-sub-placeholder.component.html` (deleted in this
push, recoverable from git). Drop the new `*.scss` files. The shell

- sidebar stay; only the page contents revert. ~10 minutes.

---

## 45 — AED becomes the inner-shell hub; Numeración especial migrates to Sistema as a section (2026-05-07)

**Decision.** The `/config/aed/*` URL space is now the home for the
SettingsShell pattern (DD#44). Three sub-routes: Servicio, Agentes,
Grupos — defaults that apply to those entities globally. The `/aed`
root redirects to `/aed/servicio` so the rail always shows a
selected item on first visit.

The previous `/config/aed` page content (numeración especial — the
country-prefix multi-select with chips and search) was extracted to
`features/config/sections/numeracion-especial-section.component.*`
and embedded inside Sistema as one of five cross-cutting prefs
sections (Apariencia · Datos · Políticas de contraseñas ·
Regeneración masiva · Numeración especial).

The settings sidebar items mirror Figma 224:9167 exactly: Servicio
("Estados y conversaciones"), Agentes ("Parámetros por defecto"),
Grupos ("Parámetros por defecto"), with Phone / UserRound /
UsersRound icons.

**Why.** The user's IA put the inner shell on AED, not on the whole
of `/config/*`. AED is its own product surface — its config is
naturally per-area (services / agents / groups) — whereas Sistema
is a single page of cross-cutting browser-level preferences. Having
the shell only on AED keeps Sistema's flat presentation and avoids
the redundancy of two stacked sidebars (main + settings) on every
config child.

Numeración especial is conceptually a system-level cross-cutting
preference (which prefixes count as "special"), so it sits more
naturally next to Apariencia / Datos than under "AED defaults".

**Discarded.**

- _Wrap every `/config/_` route in the shell.\* Was the first
  implementation. Reverted because the user clarified the shell is
  AED-specific.
- _Keep AED as a single page (numeración especial) and add the new
  sub-pages as siblings._ Couldn't — the user's IA explicitly puts
  Servicio/Agentes/Grupos under AED.
- _Inline the country picker into Sistema's component class._ Would
  have ballooned Sistema to ~600 lines and mixed two unrelated save
  flows (Sistema's reset vs Numeración especial's discard/save).
  Extracting to a section component keeps each piece self-contained.

**How to roll back.** Restore the old `pages/aed-page.component.*`
files (deleted; recoverable from git), revert `config.routes.ts` to
the flat `/config/aed` route, drop the `aed/` and `sections/`
folders, remove the `<aed-numeracion-especial-section />` from
Sistema's template. ~15 minutes.

---

## 44 — SettingsShell pattern: 256px sticky rail + main outlet, scoped to /config/aed/\* only (2026-05-07)

**Decision.** A new `SettingsShellComponent` (in
`features/config/layout/`) wraps the AED hub routes with a
two-column layout: a sticky 256px settings sidebar on the left
(white surface + 1px right border) and a `<router-outlet>` on
the right that paints the muted page canvas
(`var(--sc-bg-secondary-subtle)`).

The sidebar (`SettingsSidebarComponent`) renders:

- Header: "Configuración AED" / "Ajustes de la plataforma"
  (Inter 16/12, primary/subtle text).
- Nav: a `<nav aria-label="Configuración AED">` with three
  `<a routerLink>` items, each with a 32px chip-icon, label,
  and sub-label.
- Footer: `SmartContact · v2.4.0` (small, subtle).

`RouterLinkActive="nav-item--active"` paints the active item;
`ariaCurrentWhenActive="page"` sets `aria-current="page"` on the
active anchor so screen readers announce the current section.

The shell uses `position: sticky; top: 0; height: 100dvh` on the
rail so the sidebar pins to the top of the scrolling
`.app-shell__content` while the main column scrolls normally.

**Why.** Figma node 224:9167 plus 258:9396 / 224:9482 share this
exact pattern. The user's brief was explicit: "Lo importante que
quiero que entiendas es el settings sidebar y el main container."
Anchoring Save/Discard / context to a fixed rail beats threading
"context breadcrumbs" through every page header for a multi-page
config area.

Scoped to `/config/aed/*` (and not `/config/*` as a whole) per
DD#45 — the shell is conceptually the "AED hub", not a generic
settings frame.

**Why no skip-link / no focus trap.** This is not a modal. The
rail and main are both reachable via Tab in visual order. A
skip-link is a nice-to-have but adds chrome that today's surfaces
don't justify; revisit when an audit calls it out.

**Why no mobile collapse yet.** The product is a supervisor admin
tool — desktop usage dominates and the breakpoint coverage was out
of scope for this session. The recommended path (per the ui-ux-pro-
max consult) is collapsing to a `<select>` above main below 768px;
flagged in SESSION-LOG as queued.

**Discarded.**

- _Rail with the same items as the main app sidebar's "Configuración"
  tree (Seguridad / Personalización / AED / Integraciones / Sistema)_
  — was the first implementation, before the user clarified the
  layout is AED-specific.
- _Backdrop-blur or glass on the rail._ Same reasoning as DD#43:
  blur is the AI-SaaS fingerprint we walk away from. Solid surface
  - 1px border is the deliberate choice.
- _Compact-when-stuck rail._ Same reasoning as DD#43: not yet
  worth the IntersectionObserver complexity at today's content
  volume.

**How to roll back.** Revert `config.routes.ts` to flatten the
`/aed/*` routes back into `/config/*`. Delete the `layout/` folder.
Each AED sub-page can render standalone (they don't reach into
the shell or sidebar). ~5 minutes.

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

- column templates, and accept that the agents/users/groups screens
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

- PrimeNG's `ConfirmationService` removed from `app.config.ts` and
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
— breaks `<form>` submission. `<input type="checkbox">` _without_
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
_everywhere_. Removing lazy loading entirely (single bundle) —
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
because hover _is_ a continuous gesture.

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
inputs (`entityPluralKey` _or_ `entityPlural`) with a runtime
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
controls only the _text_ inside the span, not the element itself.

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
_into_ an allocated space.

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

**Order is newest-first** — DD#1 is at the bottom, the most recent
decision sits at the top. When a session decides something load-bearing,
insert a new numbered section **at the top of the file** (just under the
header, above the current first entry), with the next number in
sequence. Lead with **what** in one sentence, then **why** (the actual
reason, not a paraphrase of the decision), and **what was discarded
and why**. Date in `YYYY-MM-DD` to anchor it in time.

This footer stays at the bottom; it's a writing-convention reference,
not a chronological entry.
