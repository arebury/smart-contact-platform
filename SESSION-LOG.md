# Session log

> Append-only journal of what happened in each working session. Newest at the
> top. Each entry is short and scannable so the next session (or contributor)
> picks up the context in under a minute.
>
> Convention: when the user types "cerramos", "cerrar sesión", "lo dejamos",
> "paramos aquí" or similar, the assistant appends a new entry, commits, and
> pushes — see [`memory.md`](./memory.md#session-end-protocol).

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
