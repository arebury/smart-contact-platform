# Roadmap

> Living progress tracker. Update at the end of every meaningful merge.
> Last reviewed: 2026-06-02 (after S67 — config Contact Center + typography migration).
>
> Scope: AED roadmap. SCDS internals (tokens, dividers, multiselect, type-parity)
> are noted here only where a config/feature consumes them; the component itself is
> tracked in its canonical home (see `docs/DOCS-INDEX.md`).

Legend: ✅ done · 🟡 in progress · ⬜ not started · 🚧 blocked

---

## Phase 0 — Analysis ✅

- ✅ Prototype inventory (20 functional pages + 16 placeholders)
- ✅ Token JSON → PrimeNG mapping table
- ✅ Ambiguity resolution with user (5 questions answered, see [`docs/phase-0-analysis.md`](./phase-0-analysis.md))

## Phase 1 — Repo scaffolding ✅

- ✅ Configs (`package.json`, `angular.json`, `tsconfig*`, ESLint, Prettier, EditorConfig, `.gitignore`, `.nvmrc`)
- ✅ CI workflow (`.github/workflows/ci.yml` — install / format check / lint / test / build)
- ✅ Bootstrap (`src/main.ts`, `src/index.html`, `app.component`, `app.config`, `app.routes`)
- ✅ Folder structure for `core/`, `shared/`, `features/admin|config|supervision`
- ✅ Lazy-loaded route tables wired to a `PlaceholderPageComponent`

## Phase 2 — Token system ✅

- ✅ `src/app/core/tokens/sc-tokens.css` (~200 tokens: 8 color scales × 11 steps + typography + spacing + radius + semantic + custom + label palette)
- ✅ PrimeNG `--p-*` overrides (primary scale → blue, surface scale → gray, content/text/borders, radius, form fields, focus ring, status presets, mask, modal/popover overlays)
- ✅ Token authoring guide ([`src/app/core/tokens/README.md`](../src/app/core/tokens/README.md))

## Phase 3 — Component migration

### 3.0 — Layout shell ✅

- ✅ `ClickOutsideDirective` (+ tests)
- ✅ `BreadcrumbService` (+ tests)
- ✅ `core/icons/nav-icons.ts` Lucide registry
- ✅ Recursive `SidebarNavItemComponent` + `SidebarComponent` (4+ levels of nesting, active-state path normalization, design-decisions shortcut)
- ✅ `TopBarComponent` (breadcrumb trail, user menu with click-outside dismiss)
- ✅ Wired into `AppShellComponent`
- ✅ i18n keys for nav

### 3.1 — Labels ✅

- ✅ Generic `createLocalStore<T>` factory (`core/services/local-store.factory.ts`)
- ✅ `XlsxExportService` (`core/services/xlsx-export.service.ts`)
- ✅ Shared `BulkActionBarComponent`, `LabelChipComponent`, `ColorDotPickerComponent`
- ✅ Stub `AgentsStore` for cascading delete + agent counts
- ✅ `LabelsStore` (signal-backed, localStorage versioned)
- ✅ `LabelFormPanelComponent` (inline create/edit, validation, color picker)
- ✅ `DeleteLabelsDialogComponent` (single + bulk, agent-impact callout)
- ✅ `LabelsPageComponent` (search, sort, table, empty state, context menu, row menu, bulk actions, XLSX export)
- ✅ Route wired at `/admin/labels`
- ✅ i18n keys

### 3.2 — Templates ✅

- ✅ `TemplatesStore` with auto-stamped createdAt / updatedAt
- ✅ Tabs Chat / Email with per-tab counts
- ✅ Inline form panel (title / channel toggle / body + variables hint)
- ✅ Search scoped to active tab, sort, bulk delete via shared `DeleteEntityDialog`
- ✅ Route `/admin/plantillas` + i18n
- ✅ Promoted shared `DeleteEntityDialog` (single mode with copy-to-confirm + bulk mode with chip-prune) and `ClipboardService`

### 3.3 — Repositories ✅

