# AED — CLAUDE memory

> Supervisor module de Smart Contact. Angular 21 + PrimeNG, consume SCDS
> desde `packages/design-system/`.

## ¿Qué es esto?

AED gestiona agentes, grupos, etiquetas, repositorios y la sección de
configuración del módulo Supervisor. Es la primera app que cocina y
consume SCDS — sus patrones (modal, toast, form-section-nav, etc.) son
la fuente de validación para promover componentes a `packages/design-system/`.

## Convenciones

- Selectores brand-prefijados con `sc-` (excepto carpeta `features/config/aed/`).
- Componentes shared se importan vía `@shared/components/*` (mapea a `packages/design-system/components/*` por TS path).
- Servicios core en `apps/aed/src/app/core/services/`. State con signals.
- Tests con Karma/Jasmine; specs en `*.spec.ts` junto al archivo.
- i18n via `@ngx-translate`; archivos en `apps/aed/src/assets/i18n/`.
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

- 24 componentes custom en producción, todos consumiendo `--sc-*` tokens.
- Migración monorepo recién completada (Foundation Fase 1).
- Próximo: depurar `::ng-deep` de deuda real y reescribir `sticky-form-header` con API en `photo-upload` (ver `packages/design-system/docs/audit/00-diagnosis.md` Fase 4).

## Para más detalle

- [docs/DECISIONS.md](docs/DECISIONS.md) — decisiones arquitectónicas AED (DDs 1-63).
- [docs/DECISIONES.md](docs/DECISIONES.md) — PM-friendly version, español.
- [docs/MEMORY.md](docs/MEMORY.md) — proyecto memory (stack, conventions, history).
- [docs/ROADMAP.md](docs/ROADMAP.md) — roadmap por feature.
- [docs/ux-audit.md](docs/ux-audit.md) — UX audit historico.
