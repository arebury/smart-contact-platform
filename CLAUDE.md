# Smart Contact Platform — root CLAUDE memory

> Cross-project orchestration. For app/package-specific context, read the
> CLAUDE.md in each `apps/<x>/` or `packages/<x>/`.

## ¿Qué es esto?

Monorepo de Smart Contact (SC). Contiene apps (AED, ds-docs, eventualmente
Memory) y el Smart Contact Design System (SCDS) compartido entre ellas.

## Estructura

```
apps/
  aed/             ← Supervisor module (Angular 21 + PrimeNG). Existing app.
  ds-docs/         ← SCDS docs site (Angular 21). Crece componente a componente.
packages/
  design-system/   ← SCDS: tokens + componentes compartidos.
docs/              ← Cross-project: SESSION-LOG, NEXT-SESSION-PLAN, prototype-reference.
```

## Workflow

- **Componentes y refactors menores**: directo a `main`, sin ceremony PR.
- **Cambios estructurales** (foundation, refactors grandes): rama + PR.
- Netlify auto-deploya 2 sites desde este repo (AED + ds-docs).
- `npm run build:all` compila ambas apps; `npm run start:aed` / `start:ds-docs` arranca cada una.

## Convenciones de marca

- Brand prefix de componentes: **`sc-`**. Folder `apps/aed/src/app/features/config/aed/` es excepción (`aed` ahí es nombre de feature, no marca).
- Tokens CSS: `--sc-*`. Definidos en `packages/design-system/tokens/layers/`.
- Dark mode: clase `.sc-dark` en `<html>`. Toggled por `ThemeService`.
- Bridge a PrimeNG: `packages/design-system/tokens/sc-preset.ts` (`ScPreset`).

## No-goals

- NO renombrar `features/config/aed/` (es feature, no marca).
- NO mover `sc-preset.ts` fuera de design-system — es load-bearing.
- NO bootstrap Custom Variables collection en Figma hasta tener 5+ componentes con divergencias documentadas.
- NO migrar Memory 3.0 al monorepo todavía. Fase 3, futura.

## Estado actual

- Foundation Fase 1 completada (PR `chore/sc-monorepo`). Monorepo establecido, AED migrado a `apps/aed/`, ds-docs scaffold con button gallery.
- Siguiente: componente Input (text/email/password) — `packages/design-system/components/input/`, page en `apps/ds-docs/`, doc en `packages/design-system/docs/components/`.

## Para más detalle

- [docs/SESSION-LOG.md](docs/SESSION-LOG.md) — historia cross-project.
- [docs/NEXT-SESSION-PLAN.md](docs/NEXT-SESSION-PLAN.md) — plan vigente.
- [apps/aed/CLAUDE.md](apps/aed/CLAUDE.md) — AED-specific.
- [packages/design-system/CLAUDE.md](packages/design-system/CLAUDE.md) — SCDS-specific.
- [packages/design-system/docs/MIGRATION-INVENTORY.md](packages/design-system/docs/MIGRATION-INVENTORY.md) — inventario de componentes y su estado.
