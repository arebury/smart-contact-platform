# Project memory

> Architectural decisions and conventions for AED. The "why" behind the code,
> for anyone who joins the project after this point. Update whenever a
> decision is taken that affects multiple files or future contributors.

For full decisions with discarded alternatives, see [`DECISIONS.md`](./DECISIONS.md).
For the running journal of what each session changed, see [`SESSION-LOG.md`](./SESSION-LOG.md).

---

## Session-end protocol

When the user types **"cerramos"**, **"cerrar sesión"**, **"lo dejamos"**,
**"paramos aquí"**, **"hasta mañana"**, **"nos vemos"** or any equivalent
end-of-session cue, the assistant runs the wrap-up routine without asking
permission first:

1. `git status` → if there are uncommitted changes, commit them with a
   Conventional-Commits message that summarises what landed since the last
   commit.
2. `git push` to origin.
3. Append a new dated section to [`SESSION-LOG.md`](./SESSION-LOG.md) with
   the things worked on, key decisions, blockers / open questions, and
   what's queued next. Newest entry on top.
4. If the session locked in a load-bearing decision (changes architecture,
   discards an alternative, sets a project-wide rule), add a numbered entry
   to [`DECISIONS.md`](./DECISIONS.md) with WHY and WHAT-WAS-DISCARDED-AND-WHY.
   If the rule is universal, also reflect it here in `memory.md`.
5. Reply with one or two sentences confirming what was pushed and where
   the log entry is.

**Why this exists.** Each session should leave the repo with both the code
and a written trail of how we got there, so the next session (and any
future contributor) doesn't have to re-derive context from `git log` alone.

---

## Stack

| Layer | Choice | Rationale |
| --- | --- | --- |
| Framework | Angular 18 — standalone components, signals, `@if` / `@for` control flow, `inject()` over constructor DI | Latest stable when the migration started; standalone removes NgModule boilerplate. |
| UI library | PrimeNG 18 with the **Aura** preset (`@primeng/themes`) | Aura is the official modern preset, has the cleanest CSS-variable surface (`--p-*`), and matches the Figma UI Kit. |
| State | Angular signals + `@Injectable({ providedIn: 'root' })` services | Replaces the prototype's Zustand stores. `localStorage`-backed when persistence is needed. |
| i18n | `@ngx-translate/core` v15 with HTTP loader (`/assets/i18n/<locale>.json`) | Runtime locale switch without rebuilding. Default `es`; adding `en` is a JSON copy. |
| Icons | `lucide-angular` (registered per consumer; nav-wide registry in `core/icons/nav-icons.ts`) | Same iconography as the React prototype; PrimeIcons covers ~80% but misses the brand-specific ones. |
| Drag-drop | `@angular/cdk` (`CdkDropList`) | PrimeNG Table has no row drag-drop; CDK is the standard Angular path. |
| XLSX export | `xlsx` (SheetJS) | Library is framework-agnostic; works the same as in the React prototype. |
| Tests | Karma + Jasmine (Angular CLI default) | Default Angular test runner. `ng test` watch mode locally, `npm run test:ci` headless on CI. |
| Lint | ESLint with `@angular-eslint` + Prettier | Enforces `aed-*` selector prefix and a11y rules on templates. |

---

## Design tokens

The single source of truth is [`src/app/core/tokens/sc-tokens.css`](../src/app/core/tokens/sc-tokens.css). Every visual decision flows through it.

