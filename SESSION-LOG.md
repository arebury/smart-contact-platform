# Session log

> Append-only journal of what happened in each working session. Newest at the
> top. Each entry is short and scannable so the next session (or contributor)
> picks up the context in under a minute.
>
> Convention: when the user types "cerramos", "cerrar sesión", "lo dejamos",
> "paramos aquí" or similar, the assistant appends a new entry, commits, and
> pushes — see [`memory.md`](./memory.md#session-end-protocol).

---

## 2026-05-06 · Session 6 — Bulk bar Figma re-skin, danger zone, programmatic confirm host

**Worked on**

- **Bulk action bar Figma alignment** (Figma node 81:10750). The dark,
  edge-to-edge bottom bar moved to a light, floating, rounded-corner card
  inset from the viewport edges (`bottom: spacing-400`,
  `left: sidebar-width + spacing-500`, `right: spacing-500`,
  `radius-200`, drop shadow on all four sides). The "Editar" popover
  trigger was replaced by an inline `Cambiar [select] a [select] [Aplicar]`
  form rendered directly in the bar — same `BulkEditCommit` output, no
  consumer churn across the 6 list pages. PrimeNG `popover` dependency
  dropped from `aed-bulk-edit-menu`. `.btn--bulk-danger` flipped from
  subtle red to solid red-600 to match the canonical danger button on a
  light surface. Native `<select>` styled to match the Figma dropdown
  (white bg, gray-300 border, 36px tall, 6px radius, custom chevron).
- **Danger zone refactor**. The "Eliminar" button left the sticky form
  header on Group / Agent / User edit pages and moved to a new shared
  `<aed-form-danger-zone>` component rendered at the bottom of each form.
  Visual treatment: full red-200 border, white surface, no severity
  stripe, gray-800 title + gray-600 description + `btn--danger-subtle`
  trigger inline-right. Solid red was deliberately rejected — the whole
  point of the move is to lower destructive-action protagonism, so the
  button color stayed soft. `canDelete` / `delete` output / `trashIcon`
  / `--ghost-danger` button class all removed from
  `aed-sticky-form-header`. Three per-entity description i18n keys
  added (`{groups,users,agents}.form.danger_zone_description`) plus a
  shared title `common.danger_zone.title`.
- **Programmatic confirm host migrated to `aed-modal`**. The
  "¿Descartar cambios?" dialog (used by the `formDirtyGuard` route guard
  and anywhere `await discardDialog.confirm()` is called) was rendering
  the raw PrimeNG `<p-confirmDialog>` chrome — wrong shell, didn't match
  the Figma 1037:34069 modal. New architecture: a `ConfirmHostService`
  exposes `request(opts): Promise<boolean>` plus signals; a single
  `<aed-confirm-host>` component, mounted once in `app.component.html`,
  binds those signals to an `<aed-modal>`. `DiscardDialogService.confirm()`
  keeps the same public API, internally calls `confirmHost.request(...)`.
  `ConfirmDialogModule` + `ConfirmationService` removed from `app.config.ts`
  and `app.component.ts`. Same canonical shell as every other dialog now.
- **`delete-labels-dialog` migration to `aed-modal`**. Was the last
  dialog still rendering `<p-dialog>` directly with custom header / footer
  templates. Now uses the canonical shell — removes ~50 lines of bespoke
  header / button SCSS, picks up `btn--secondary` / `btn--danger` from
  the global button system.
- **Communication-style memory**. User flagged they're not a developer;
  saved a `feedback_communication_style.md` memory so future sessions
  default to plain Spanish in chat (code, commits, docs stay technical).

**Decisiones tomadas**

- Bulk bar IA flip is a real change, not a paint job: dropdown-popover
  trigger gone, inline form in its place. Decision logged as DD#28.
- Destructive actions on edit pages move from the sticky header to an
  end-of-form danger zone (Stripe / GitHub pattern). Decision logged
  as DD#29.
- Programmatic confirms route through one `aed-modal`-backed host
  instead of PrimeNG's `ConfirmationService`. Decision logged as DD#30.
- DTCG-style tokens JSON as future single source of truth — punted to
  a later session. Decision logged as DD#31 with the proposed phasing
  (mirror current CSS into JSON first, then bidirectional Figma
  sync via Style Dictionary or Tokens Studio later).

**Bloqueos / decisiones diferidas**

- Tokens JSON / Style Dictionary work intentionally deferred — too big
  for this turn, deserves its own session.

**Queued next**

- Audit the rest of the app for any remaining raw `<p-dialog>` usages
  (inventory came back clean today: only `aed-modal`, `aed-confirm-host`,
  `aed-delete-entity-dialog`, `aed-impact-preview-dialog`,
  `aed-delete-labels-dialog` use the canonical shell now). Re-check
  before adding any new dialog.
- Start the tokens JSON spec (DD#31 phase 1: extract today's CSS into
  a DTCG-format mirror, no behavior change) when there's an opening.

---

## 2026-05-06 · Session 5 — Mirror-eval close, design system Figma, polish pass · **MIGRATION CLOSED**

**Worked on** (13 PRs merged in order — PRs #1–4 are the Session 4 block from
earlier the same day; this entry covers PRs #5–13 plus the wrap-up.)

- **Form parity** ([PR #5](https://github.com/arebury/aed/pull/5)). Closed
  the prototype gaps the mirror-eval flagged for the long forms:
  `<aed-photo-upload>` shared component (round avatar with hover overlay,
  JPG/PNG/GIF up to 800 KB, "Eliminar foto" link); `AVAILABLE_LANGUAGES`
  + multi-select chip pattern in the Agent form; two-column layout in
  the User form with a sticky 280px summary sidebar (photo + name + email
  / type / identifier rows + Grupos/Servicios tab strip).

- **Cleanup** ([PR #6](https://github.com/arebury/aed/pull/6)). Moved
  `AVAILABLE_GROUPS_REF` + the `AgentGroupRef` type from the Agents
  feature to `shared/data/groups-ref.ts` so the User form stops crossing
  feature boundaries with relative imports. Re-exported under the old
  name for back-compat.

- **List polish + toast Figma** ([PR #7](https://github.com/arebury/aed/pull/7)).
  Three new shared primitives: `<aed-empty-state>` (centered card with
  CTA, `min-height: 320px` so empty↔populated doesn't shift the page
  header), `<aed-group-popover>` (count trigger that reveals 5 group
  names + "+N más" on hover or focus, floats above the table), and
  `<aed-result-counter>` (small footer "{N} {entity_plural} encontrados",
  reserved row so the bulk action bar doesn't overlap). Inline
  validation parity in the Agent form. Toast template rebuilt to match
  the Smart Contact Figma design (tinted bg + saturated border + colored
  square severity icon + Inter SemiBold 14/22 / 12/18); new
  `--sc-toast-*` tokens.

- **Counter wiring** ([PR #8](https://github.com/arebury/aed/pull/8)).
  Result counter into Labels, Templates and the generic `repo-list-page`
  (which fans out to all 9 repository instances). Refactor:
  `entityPluralKey` (translate key) → `entityPlural` (already-translated
  literal) so the repo-list-page can pass `config().entityPluralSpanish`
  without registering 9 i18n keys.

- **Bug-fix wave + agent labels** ([PR #9](https://github.com/arebury/aed/pull/9)).
  Sidebar active highlight was broken because `<aed-sidebar-nav-item>`
  used plain `@Input()`s — converted to `input()` signals so the
  computed re-fires on route change. Toast double-X (one ours, one
  PrimeNG's) — fixed the wrong selector (`.p-toast-icon-close` →
  `.p-toast-close-button`). CTA click felt fuzzy — added a global
  micro-interaction layer (100ms hover transitions, `:active { scale(0.98);
  transition: 0 }` for tactile snap, `prefers-reduced-motion` opt-out).
  Closed the last prototype gap: agent labels UI in the form (chip
  picker between Channels and Groups, reuses `<aed-label-chip>`).

- **Canonical button + a11y Sprint A** ([PR #10](https://github.com/arebury/aed/pull/10)).
  Single global `.btn` system in `src/styles/_buttons.scss` matching
  the Smart Contact Figma button (node 195:283). Three fills × four
  states, one canonical size. Deleted the 10 per-page `.btn { … }`
  duplications (~11 KB of SCSS). Sprint A from the UX audit: tables
  get `table-layout: fixed`; global `:focus-visible` on inputs/selects/
  textareas; bulk-delete dialog no longer auto-cancels on last chip
  removal (now offers "Restaurar lista"); top-bar user menu Esc
  closes + returns focus; context menu `clampToViewport()` helper
  applied to all 6 list pages; toast `role="status" aria-live="assertive"`;
  sticky form header `min(80vw, 320px)` for mobile; email regex accepts
  `user+tag@…`. Slop removal (per /impeccable absolute_bans):
  `.cross-tab-warning` and `<aed-sidebar-nav-item>` active state both
  drop the side-stripe pattern for full borders / background tints.
  `.impeccable.md` design context committed.

- **Canonical modal** ([PR #11](https://github.com/arebury/aed/pull/11)).
  `<aed-modal>` shell matching Figma 1037:34069. Three slots (header
  rendered from inputs, body via default `<ng-content>`, footer via
  `<ng-content select="[modal-actions]">`). Wraps PrimeNG `<p-dialog>`
  for focus trap / ESC / mask but hides its chrome. `aria-labelledby`
  / `aria-describedby` on stable per-instance ids. New `--sc-modal-*`
  tokens. `<aed-delete-entity-dialog>` and `<aed-impact-preview-dialog>`
  refactored to compose it; ~160 lines of bespoke chrome SCSS deleted
  in the process.

- **Performance fix** ([PR #12](https://github.com/arebury/aed/pull/12)).
  Added `withPreloading(PreloadAllModules)` to the router config. Every
  page is `loadComponent`/`loadChildren`, so without preloading each
  navigation paid a fetch + parse cost (~50–200 ms perceived as a
  "fuzzy" delay between click and render). With preloading the chunks
  load in the background after the shell is interactive; subsequent
  navigations are instant.

- **Polish final pass** ([PR #13](https://github.com/arebury/aed/pull/13)).
  `<aed-toggle-switch>` shared component replaces the 4 inline
  `<input type="checkbox">`-styled-as-toggle duplications (real
  `role="switch"` input). `100vh` → `100dvh` in the app shell + sidebar
  (iOS Safari URL-bar crop fixed). A11y P2: `aria-describedby` +
  `aria-invalid` on every error-bearing input (Users, Groups, Agents);
  `aria-hidden` on spinner icons; `prefers-reduced-motion` opt-out for
  the spin keyframes. Last hex hardcode (`#fff` in photo-upload) →
  `var(--sc-color-gray-0)`.

**Decisiones tomadas** (full rationale in DECISIONS.md #20–27)
- #20 `ResultCounter` takes an already-translated literal, not a key
- #21 Press feedback is `scale(0.98)` with zero transition (snap, not fade)
- #22 Side-stripe borders > 1px are banned (carry-over from /impeccable)
- #23 `.btn` is a global system; per-page `.btn` definitions are forbidden
- #24 Bulk-delete keeps the dialog open at zero chips (auto-cancel was a footgun)
- #25 Modal slots project via attribute selector `[modal-actions]`, not template refs
- #26 Routes preload with `PreloadAllModules` (admin panel; navigation > initial bytes)
- #27 Toggle switch is a real `<input type="checkbox" role="switch">`, never a button

**Bloqueos / decisiones diferidas**
- None outstanding. The audit backlog and the mirror-eval are both
  exhausted save for items requiring real backend (skeleton screens
  during fetch) or out-of-plan product work (the 16 placeholder routes).

**Migration status: CLOSED.**
- Functional parity with the React prototype: complete (last gap, agent
  labels UI, closed in PR #9).
- Smart Contact design system: applied via canonical Button (PR #10),
  Modal (PR #11), Toast (PR #7), and Toggle Switch (PR #13). All flow
  through `--sc-*` tokens; per-component hex was eliminated.
- A11y: focus rings, `aria-live` on toasts and validation,
  `aria-describedby` on errors, Esc closes overlays, viewport bounds on
  context menus, `role="switch"` on toggles, `prefers-reduced-motion`
  honoured by every keyframe + transform.
- Performance: lazy chunks preload; navigation is instant after the
  initial paint.
- CI: green across lint, format, test, build on every PR this session.
- **No backend integration planned** — `localStorage` via
  `createLocalStore` stays as the persistence layer. Skeleton-loading
  states therefore have no meaningful trigger and were intentionally
  not built.

**Queued next**
- Nothing. Future work is product (the placeholder routes when they
  become priorities), not migration debt.

---

## 2026-05-06 · Session 4 — CI green, form-safety pass, undo stack

**Worked on**
- **CI repaired** ([PR #1](https://github.com/arebury/aed/pull/1)). CI was
  red on every commit since #1 — never green. Three classes of failure
  stacked:
  - 6 files in the latest feat commit were not Prettier-formatted.
  - `@angular-eslint/no-output-native` flagged 7 outputs literally named
    `cancel` (a DOM event); renamed to `cancelled` across 8 components
    and the 23 template bindings + 11 self-emit `(click)="cancel.emit()"`
    references.
  - Test host class in `click-outside.directive.spec.ts` violated
    `component-class-suffix` (`HostCmp` → `HostComponent`).
  - Tail problems revealed once lint passed: a11y rule `click-events-have-key-events`
    on two `(click)="$event.stopPropagation()"` wrappers (silenced with
    `eslint-disable-next-line`); `Partial<Agent>` readonly compile error
    inside `bulkUpdate` (refactored to fresh literals per case);
    `NG0600` from dialog effects writing signals (added
    `{ allowSignalWrites: true }`); pre-existing `LabelsPage` spec
    failure (test isolation — `providedIn: 'root'` store cached between
    fixture creations, fixed by deferring fixture creation into each
    test).
- **Form-safety pass** ([PR #2](https://github.com/arebury/aed/pull/2)).
  Closed the four critical safety gaps from the mirror-eval:
  - `DiscardDialogService` (wraps `ConfirmationService`),
    `CrossTabLockService` (DD#169 port), `formDirtyGuard` (`CanDeactivateFn`).
  - Agent / Group / User form pages: `formDirty: signal()` marked in
    every mutator; HostListener Ctrl/Cmd+S → save; HostListener
    `beforeunload` → block when dirty + not saving; cross-tab lock
    acquired in edit mode + banner on conflict; reset `formDirty`
    after save / delete.
  - Routes wired with `canDeactivate: [formDirtyGuard]`.
  - No-CLS validation slot in Users + Groups: `<span class="field__error">`
    always rendered with `min-height: 1.25em` and `aria-live="polite"`;
    `@if` only gates the text content.
- **Undo stack** ([PR #3](https://github.com/arebury/aed/pull/3)). Closed
  the cross-cutting undo gap from the mirror-eval (DD#293):
  - `UndoStackService` (capacity 20, 9s expiry, 8s toast life).
  - Custom toast template in `app.component.html` renders a "Deshacer"
    button when the message carries `data.undoEntryId`.
  - Global Ctrl/Cmd+Z handler in `AppComponent` that skips text fields.
  - Wired in: agents (presence + bulk + duplicate), groups (bulk +
    duplicate), users (duplicate). Delete intentionally excluded
    (DD#2173 from prototype).
- **Workflow gate widened**: `ci.yml` now triggers on every
  `pull_request`, not only those targeting `main`/`develop`. Lets
  stacked PRs get CI feedback before the base merges.

**Decisiones tomadas** (see DECISIONS.md #11–#18 for the full
rationale of each)
- `cancel` is a forbidden output name; rename pattern is `cancel` →
  `cancelled` (past-tense Angular convention for "what happened").
- Form-dirty contract is a `Signal<boolean>` (not a method), read by
  the guard. Lets components define dirtiness however they want.
- DiscardDialog reuses PrimeNG `ConfirmationService` instead of a
  custom modal — `<p-confirmDialog />` already mounted in the shell.
- Cross-tab lock service returns an explicit release function (not
  `effect` + `onCleanup`) so the form's lifecycle owns the cleanup.
- Form keyboard shortcuts (Ctrl+S, beforeunload) live as `@HostListener`
  in each form, not a shared directive — 9 lines × 3 forms beats
  abstraction overhead for what's essentially boilerplate.
- Validation messages render into a reserved slot; `@if` toggles the
  text, not the element. CSS `min-height: 1.25em` + `aria-live="polite"`.
- Undo stack is a non-reactive service holding a mutable array. The
  visible UI is the toast; reactivity inside the service buys nothing.
- Bulk-update undo snapshots full entity objects (not field-level diffs)
  and restores via `updateAgent`/`updateGroup`. Cost is negligible,
  restoration is exact, no per-field switch needed.
- Delete is **not** undoable — DD#2173 from prototype, intentional.
- Ctrl+Z skips when focus is in an input/textarea/select/contentEditable
  so the browser's native undo for typed text is preserved.
- CI workflow triggers on any `pull_request` (no `branches:` filter)
  so stacked PRs run.

**Bloqueos / decisiones diferidas**
- `ng build` and `ng lint` still don't run locally on Node 25. CI is
  the source of truth. `nvm install 20` remains a prerequisite for
  fast local iteration.
- Form-parity gaps from the mirror-eval still pending: photo upload
  (Agents + Users), Languages multi-select (Agents), mini-TOC sidebar
  for long forms, profile-summary sidebar in User form.

**Queued next**
- **Sprint 3 — User+Agent form parity**: photo upload, languages
  multi-select, mini-TOC sidebar, User profile sidebar.
- **Sprint 4 — List polish**: frozen Name column, group-count popover
  in Agents, result counter footer, empty/loading states.
- `ToggleSwitchComponent` migration (still pending from Session 3).

---

## 2026-05-06 · Session 3 — Bulk + duplicate parity, list polish, no-CLS pass

**Worked on**
- Cuatro primitivas compartidas nuevas en `src/app/shared/components/`:
  `InlineRenameCellComponent` (input que reemplaza la celda nombre tras un
  duplicate, sin layout shift) · `ColumnSelectorComponent` (popover PrimeNG
  + persistencia versionada en `localStorage`) · `ImpactPreviewDialogComponent`
  (preview de operación bulk con chips removibles al hover) ·
  `BulkEditMenuComponent` (popover con field-picker → value-picker que emite
  un `commit` para que el caller abra el impact preview).
- `AgentsStore`: `bulkUpdate(ids, field, value)` + `updatePresence(id, p)` +
  `duplicate` ahora marca status=inactive y prefija "Copia de …".
- `GroupsStore`: `bulkUpdate(ids, field, value)` con priority/strategy/channels.
- Las 3 listas (Agents / Groups / Users) cableadas con: row-click → edit
  (arregla "no me deja entrar"), inline rename tras duplicate, column selector,
  bulk edit + impact preview (Agents y Groups; Users mantiene paridad sin
  bulk edit), `common.draft_badge` en lugar del namespace de Users, micro-
  interacciones (button press scale, focus rings via `--p-focus-ring-color`,
  draft badge animado, presence dot con halo de color tonal).
- **No-CLS pass**: removed la transición `padding-bottom` que pushaba contenido
  cuando aparecía el bulk action bar. Padding ahora siempre reservado; la
  barra overlaya. Inline rename con misma altura que el span resting.
  Validación de campos pendiente de aplicar el mismo patrón en forms.
- Recuperados via `git cat-file -p <blob>` 4 archivos del shell que macOS
  borró por sí solo (`app-shell.component.{ts,html,scss,spec.ts}`); más
  duplicados " 2.ts" creados por el FS bajo presión. Disco al 95%.

**Decisiones tomadas**
- **Layout-shift-as-defect**: nueva regla de diseño persistida en memoria
  (`feedback_no_layout_shift.md`). Bulk bars overlayan; inline editors,
  validation slots y presence selector reservan espacio mínimo.
- **Inline duplicate sin nueva fila**: en vez de la "fila debajo del source"
  del prototipo (que empujaría el resto del listado hacia abajo), el draft
  se crea normal — al pinnear arriba ya aparece como fila propia — y solo
  la celda nombre entra en modo edit. Cancelar borra el draft para no
  dejar "Copia de …" huérfanos.
- **Column selector keyspace**: `sc_<entity>_columns_v1` con sufijo `_vN`
  para invalidar prefs del usuario cuando se renombre/elimine una columna.
- `common.draft_badge` reemplaza `users.draft_badge` (UX-audit issue).

**Bloqueos / decisiones diferidas**
- **macOS FS / disco 95%**: borrados espontáneos durante writes; bash
  commands lentos; archivos " 2.ts" duplicados aparecen solos. El
  `nvm install 20` + liberar disco siguen siendo prerequisitos para
  validación local sólida.
- **GitHub Actions** sigue rojo desde CI #1 (lint/format/test). Netlify
  deploya OK. Auditar en una PR aparte después de esta.
- **Mirror gap aún por cerrar** (queue siguiente).

**Mirror-evaluation — qué falta del prototipo**
Inventariado contra `docs/prototype-reference/` después de cerrar
duplication + bulk:

*List pages*
- Result counter footer ("N agentes encontrados" — pequeño, abajo)
- Group/Agent count popover en columna Grupos (mostrar primeros N + "+M más")
- Frozen "Name" column visualmente sticky al hacer scroll horizontal
- Confirmación textual en bulk delete cuando count ≥ 3 (UX-audit pending)

*Form pages — paridad de secciones*
- Cross-tab warning (entidad eliminada en otra pestaña)
- Navigation guard con `DiscardDialog` (cambios sin guardar)
- Atajo `Ctrl+S` para guardar
- Validación inline on-blur con slot reservado (no shift)
- Photo upload (Agents, Users)
- Mini-TOC sidebar para forms largos (Agents tiene 5 secciones)
- Sticky form header mostrando entity-type en edit mode
- Languages multi-select en Agents
- Sidebar resumen en User form

*Cross-cutting*
- `ToggleSwitchComponent` custom (hoy se usa `<input type="checkbox">`
  estilizado; el prototipo tiene un switch propio)
- Undo stack con toast actions de 8s (presence change, delete, bulk update)

**Queued next**
- PR aparte: arreglar GitHub Actions CI (`gh run view --log-failed`).
- Iniciar el "form parity pass": cross-tab warning + nav guard + Ctrl+S
  + inline validation con slot reservado, como infra compartida sobre las
  3 features.
- Implementar `ToggleSwitchComponent` y migrar los checkboxes-as-toggle
  de los forms al nuevo componente.

---

## 2026-05-05 · Session 2 — Phase 3 closes + UX audit + docs pack

**Worked on**
- Phase 3.2 Templates → 3.3 Repositories (1 generic + 9 instances + hub) →
  3.4 Config (AED + Seguridad) → 3.5 Users (list + form) → 3.6 Groups
  (list + form with `@angular/cdk` drag-drop) → 3.7 Agents (list + form,
  full schema). Phase 3 cerrada.
- Two new shared components reusable across User/Group/Agent forms:
  `SectionCardComponent` (header + body card) and `StickyFormHeaderComponent`
  (sticky bar with editable inline name + Save/Cancel/Delete + spinner).
- Rewrote `README.md` en español, voz de UX writer, badges +
  navegación clara hacia los demás docs.
- Creó [`SESSION-LOG.md`](./SESSION-LOG.md), [`DECISIONS.md`](./DECISIONS.md),
  bloque de "session-end protocol" en [`memory.md`](./memory.md), y
  [`docs/ux-audit.md`](./docs/ux-audit.md) con ~35 hallazgos accionables
  agrupados por flujo (5 críticos top + 3 críticos para limpiar el sidebar).
- Reflow Prettier de los 66 archivos que faltaban por formatear.
- CI fix de Phase anterior arregla el deploy de Netlify (commit cargado en
  el log de la sesión 1, validado en sesión 2: el sitio sí compila ahora).

**Decisiones tomadas**
- AgentsStore expandido del stub slim al schema completo del prototipo
  manteniendo retro-compat con Labels y Seguridad (aditivo). Lockfile
  versión bumped a 2 para re-seed.
- Para acelerar el cierre de Phase 3 sin perder calidad, se difieren:
  column-visibility selector con persistencia, frozen-column tables,
  cross-tab warning, navigation guard, photo upload preview, undo stack
  integrado, inline rename en list pages. Documentado en
  `roadmap.md` + `DECISIONS.md`.
- Etiquetas de borrador (`draft_badge`) viven en el namespace de Users
  por reutilización; flagged en UX audit como minor inconsistency a
  mover a `common.draft_badge` en próxima ronda.

**Bloqueos / decisiones diferidas**
- Local Node 25.2.1 sigue rompiendo el `ng build` (SemVer issue). Validación
  local solo via `tsc --noEmit`. Recomendación: `nvm install 20` para
  poder iterar en local con build real.
- GitHub Actions sigue fallando en lint/format/test steps — no se han
  auditado todavía. Netlify build OK porque solo corre `npm run build`.
- Disco al 95% durante la sesión causó un `unable to write new index file`
  durante git commit; resuelto borrando `.angular/` cache + reintento.

**Queued next**
- Ejecutar los Top-5 fixes Critical de [`docs/ux-audit.md`](./docs/ux-audit.md)
  en una sola PR de "UX consistency pass" antes de meter feature nueva:
  loading bar global · entity en sticky header en edit mode ·
  validación inline en forms · confirmación textual en bulk delete con
  count ≥ 3 · cross-tab warning + handler de localStorage.
- Auditar y arreglar los GitHub Actions jobs (lint, format-check, test).
- Cuando aterricen Users/Groups/Agents en producción, implementar undo
  stack + cross-tab warning + navigation guard como infra compartida.

---

## 2026-05-05 · Session 1 — Bootstrap to first usable build

**Worked on**
- Phase 0: page inventory of the React+Vite+Tailwind+shadcn prototype, design
  token mapping (JSON → PrimeNG), 5 ambiguity questions resolved.
- Phase 1: Angular 18 + PrimeNG 18 workspace scaffolded with ESLint, Prettier,
  Karma, GitHub Actions CI, Netlify config.
- Phase 2: `sc-tokens.css` token system (~200 tokens, PrimeNG `--p-*` overrides
  on top of the JSON primitives, label-color namespace isolated).
- Phase 3.0: layout shell — Sidebar (recursive 4-level nav with path
  normalization) + TopBar (breadcrumbs + user menu + click-outside dismiss).
- Phase 3.1: Labels feature end to end (color picker, bulk delete with
  cascading agent removal, XLSX export).
- File-system refactor: TS path aliases applied (`@core/*`, `@shared/*`,
  `@features/*`), pages flattened, per-feature route tables, barrel exports,
  prototype moved to `docs/prototype-reference/`, `repositories/shared/`
  renamed to `repositories/components/` to free the alias namespace.

**Decisions taken**
- JSON wins over the prototype's monochrome look — brand reads as
  blue/700 + soft-blue acento + radius-200 default.
- Spanish URLs and UI stay; `@ngx-translate/core` wired now so adding `en` is a
  JSON copy later.
- Migration is **1:1** for what is built. Cross-tab warning, undo stack, photo
  upload preview, navigation guard are deferred until the features that
  actually need them aggregate enough demand to justify shared infra.
- CI uses `npm install` (not `npm ci`) because Karma's `chokidar@3` and
  `@angular/compiler-cli`'s `chokidar@4` produce a transitive tree that
  `npm ci` rejects under strict lockfile validation. Documented in
  [`DECISIONS.md`](./DECISIONS.md).

**Blockers / open questions**
- Local Node.js v25.2.1 crashes Angular CLI (`SemVer is not a constructor`).
  Local builds are validated only via `tsc --noEmit`; full `ng build` runs
  fine on Netlify (Node 20). User should `nvm install 20` to validate
  locally.
- GitHub Actions CI run is failing on the lint / format / test steps — those
  haven't been audited yet. Netlify deploy succeeds because it only runs the
  build step.

**Queued next**
- Migrate Templates → Repositories (hub + 9 instances) → Config (AED + Seguridad)
  → Users → Groups (with CDK drag-drop) → Agents — in that order.
- Audit + fix CI failures (lint, format, test).
- Phase 4: rewrite README in plain language with badges + clear nav.
