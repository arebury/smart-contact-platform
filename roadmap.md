# Roadmap

> Living progress tracker. Update at the end of every meaningful merge.
> Last reviewed: 2026-05-05 (after Agents shipped).

Legend: ✅ done · 🟡 in progress · ⬜ not started · 🚧 blocked

---

## Phase 0 — Analysis ✅

- ✅ Prototype inventory (20 functional pages + 16 placeholders)
- ✅ Token JSON → PrimeNG mapping table
- ✅ Ambiguity resolution with user (5 questions answered, see [`docs/phase-0-analysis.md`](./docs/phase-0-analysis.md))

## Phase 1 — Repo scaffolding ✅

- ✅ Configs (`package.json`, `angular.json`, `tsconfig*`, ESLint, Prettier, EditorConfig, `.gitignore`, `.nvmrc`)
- ✅ CI workflow (`.github/workflows/ci.yml` — install / format check / lint / test / build)
- ✅ Bootstrap (`src/main.ts`, `src/index.html`, `app.component`, `app.config`, `app.routes`)
- ✅ Folder structure for `core/`, `shared/`, `features/admin|config|supervision`
- ✅ Lazy-loaded route tables wired to a `PlaceholderPageComponent`

## Phase 2 — Token system ✅

- ✅ `src/app/core/tokens/sc-tokens.css` (~200 tokens: 8 color scales × 11 steps + typography + spacing + radius + semantic + custom + label palette)
- ✅ PrimeNG `--p-*` overrides (primary scale → blue, surface scale → gray, content/text/borders, radius, form fields, focus ring, status presets, mask, modal/popover overlays)
- ✅ Token authoring guide ([`src/app/core/tokens/README.md`](./src/app/core/tokens/README.md))

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
- ⬜ **Deferred:** column-visibility selector (with localStorage persistence), frozen-column data table, photo upload preview, language multi-select, schedule + label multi-select, default outbound group, iframe URL, max-chats. Lands with shared `MultiSelectChip` and `FileUpload` primitives.

## Phase 4 — Full README + technical docs ⬜

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
| Unsaved-changes guard | ⬜ | Pending — needed by create/edit forms |
| Discard dialog | ⬜ | Pending — needed by create/edit forms |
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
- The undo / cross-tab / nav-guard infrastructure is still pending (decision #3 says 1:1 with the prototype). It lands when the first feature that needs it (Users) is migrated.

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
- **Tri-state vs binary matrix headers.** Tras DD#55, los dos consumers
  de `.perm-matrix` (agent-form + aed-agentes) usan `<input type="checkbox">`
  binario en los headers de columna; al desmarcar una sola fila del cuerpo,
  el header sigue `checked` (bug sutil — no refleja "algunas activas pero
  no todas"). El otro patrón (`agent-channel-table`) sí usa
  `<aed-tri-state-checkbox>`. *Fix:* sustituir en ambos consumers de
  `.perm-matrix`. **Baja.**
- **Avatar size mismatch.** `agent-channel-table` usa `[size]="26"`
  (illustrated pool, agentes en group-form), `group-assignment-table`
  usa `[size]="22"` (abstract pool, grupos en agent-form). *Fix:*
  igualar a 24 en ambos. **Baja.**
- **Modal footer layout intent indocumentado.** `aed-confirm-host` tiene
  footer 50/50 (DD#54), el resto de modals (delete dialogs) flush-right —
  intencional, pero un futuro contribuidor no lo sabrá. *Fix:* comentario
  explicativo en `confirm-host.component.scss` referenciando DD#54.
  **Baja.**