- **JSON wins over the prototype look (decision #1).** When the prototype's
  monochrome theme conflicts with `design-tokens-complete.json`, the JSON
  wins. Brand primary is `#1b273d` (blue/700), accent is `#5ad3e6`
  (soft-blue/500), default radius is 6 px (`radius-200`).
- **Three-layer token system.** Section 1 declares JSON primitives, section 2
  semantic aliases, section 3 custom extensions (shadows, z-index, layout
  sizes, motion), section 4 PrimeNG `--p-*` overrides.
- **`--p-*` variables only ever appear in section 4.** Components must
  reference `--sc-*`. Do not introduce a new `--p-*` declaration outside the
  override block — it desyncs the system.
- **Label / tag colors are isolated.** Eight categorical hues live under
  `--sc-label-<color>-{bg,text,border,dot}` and explicitly do not double as
  brand semantics (a "red" tag is not a "danger" signal). Four hues
  (orange, amber, teal, purple) are not in the JSON; they are hardcoded
  Tailwind-equivalents inside the same file.

---

## Project structure conventions

```
src/app/
├── core/        # Singletons: layout, services, guards, directives, tokens, icons.
├── shared/      # UI components and pipes used across multiple features.
└── features/    # Domain folders: admin/, config/, supervision/.
                 #   <feature>/data/   - Static seed data + types.
                 #   <feature>/state/  - @Injectable signal stores wrapping createLocalStore.
                 #   <feature>/components/ - Feature-private components.
                 #   <feature>/pages/<page>/ - Routed pages.
```

- **Components are standalone, OnPush, signal-input based.** Use `input()` /
  `output()` / `model()` from `@angular/core` (Angular 18 API) — never the
  legacy `@Input()` / `@Output()` decorators in new code. `@Input` does not
  drive `computed()`, which is a footgun.
- **Selector prefix is `aed-`** (enforced by ESLint).
- **`changeDetection: ChangeDetectionStrategy.OnPush`** is mandatory.
- **No `any`.** TypeScript strict mode is on; lint blocks `any`.
- **No raw values for color, spacing, typography or radius.** Everything
  flows through `--sc-*` tokens.

---

## Cross-cutting infrastructure

| Concern | Where | Notes |
| --- | --- | --- |
| Local-storage persistence | `core/services/local-store.factory.ts` | Returns a `LocalStore<T>` with signal `items` + CRUD. Versioned (bump `currentVersion` to invalidate stale data). Each domain wraps it inside an `@Injectable` service. |
| Toasts | PrimeNG `MessageService` + `<p-toast>` mounted in `app.component.html` | Replaces the prototype's `sonner`. Use `messages.add({ severity, summary, life })`. |
| Confirmations | PrimeNG `ConfirmationService` + `<p-confirmDialog>` | For one-off confirmations. Multi-step delete dialogs (Labels, Agents) ship as feature-specific components. |
| Click-outside | `core/directives/click-outside.directive.ts` | Pattern: `(aedClickOutside)="close()" [aedClickOutsideEnabled]="open"`. Listens to `pointerdown` and `Escape`. |
| Breadcrumbs | `core/services/breadcrumb.service.ts` | Pages call `breadcrumbs.set([...])` in `ngOnInit`, `clear()` in `ngOnDestroy`. The TopBar renders the trail. |
| XLSX export | `core/services/xlsx-export.service.ts` | Wraps SheetJS with header styling, autosizing and a success toast. |

The undo-stack, cross-tab warning and unsaved-changes guard are still pending
(they will land alongside the Users / Groups / Agents forms which actually
need them).

---

## Routes

- The shell (sidebar + topbar) lives at `''` and wraps every routed view.
- Feature route tables are lazy-loaded:
  `features/admin/admin.routes.ts`,
  `features/config/config.routes.ts`,
  `features/supervision/supervision.routes.ts`.
- All URLs stay in **Spanish** (`/admin/grupos`, not `/admin/groups`) to
  preserve link compatibility with the prototype. UI labels also stay in
  Spanish for now — i18n is wired but only `es.json` ships.
- Routes that are not yet implemented load the shared
  `PlaceholderPageComponent` so the navigation tree renders end-to-end.

---

## Things that are intentionally NOT in the build

- **Angular Material / MDC.** PrimeNG covers all needs; mixing both bloats the
  bundle and conflicts on theming.
- **Tailwind CSS.** The token system already covers spacing/typography. Adding
  Tailwind would mean two parallel design surfaces.
- **Zustand / NgRx / Akita.** Signals + injectable services do the job for
  this app's complexity profile.
- **A "global" CLAUDE.md or .cursorrules.** Conventions live here; tools that
  can read project files will find them.

---

## Reference docs

- [`docs/phase-0-analysis.md`](./phase-0-analysis.md) — full Phase 0
  analysis (page inventory, token mapping, ambiguity resolution).
- [`roadmap.md`](./roadmap.md) — feature-by-feature progress.
- [`src/app/core/tokens/README.md`](../src/app/core/tokens/README.md) — how to
  add or change a design token.
- [`docs/prototype-reference/`](./prototype-reference/) — frozen React + Vite +
  Tailwind + shadcn/ui prototype that the Angular project is migrated from.
  Read-only reference; do not import from it.