- ✅ Generic `RepoListPageComponent` (search + sort + table with row & context menus + bulk delete + XLSX export)
- ✅ Generic `RepoFormPanelComponent` (data-driven text/textarea/select fields + validation)
- ✅ 9 instance files: Agendas, Horarios, Tipificaciones, Variables, Entidades, Intenciones, Reglas IA, Entidades IA, Clasificación IA — each one self-contained (~120 LoC: type + seed + store + page wrapper)
- ✅ `RepositoriosHubPageComponent` (4 categorías × cards con icono + descripción)

### 3.4 — Config ✅

- ✅ `/config/aed` — country prefix picker over the full ~250-entry COUNTRY_PREFIXES, search by name/code/prefix, removable chips, dirty-aware save bar
- ✅ `/config/seguridad` — políticas de contraseñas (cosméticas) + accordion gating bulk password regen flow with confirm-by-typing-"REGENERAR" + simulated CSV download
- ✅ AgentsStore extended with `code / extension / email / status` so Seguridad can render real rows once Agents ships
- ✅ **Rename de cara al usuario "AED" → "Contact Center" (S67):** solo en i18n
  (nav sidebar, título del índice de config, label "grupo de servicio"). La
  carpeta/selector `features/config/aed` y el código NO se renombran (`aed` es
  nombre de feature, no marca); "AED" como moneda en `country-prefixes` queda
  intacto. Breadcrumb config: "Contact Center › [Sección]". Decisión: DD#67 en
  [`docs/DECISIONS.md`](docs/DECISIONS.md).
- ✅ **Bloque A — jerarquía de color (S67, Figma 1:12270):** lienzo de página
  blanco, bandeja gris contenedora, cards de sección blancas, índice gris
  resaltado; mismo patrón en light/dark vía `:host-context`. Detalle de tokens
  y racional en [`packages/design-system/docs/customs-catalog.md`](../../../packages/design-system/docs/customs-catalog.md).
  Gap de token detectado → deuda #73 (ver Known debt).
- ✅ **Bloque B — estados de agente (S67, granate en Figma 39-1115):** 3 tags
  fijos (Disponible / No disponible / Administrativo) + chips editables removibles
  como función separada; sin token nuevo, master del Kit intacto. Detalle de
  color (tags fijos vs chips editables, granate) en
  [`packages/design-system/docs/customs-catalog.md`](../../../packages/design-system/docs/customs-catalog.md).
- ✅ **P4 — descartar cambios (S67):** botón "Descartar cambios" (outline, aparece
  solo cuando hay cambios) + las 3 rutas config usan `formDirtyGuard`
  (`canDeactivate`, mismo modal "¿Descartar cambios? / Seguir editando" que los
  flujos admin). Componentes implementan `DirtyAware`. Decisión: DD#67.
- ✅ **sc-multiselect — options primitivas (S67):** `sc-multiselect` ahora acepta
  `options` como `string[]` (`hasPrimitiveOptions` + `resolvedOptionLabel/Value`,
  portado de `sc-select`); arregla los 4 multiselect de Grupos que salían vacíos.
  Inventario del componente en
  [`packages/design-system/docs/MIGRATION-INVENTORY.md`](../../../packages/design-system/docs/MIGRATION-INVENTORY.md).

### 3.5 — Users ✅

- ✅ `UsersStore` (CRUD + duplicate that marks the copy as a draft)
- ✅ List page: search across name/email/identifier, sortable columns (drafts pin to top), per-row + context menu, bulk delete, XLSX export, status pill
- ✅ Create / edit form: identity / sections / permissions / services panels, validation for name + email, status toggle
- ✅ Shared `SectionCardComponent` + `StickyFormHeaderComponent` (editable inline name with rename API + save/cancel/delete + spinner state)

### 3.6 — Groups ✅

- ✅ `GroupsStore` (CRUD + duplicate; auto-incrementing codes from "20000")
- ✅ List page with channel chips, priority pill (color tone by level), bulk delete, XLSX export
- ✅ Create / edit form: identity / channels / strategy / agents panels
- ✅ **Drag-drop agent reorder** via `@angular/cdk` `CdkDropList` with grip handle + ghost preview + placeholder styled to design system
- ✅ Strategy panel adapts to selected channels (chat strategy + capacity inputs render only when their channel is enabled)

### 3.7 — Agents ✅

