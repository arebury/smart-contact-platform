# Smart Contact Platform

Monorepo de Smart Contact (SC) — apps + design system compartido.

<p>
  <img alt="Angular"    src="https://img.shields.io/badge/Angular-21.2-DD0031?logo=angular&logoColor=white">
  <img alt="PrimeNG"    src="https://img.shields.io/badge/PrimeNG-21-1976D2">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white">
  <img alt="Workspaces" src="https://img.shields.io/badge/npm-workspaces-CB3837?logo=npm&logoColor=white">
  <img alt="Node"       src="https://img.shields.io/badge/node-%E2%89%A520-339933?logo=node.js&logoColor=white">
</p>

## Estructura

```
smart-contact-platform/
├── apps/
│   ├── supervisor/      ← App Supervisor (Angular + PrimeNG): shell único
│   │                       con features AED + Memory (en migración)
│   └── ds-docs/         ← Smart Contact Design System docs site
└── packages/
    └── design-system/   ← SCDS: tokens + componentes compartidos
```

> Histórico: `apps/supervisor/` se llamó `apps/aed/` hasta Session 35 (2026-05-18).
> Renombrada para reflejar que el shell aloja múltiples feature modules.

## Apps

| App | Purpose | URL |
|-----|---------|-----|
| `apps/supervisor` | Shell Supervisor: AED (agentes, grupos, etiquetas, repos, config) + Memory (conversaciones, reglas, repositorio IA — en migración desde React) | aedmigration.netlify.app |
| `apps/ds-docs` | Docs del Smart Contact Design System | _TBD_ |

## Packages

| Package | Purpose |
|---------|---------|
| `packages/design-system` (`@sc/design-system`) | Tokens `--sc-*` en 7 capas + 24 componentes Angular + `ScPreset` para PrimeNG. Consumido por todas las apps. |

## Empezar

```bash
git clone https://github.com/arebury/smart-contact-platform.git
cd smart-contact-platform
npm install

# Arrancar el shell Supervisor (AED + Memory) en localhost:4200
npm run start:supervisor

# Arrancar ds-docs en localhost:4300
npm run start:ds-docs

# Build de las 2 apps
npm run build:all
```

## Workflow

- **Componentes nuevos y refactors menores**: directo a `main`.
- **Refactors estructurales**: rama + PR.
- **Foundation / cross-app changes**: ver `docs/NEXT-SESSION-PLAN.md`.

## Para más detalle

- [CLAUDE.md](CLAUDE.md) — orchestration cross-project (memoria persistente).
- [apps/supervisor/README.md](apps/supervisor/README.md) — Supervisor app README detallado.
- [packages/design-system/CLAUDE.md](packages/design-system/CLAUDE.md) — SCDS conventions.
- [packages/design-system/docs/MIGRATION-INVENTORY.md](packages/design-system/docs/MIGRATION-INVENTORY.md) — inventario de componentes.
- [docs/SESSION-LOG.md](docs/SESSION-LOG.md) — historia cross-project.
