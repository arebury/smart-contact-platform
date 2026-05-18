# Supervisor — CLAUDE memory

> App shell de Smart Contact. Angular 21 + PrimeNG, consume SCDS desde
> `packages/design-system/`. Alberga AED (estable) y Memory (en migración
> desde el prototipo React `arebury/Memory` → `legacy-react/`).

## ¿Qué es esto?

`apps/supervisor/` es la app Angular única del módulo Supervisor de Smart
Contact. Sirve un shell común (sidebar + topbar + outlet + auth + i18n +
theme) y carga feature modules lazy:

- **AED** — `features/admin/`, `features/config/`, `features/supervision/`.
  Estable en producción. Gestiona agentes, grupos, etiquetas, repositorios
  y la sección de configuración. Es el primer consumer de SCDS y la fuente
  de validación para promover componentes a `packages/design-system/`.
- **Memory** — `features/memory/` (en construcción, Eje 3 del mapa
  estratégico). Migración del prototipo React `memoryplus3.netlify.app` a
  Angular + SCDS. Comparte sidebar, topbar y auth con AED.

> Histórico: hasta Session 35 (2026-05-18) este directorio se llamaba
> `apps/aed/`. El rename a `apps/supervisor/` refleja que el shell cubre
> múltiples feature modules, no solo AED.

## Convenciones

- Selectores brand-prefijados con `sc-` (excepto carpeta `features/config/aed/`
  donde `aed` es nombre de feature, no marca).
- Componentes shared se importan vía `@shared/components/*` (mapea a
  `packages/design-system/components/*` por TS path).
- Servicios core en `apps/supervisor/src/app/core/services/`. State con signals.
- Tests con Karma/Jasmine; specs en `*.spec.ts` junto al archivo.
- i18n via `@ngx-translate`; archivos en `apps/supervisor/src/assets/i18n/`.
- Dark mode togglea `.sc-dark` en `<html>` desde `ThemeService`.

## Stack

- Angular 21 (standalone, signals, `@if`/`@for`)
- PrimeNG 21 + `@primeng/themes/aura` vía `ScPreset`
- Lucide icons + PrimeIcons
- `@angular/cdk` para drag-drop
- `xlsx` para export
- `@playwright/test` para validación visual

## No-goals

- NO tocar features sin antes leer `docs/DECISIONS.md` para entender el contexto histórico.
- NO mockear DB en tests críticos (ver feedback histórico).
- NO crear capas de abstracción nuevas para "futuras necesidades" sin discusión.

## Estado actual

- AED: 24+ componentes custom en producción, todos consumiendo `--sc-*` tokens.
- Migración monorepo cerrada en Foundation Fase 1.
- Rename `apps/aed/` → `apps/supervisor/` ejecutado en S35 antes de arrancar
  Memory migration (S35 Fase 2.5).
- Próximo: Memory migration features Phase-by-phase desde
  `arebury/Memory/legacy-react/`.

## Para más detalle

- [docs/DECISIONS.md](docs/DECISIONS.md) — decisiones arquitectónicas AED (DDs 1-63). Histórico — narra cuando este directorio se llamaba `apps/aed/`.
- [docs/DECISIONES.md](docs/DECISIONES.md) — PM-friendly version, español.
- [docs/MEMORY.md](docs/MEMORY.md) — doc histórico del módulo AED (NO confundir con el módulo Memory de Smart Contact que se está migrando en `features/memory/`).
- [docs/ROADMAP.md](docs/ROADMAP.md) — roadmap por feature.
- [docs/ux-audit.md](docs/ux-audit.md) — UX audit histórico.
