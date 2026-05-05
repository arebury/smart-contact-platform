# AED — Supervisor Module

> Angular 18 + PrimeNG 18 implementation of the SmartContact Supervisor module.
> Migrated from the React + Vite prototype archived at [`docs/prototype-reference/`](./docs/prototype-reference/).

---

## Where to start

| If you want to… | Read |
| --- | --- |
| Run the project locally | [Quick start](#quick-start) below |
| Understand architectural decisions | [`memory.md`](./memory.md) |
| See what's done and what's pending | [`roadmap.md`](./roadmap.md) |
| Read the original migration analysis | [`docs/phase-0-analysis.md`](./docs/phase-0-analysis.md) |
| Add or change a design token | [`src/app/core/tokens/README.md`](./src/app/core/tokens/README.md) |
| Inspect the source prototype | [`docs/prototype-reference/`](./docs/prototype-reference/) |

The full technical README — architecture chapter, component inventory,
theming guide, contribution rules — lands in Phase 4. See `roadmap.md` for
the order in which the rest of the project ships.

---

## Quick start

### Prerequisites

- Node.js `>= 20` (see `.nvmrc`)
- npm `>= 10`

### Run

```bash
npm install
npm start          # Serves at wwww
```

### Useful scripts

| Script | Purpose |
| --- | --- |
| `npm start` | Dev server with HMR |
| `npm run build` | Production build → `dist/aed/browser/` |
| `npm test` | Karma + Jasmine watch mode |
| `npm run test:ci` | Headless single-run with coverage |
| `npm run lint` | ESLint + `@angular-eslint` |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check (used in CI) |

---

## Stack

Angular 18 (standalone components, signals, control flow) · PrimeNG 18 with
the **Aura** preset · `@angular/cdk` · `@ngx-translate/core` (default
locale `es`) · `xlsx` · `lucide-angular` · ESLint · Prettier · Karma /
Jasmine.

See [`memory.md`](./memory.md#stack) for the rationale behind each choice.

---

## Project layout

```
src/
├── app/
│   ├── core/            # Singletons: layout, services, guards, directives, tokens, icons
│   ├── shared/          # Cross-feature UI components and pipes
│   └── features/        # admin/, config/, supervision/
├── assets/i18n/         # Translation JSONs (es.json today; add en.json to enable English)
├── environments/        # Per-environment config
└── styles/              # Global SCSS entry + reset + token bridge
```

The full convention — feature subfolders, naming, signal-input rule, etc. —
lives in [`memory.md`](./memory.md#project-structure-conventions).

---

## Design tokens

All colors, spacing, typography and radii flow through `--sc-*` custom
properties declared in [`src/app/core/tokens/sc-tokens.css`](./src/app/core/tokens/sc-tokens.css).
That file is the single source of truth — no component declares raw values
inline. PrimeNG's `--p-*` variables are overridden inside the same file in
section 4. To add or change a token, follow the rules in
[`src/app/core/tokens/README.md`](./src/app/core/tokens/README.md).

---

## Deployment

The repository ships with a `netlify.toml` and a `public/_redirects` file.
On Netlify (or any compatible static host):

- **Build command**: `npm ci && npm run build`
- **Publish directory**: `dist/aed/browser`
- **Node version**: `20` (read from `.nvmrc`)

The `_redirects` rule (`/* /index.html 200`) is required so client-side
routes survive a hard refresh.
