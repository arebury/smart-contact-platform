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

## How to add a new entry

When a session decides something load-bearing, append a numbered section
here. Lead with **what** in one sentence, then **why** (the actual reason,
not a paraphrase of the decision), and **what was discarded and why**. Date
in `YYYY-MM-DD` to anchor it in time.
