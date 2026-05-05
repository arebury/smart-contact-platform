# Session log

> Append-only journal of what happened in each working session. Newest at the
> top. Each entry is short and scannable so the next session (or contributor)
> picks up the context in under a minute.
>
> Convention: when the user types "cerramos", "cerrar sesión", "lo dejamos",
> "paramos aquí" or similar, the assistant appends a new entry, commits, and
> pushes — see [`memory.md`](./memory.md#session-end-protocol).

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
