# Smart Contact Platform — root CLAUDE memory

> 🧭 **Primera lectura obligatoria al arrancar sesión**:
> [`docs/DOCS-INDEX.md`](docs/DOCS-INDEX.md) — mapa de source-of-truth por tipo
> de información y por producto. Sin este index, cualquier update parcial
> desalinea docs entre sesiones.

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
  ds-docs/         ← SCDS docs site (Angular 21).
packages/
  design-system/   ← SCDS: tokens + componentes compartidos.
docs/              ← Cross-project: DOCS-INDEX, SESSION-LOG, NEXT-SESSION-PLAN, etc.
```

## Onboarding cross-sesión — qué leer y dónde

| Si necesitas... | Lee |
|---|---|
| Mapa completo de docs y jerarquía | [`docs/DOCS-INDEX.md`](docs/DOCS-INDEX.md) |
| Estado actual + plan inmediato | [`docs/NEXT-SESSION-PLAN.md`](docs/NEXT-SESSION-PLAN.md) |
| Historia de sesiones | [`docs/SESSION-LOG.md`](docs/SESSION-LOG.md) |
| Decisiones AED | [`apps/supervisor/docs/DECISIONS.md`](apps/supervisor/docs/DECISIONS.md) |
| Decisiones Memory | [`apps/supervisor/docs/memory/DECISIONS.md`](apps/supervisor/docs/memory/DECISIONS.md) |
| Decisiones SCDS | [`packages/design-system/docs/DECISIONS.md`](packages/design-system/docs/DECISIONS.md) |
| Deuda DS pendiente | [`packages/design-system/docs/inconsistencies-backlog.md`](packages/design-system/docs/inconsistencies-backlog.md) |
| Brand divergences | [`packages/design-system/docs/customs-catalog.md`](packages/design-system/docs/customs-catalog.md) |
| Inventario migración Memory | [`docs/memory-migration-inventory.md`](docs/memory-migration-inventory.md) |
| Memorias pedagógicas | [`docs/case-study-notes.md`](docs/case-study-notes.md) |

**Regla operativa**: cada tipo de información vive en UN doc canonical (ver
`DOCS-INDEX.md`). Al cerrar trabajo, solo se actualiza el doc cuyo contenido
cambió esa sesión. El resto queda estable.

## Workflow

- **Componentes y refactors menores**: directo a `main`, sin ceremony PR.
- **Cambios estructurales** (foundation, refactors grandes): rama + PR.
- Netlify auto-deploya 2 sites desde este repo (Supervisor + ds-docs).
- `npm run build:all` compila ambas apps; `npm run start:supervisor` /
  `start:ds-docs` arranca cada una. Para Playwright local con dev server,
  usar `--no-hmr` (ng serve plano no enlaza puerto en Angular 21 de este repo).

## Convenciones de marca

- Brand prefix de componentes: **`sc-`**. Folder
  `apps/supervisor/src/app/features/config/aed/` es excepción
  (`aed` ahí es nombre de feature, no marca).
- Tokens CSS: `--sc-*`. Definidos en `packages/design-system/tokens/layers/`
  (7 capas — ver DD-1 en SCDS DECISIONS.md).
- Dark mode: clase `.sc-dark` en `<html>`. Toggled por `ThemeService`.
- Bridge a PrimeNG: `packages/design-system/tokens/sc-preset.ts` (`ScPreset`).
- **Toda primitive nueva en SCDS → entry en customs-catalog** (DD-7).

## No-goals

- NO renombrar `features/config/aed/` (es feature, no marca).
- NO mover `sc-preset.ts` fuera de design-system — es load-bearing.
- NO cocinar componentes SCDS pure-sc sin pasar el checklist
  `customs-catalog §0` (4 preguntas obligatorias).

## Sub-CLAUDE.md (contexto específico por carpeta)

- [`apps/supervisor/CLAUDE.md`](apps/supervisor/CLAUDE.md) — Supervisor app.
- [`packages/design-system/CLAUDE.md`](packages/design-system/CLAUDE.md) — SCDS.
