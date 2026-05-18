# Smart Contact Platform — root CLAUDE memory

> Cross-project orchestration. For app/package-specific context, read the
> CLAUDE.md in each `apps/<x>/` or `packages/<x>/`.

## ¿Qué es esto?

Monorepo de Smart Contact (SC). Contiene la app Supervisor (alberga AED y
Memory como feature modules), el site ds-docs y el Smart Contact Design
System (SCDS) compartido entre ellas.

## Estructura

```
apps/
  supervisor/      ← App Supervisor (Angular 21 + PrimeNG). Shell único con
                     features/admin, features/config, features/supervision
                     (AED) y features/memory (en migración desde React).
  ds-docs/         ← SCDS docs site (Angular 21). Crece componente a componente.
packages/
  design-system/   ← SCDS: tokens + componentes compartidos.
docs/              ← Cross-project: SESSION-LOG, NEXT-SESSION-PLAN, case-study-notes.
```

> Histórico: `apps/supervisor/` se llamó `apps/aed/` hasta Session 35
> (2026-05-18). Renombrada para reflejar que el shell alberga múltiples
> feature modules, no solo AED.

## Workflow

- **Componentes y refactors menores**: directo a `main`, sin ceremony PR.
- **Cambios estructurales** (foundation, refactors grandes): rama + PR.
- Netlify auto-deploya 2 sites desde este repo (Supervisor + ds-docs).
- `npm run build:all` compila ambas apps; `npm run start:supervisor` / `start:ds-docs` arranca cada una.

## Convenciones de marca

- Brand prefix de componentes: **`sc-`**. Folder `apps/supervisor/src/app/features/config/aed/` es excepción (`aed` ahí es nombre de feature, no marca).
- Tokens CSS: `--sc-*`. Definidos en `packages/design-system/tokens/layers/`.
- Dark mode: clase `.sc-dark` en `<html>`. Toggled por `ThemeService`.
- Bridge a PrimeNG: `packages/design-system/tokens/sc-preset.ts` (`ScPreset`).

## No-goals

- NO renombrar `features/config/aed/` (es feature, no marca).
- NO mover `sc-preset.ts` fuera de design-system — es load-bearing.
- NO bootstrap Custom Variables collection en Figma hasta tener 5+ componentes con divergencias documentadas.
## Estado actual

- Foundation Fase 1 completada (PR `chore/sc-monorepo`). Monorepo establecido, AED migrado a `apps/supervisor/` (rename S35), ds-docs scaffold con button gallery.
- Session 35: rename `apps/aed/` → `apps/supervisor/` para alojar Memory como feature module hermano. Memory migration en curso desde `arebury/Memory/legacy-react/`.

## Para más detalle

- [docs/SESSION-LOG.md](docs/SESSION-LOG.md) — historia cross-project.
- [docs/NEXT-SESSION-PLAN.md](docs/NEXT-SESSION-PLAN.md) — plan vigente.
- [docs/case-study-notes.md](docs/case-study-notes.md) — apuntes pedagógicos del proyecto.
- [apps/supervisor/CLAUDE.md](apps/supervisor/CLAUDE.md) — Supervisor app-specific.
- [packages/design-system/CLAUDE.md](packages/design-system/CLAUDE.md) — SCDS-specific.
- [packages/design-system/docs/MIGRATION-INVENTORY.md](packages/design-system/docs/MIGRATION-INVENTORY.md) — inventario de componentes y su estado.
