# Supervisor — CLAUDE memory

> 🧭 Para mapa completo de docs: [`docs/DOCS-INDEX.md`](../../docs/DOCS-INDEX.md) (root).

App shell Angular 21 + PrimeNG. Consume SCDS desde `packages/design-system/`.
Aloja dos productos como feature modules lazy:

- **AED** — `features/admin/` + `features/config/` + `features/supervision/`.
  Estable en producción. Primer consumer de SCDS.
- **Memory** — `features/memory/` (en migración desde React).
  Comparte sidebar/topbar/auth con AED.

## Docs operativos (source of truth)

| Tema | Doc |
|---|---|
| Decisiones AED (técnicas) | [`docs/DECISIONS.md`](docs/DECISIONS.md) — DD1-63 |
| Decisiones AED (PM-friendly) | [`docs/DECISIONES.md`](docs/DECISIONES.md) |
| Decisiones Memory | [`docs/memory/DECISIONS.md`](docs/memory/DECISIONS.md) — DM-1 a DM-7 |
| Roadmap AED | [`docs/ROADMAP.md`](docs/ROADMAP.md) |
| Roadmap Memory (migración) | [`../../docs/memory-migration-inventory.md`](../../docs/memory-migration-inventory.md) |
| Doc histórico módulo AED | [`docs/MEMORY.md`](docs/MEMORY.md) — **NO confundir con feature Memory** |
| UX audit histórico | [`docs/ux-audit.md`](docs/ux-audit.md) |

## Convenciones rápidas

- Selectores prefix `sc-`. Excepción: `features/config/aed/` (`aed` aquí es nombre de feature).
- Shared via TS path: `@shared/components/*` → `packages/design-system/components/*`.
- Servicios core: `app/core/services/`. State con signals.
- i18n: `@ngx-translate` + `src/assets/i18n/es.json`.
- Dark mode: `.sc-dark` en `<html>` via `ThemeService`.

## Stack

Angular 21 standalone · PrimeNG 21 + Aura via `ScPreset` · Lucide + PrimeIcons ·
`@angular/cdk` (drag-drop) · `xlsx` (export) · `@playwright/test` (validación visual).

## No-goals

- NO tocar features sin leer `docs/DECISIONS.md` primero.
- NO mockear DB en tests críticos.
- NO crear capas de abstracción para "futuras necesidades" sin discusión.
