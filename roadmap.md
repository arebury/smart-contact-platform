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

- **Keyboard-shortcuts overlay (`?`)** — `<aed-keyboard-shortcuts>`,
  same scope as the palette. Built so the prototype documents its own
  shortcuts; same product decision applies.

If either is rolled back: delete the corresponding component folder,
remove the `<aed-…>` tag from `app.component.html`, drop the registry
entry in `shared/components/index.ts`. The rest of the codebase is
unaffected.

## Known debt

- Routes resolve to `loadComponent: placeholder` for everything except `/admin/labels`. Each feature flips its own routes when migrated.
- The `AgentsStore` is a stub (only the `agents` signal + cascading delete + count map). The Agents feature owns the real implementation.
- Imports in feature pages still use deep relative paths (`../../../../../core/...`). The TS path aliases (`@core/*`, `@shared/*`, `@features/*`) are configured in `tsconfig.json` but not yet applied; convert in a single sweep at the end of Phase 3.
- The undo / cross-tab / nav-guard infrastructure is still pending (decision #3 says 1:1 with the prototype). It lands when the first feature that needs it (Users) is migrated.
