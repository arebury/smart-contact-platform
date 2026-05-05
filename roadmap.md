# Roadmap

> Living progress tracker. Update at the end of every meaningful merge.
> Last reviewed: 2026-05-05.

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

### 3.2 — Templates ⬜

- ⬜ `TemplatesStore`
- ⬜ Tabs Chat / Email
- ⬜ Inline form
- ⬜ Search + bulk delete
- ⬜ Route + i18n

### 3.3 — Repositories ⬜

- ⬜ Generic `RepositoryListPageComponent` (table + inline form + delete + export)
- ⬜ 9 instance pages: Agendas, Horarios, Tipificaciones, Variables, Entidades, Intenciones, Reglas IA, Entidades IA, Clasificación IA
- ⬜ `RepositoriosHubPage` (grid of 9 cards)

### 3.4 — Config ⬜

- ⬜ `/config/aed` (country prefix picker)
- ⬜ `/config/seguridad` (accordion + regeneration flow with confirmation)

### 3.5 — Users ⬜

- ⬜ `UsersStore`
- ⬜ List page (search, sort, bulk delete)
- ⬜ Create / edit form (sticky header, sections, photo upload)
- ⬜ Sticky form header + section card shared components
- ⬜ Cross-tab warning service + unsaved-changes guard

### 3.6 — Groups ⬜

- ⬜ `GroupsStore`
- ⬜ List page
- ⬜ Create / edit form (multi-section)
- ⬜ Drag-drop agent reorder via `@angular/cdk` `CdkDropList`
- ⬜ Distribution-strategy controls

### 3.7 — Agents ⬜ (heaviest)

- ⬜ `AgentsStore` (full domain — channels, presence, recording, etc.; today only the cascading-delete stub exists)
- ⬜ Column-visibility selector (persistent in localStorage)
- ⬜ Frozen-column data table
- ⬜ Create / edit form

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

## Known debt

- Routes resolve to `loadComponent: placeholder` for everything except `/admin/labels`. Each feature flips its own routes when migrated.
- The `AgentsStore` is a stub (only the `agents` signal + cascading delete + count map). The Agents feature owns the real implementation.
- Imports in feature pages still use deep relative paths (`../../../../../core/...`). The TS path aliases (`@core/*`, `@shared/*`, `@features/*`) are configured in `tsconfig.json` but not yet applied; convert in a single sweep at the end of Phase 3.
- The undo / cross-tab / nav-guard infrastructure is still pending (decision #3 says 1:1 with the prototype). It lands when the first feature that needs it (Users) is migrated.