- ✅ `AgentsStore` expanded from slim stub to full prototype schema (channels, presence, permissions, groups, pickup type, etc.); v2 lockfile re-seeds existing browsers
- ✅ List page: 16 seed agents with extension type badge, channel chips, presence pill (color-coded), status pill, bulk delete, XLSX export
- ✅ Create / edit form: 5 sections (identity / contact / channels / groups / permissions matrix split into devices/calls/transfers)
- ✅ "Configuración avanzada" section (2026-05-11, DD#57): single card with progressive-disclosure sub-sections (Labels accordion + Comportamiento/Integración/Regional flat). Surfaces `pickupType`, `randomOrder`, `maxChats`, `iframeUrl`, `externalDevices`, `languages`, `labels`.
- ✅ **Prototype "Configuración avanzada" closed (2026-05-11):**
  - `pickupTypeChat` field added; Comportamiento now shows pickup-call + pickup-chat side by side.
  - Sesión sub-section shipped: `loginExtOverride` toggle + "Seguridad > Expirar contraseña" action with confirm dialog and toast (no Agent state change — action is a UX placeholder until real password flow exists).
- ⬜ **Deferred (older):** column-visibility selector (with localStorage persistence), frozen-column data table, photo upload preview, language multi-select, default outbound group. Lands with shared `MultiSelectChip` and `FileUpload` primitives.

## Phase 4 — Full README + technical docs 🟡

- ✅ **Tipografía migration-safe (S67):** se tokenizaron 367 font-size literales
  → `--sc-font-size-*` (olas 1+2, snap a la escala base-14; cobertura accionable
  48% → 99% → 100%, hero de 88px → `--sc-font-size-900`). Guard Dura 4 bloquea
  cualquier font-size literal nuevo (0 excepciones); `npm run tokens:type-parity`
  es el checker read-only. Los line-heights NO se tocaron (diferidos por
  layout-risk; ver Known debt + inconsistencies-backlog). Racional de blindaje
  (por qué un upgrade de PrimeNG no borra los tipos):
  [`packages/design-system/docs/migration-safety.md`](../../../packages/design-system/docs/migration-safety.md) §Tipografía migration-safe.
  Tooling (escala base-14, olas, guard): [`packages/design-system/tokens/README.md`](../../../packages/design-system/tokens/README.md).
- ⬜ Architecture chapter (data flow, lazy loading, tokens)
- ⬜ Component inventory table
- ⬜ Theming guide (add a token, override PrimeNG, dark mode hooks)
- ⬜ Testing guide
- ⬜ Contribution rules (branch naming, commit format, PR template)

---

## Cross-cutting infrastructure status

| Concern | Status | Where |
| --- | --- | --- |
| Local-storage stores | ✅ | `core/services/local-store.factory.ts` |
| Toast notifications | ✅ (PrimeNG `MessageService`) | `app.component.html` |
| Click-outside | ✅ | `core/directives/click-outside.directive.ts` |
| Breadcrumb service | ✅ | `core/services/breadcrumb.service.ts` |
| XLSX export | ✅ | `core/services/xlsx-export.service.ts` |
| Lucide icon registry | ✅ | `core/icons/nav-icons.ts` |
| Undo stack (`Ctrl+Z`) | ⬜ | Pending — needed by Users / Groups delete flows |
| Cross-tab warning | ⬜ | Pending — needed by create/edit forms |
| Unsaved-changes guard | ✅ (S67-P4) | `formDirtyGuard` (`canDeactivate`) en las 3 rutas config + forms admin; ver DD#67 |
| Discard dialog | ✅ (S67-P4) | Modal "¿Descartar cambios? / Seguir editando" estandarizado config + admin; ver DD#67 |
| Sticky form header | ⬜ | Pending — needed by Users / Groups / Agents forms |
| Section card | ⬜ | Pending — needed by Users / Groups / Agents forms |
| Sortable header | ⬜ | Pending — needed by all list pages with sortable columns |
| Column selector | ⬜ | Pending — needed by Agents list |

---

## Deployment

- ✅ `netlify.toml` (build command, publish dir, SPA fallback, cache headers)
- ✅ `public/_redirects` (SPA fallback for hosts that read it)
- ⬜ Verified `npm install && npm run build` actually produces `dist/aed/browser`
- ⬜ Deploy verified on Netlify (`aedmigration.netlify.app` currently serves an unrelated build)

## Roadmap — prototype-only, NOT for production

These features ship in this prototype to demo the experience, but require
a product/dev decision before going into the production codebase:

- **Command palette (⌘K / Ctrl+K)** — `<aed-command-palette>` +
  `CommandPaletteService`. Modern-SaaS signature move (Linear / Notion /
  Vercel / Stripe). Demo'd here so the team can decide whether the
  palette earns its complexity (global keydown listener, modal layer,
  command catalogue). See `app.component.html` mounting + `core/services/
  command-palette.service.ts`. The `<kbd>⌘K</kbd>` hint inside list-page
  search inputs (`main.scss → .page__search-kbd`) belongs to the same
  feature flag.

- **Keyboard-shortcuts overlay (`?`)** — `<aed-keyboard-shortcuts>` +
  `KeyboardShortcutsService` + the visible `?` trigger button in the
  TopBar (`top-bar.component.html → .top-bar__shortcut`). Same scope
  as the palette. Built so the prototype documents its own shortcuts;
  same product decision applies. If kept, the `?` button stays. If
  dropped, also remove the trigger button from the TopBar.

- **Factory-reset for app data** — `SistemaPageComponent.resetData()`
  (the "Restaurar datos de fábrica" button in `/config/sistema`).
  Wipes every `smartcontact_*` localStorage key and reloads so each
  store re-seeds from its in-code defaults. Exists because the
  prototype runs entirely on `createLocalStore`, so a tester who
  deletes seed agents/groups/users while exploring has no
  out-of-the-box way back. Production replaces the seed data with
  a real backend, at which point this button stops making sense and
  should be removed (along with its i18n keys under
  `config.sistema.data.*`).

If any of these are rolled back: delete the corresponding component
folder, remove the `<aed-…>` tag from `app.component.html`, drop
the registry entry in `shared/components/index.ts`, and remove the
TopBar trigger button (`?` only). The rest of the codebase is
unaffected.

## Future-leaning, already prototyped

These features ship in this prototype to demo behaviour, but their
real value lands when production datasets grow past the size that
fits in one viewport. Today they're nice-to-have; at 200+ entities
per list they become structural.

- **Sticky action bar (search + column manager + export)** on the
  three list pages (agents, users, groups). At today's seed sizes
  (~30 entities) the action bar barely scrolls out of view, so the
  feature reads as polish. At 200+ entities it stops being polish:
  the user iterates search → scroll → refine → repeat without ever
  losing the input. Already implemented; documented in DD#43.

  Watch for: the sticky bar costs ~60 px of vertical real estate
  on every page. On 1366×768 laptops with the topbar (56) + page
  header (~80) + sticky bar (~60) + bulk-action-bar (56 when active)
  fixed, the table window can shrink to ~520 px (~7 rows). If a
  future audit decides this is too cramped, the next iteration is
  "compact when stuck" (smaller padding + icon-only buttons when
  the bar has reached `top: 0`), tracked there. Linear and Notion
  do this; would need an `IntersectionObserver` sentinel because
  CSS doesn't expose a `:stuck` pseudo-class.

## Deferred UX — scoped out with constraints

Features intentionally **not** shipped, with the constraint that drove
the decision. If the constraint changes (or the cost-of-not-having
becomes high), revisit.

- **"Ver agente" desde el formulario de grupos.** Cuando el supervisor
  está editando un grupo y quiere consultar un agente de la tabla
  (horarios, otros grupos, permisos), hoy tiene que ir al sidebar →
  Agentes → buscar → abrir.
  - *Por qué no se hizo:* la plataforma productiva real no permite
    tener la misma sesión activa en dos pestañas, así que la opción
    natural ("→" que abre el agente en pestaña nueva) no funciona en
    producción. Las alternativas tienen su coste: (a) navegar en la
    misma pestaña dispara el modal de descartar cada vez que el admin
    solo quería echar un vistazo, fricción alta; (b) drawer / popover
    inline añade un componente nuevo + estado + diseño propio
    (¿qué info muestra exactamente?). Para una primera iteración no
    está claro que valga la pena.
  - *Cuándo revisarlo:* si el supervisor reporta que "estoy todo el
    rato consultando agentes mientras configuro grupos" se vuelve
    real. Entonces vale la pena diseñar el popover con calma: qué
    datos resumir (estado / canales totales derivados de los links /
    grupos en los que está / horarios), tamaño, accesibilidad,
    interacción con el dirty-state del form padre.
  - *Implicación si la plataforma real se relaja (acepta multi-pestaña):*
    el patrón "→ abre en pestaña nueva con `target="_blank"`" pasa a ser
    trivial — un `<a>` con icono Lucide, cero estado nuevo. Es la
    primera opción a probar.

## Known debt

- Routes resolve to `loadComponent: placeholder` for everything except `/admin/labels`. Each feature flips its own routes when migrated.
- The `AgentsStore` is a stub (only the `agents` signal + cascading delete + count map). The Agents feature owns the real implementation.
- Imports in feature pages still use deep relative paths (`../../../../../core/...`). The TS path aliases (`@core/*`, `@shared/*`, `@features/*`) are configured in `tsconfig.json` but not yet applied; convert in a single sweep at the end of Phase 3.
- The undo / cross-tab infrastructure is still pending (decision #3 says 1:1
  with the prototype). The nav-guard piece shipped in S67-P4 (`formDirtyGuard`);
  undo and cross-tab warning remain.
- **Token gap #73 — `--sc-bg-canvas`** (S67-A): no hay un token único para el
  lienzo de página (blanco en light / gris-950 en dark); el `settings-shell` lo
  resuelve hoy con override por tema. Diferido + plan de fix (proceso Custom de
  Figma) en [`packages/design-system/docs/inconsistencies-backlog.md`](../../../packages/design-system/docs/inconsistencies-backlog.md) #73.
- **Tipografía — diferidos para próxima sesión** (S67): rediseño de line-heights
  (no tocados por layout-risk), tamaños display, y contraste del índice en dark.
  Registrados en [`packages/design-system/docs/inconsistencies-backlog.md`](../../../packages/design-system/docs/inconsistencies-backlog.md).

## UI consistency debt — cross-form drift (DD#54 audit · 2026-05-11)

Catalogued during DD#54 wrap-up. Six items grouped by priority. Pick from
the top in the next polish session.

- ~~**Permission matrix duplicated** between agent-form (`.perm-matrix`) and
  `/admin/aed/agentes` (`.permisos-table`)~~. ✅ **Done (2026-05-11, DD#55).**
  Promoted to `src/styles/_forms.scss` as single canonical `.perm-matrix`
  block; aed-agentes migrated to share it. Column-header DOM order
  unified to label-before-checkbox in both consumers.
- ~~**Pill status with hex literals + animation drift.**~~ ✅ **Done
  (2026-05-11, DD#56).** Base `.pill` + `--type` + `--status-*`
  promoted to `src/styles/_forms.scss`; user-form's hex literals
  replaced with `--sc-presence-available` / `--sc-presence-available-deep`
  tokens; `status-pop` animation now uniform across all three forms.
  Dead `--type` (agent-form) and `--channel` (group-form) variants
  purged in the same pass.
- ~~**Dead `.toggle` SCSS block** en `user-form-page.component.scss:124-169`~~. ✅ **Done (2026-05-11, PR #24).**
  Track + thumb declarations removed; form already uses `<aed-toggle-switch>`.
- ~~**Tri-state vs binary matrix headers.**~~ ✅ **Done (2026-05-11).**
  Both consumers of `.perm-matrix` (agent-form + aed-agentes) now use
  `<aed-tri-state-checkbox>` in the column header. Header reflects
  `none` / `some` / `all` derived from the body rows; click cycles
  none→all and all/some→none. Label-before-checkbox order preserved
  via `flex-direction: row-reverse` override scoped to
  `.perm-matrix__th-col` in `_forms.scss`.
- ~~**Avatar size mismatch.**~~ ✅ **Done (2026-05-11).** Both
  consumers now use `[size]="24"` (was 22 in `group-assignment-table`
  and 26 in `agent-channel-table`).
- ~~**Modal footer layout intent indocumentado.**~~ ✅ **Done
  (2026-05-11).** `confirm-host.component.scss` comment now
  references DD#54 explicitly so future contributors trace the
  50/50-vs-flush-right decision to its source.

**Audit closed.** All six items shipped. New cross-form drift, if any,
gets a fresh audit pass in a future session.
