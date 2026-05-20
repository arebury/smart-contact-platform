# Smart Contact Design System (SCDS) — CLAUDE memory

> 🧭 Para mapa completo de docs: [`docs/DOCS-INDEX.md`](../../docs/DOCS-INDEX.md) (root).

Tokens + componentes consumidos por AED, Memory y ds-docs. **Source of
truth de identidad visual SC**.

## Contenido del package

- **Tokens** en 7 capas CSS (`tokens/layers/`) — primitive → semantic → palette
  → component → extensions → primeng-bridge → dark.
- **Componentes** Angular standalone (`components/`) — wrappers de PrimeNG +
  pure-sc justificados.
- **Bridge PrimeNG** (`tokens/sc-preset.ts`) — mapea cada `--p-*` a su `--sc-*`.

## Docs operativos (source of truth)

| Tema | Doc |
|---|---|
| Decisiones arquitectónicas SCDS | [`docs/DECISIONS.md`](docs/DECISIONS.md) — DD-1 a DD-7 |
| Inventario componentes + estado | [`docs/MIGRATION-INVENTORY.md`](docs/MIGRATION-INVENTORY.md) |
| Brand divergences vs Aura | [`docs/customs-catalog.md`](docs/customs-catalog.md) |
| Backlog deuda DS | [`docs/inconsistencies-backlog.md`](docs/inconsistencies-backlog.md) |
| Reglas blindaje migración | [`docs/migration-safety.md`](docs/migration-safety.md) |
| Patrones banned / canónicos | [`docs/impeccable.md`](docs/impeccable.md) |
| Spec por componente | [`docs/components/01-XX.md`](docs/components/) |
| Audits históricos | [`docs/audit/`](docs/audit/) |
| Guía tokens (español, diseño) | [`tokens/GUIA.md`](tokens/GUIA.md) |
| Guía tokens (técnica) | [`tokens/README.md`](tokens/README.md) |

## Convenciones rápidas

- Tokens CSS: `--sc-<scope>-<role>-<step>` (ej. `--sc-color-blue-500`).
- Componentes consumen tokens de capa 2-4 (semánticos / componente), nunca
  capa 1 primitive directamente (excepción rara documentada).
- Selectores `sc-*`. Clase TS sin prefix (`ModalComponent`).
- Standalone + `ChangeDetection.OnPush` por defecto.

## Reglas para añadir / cambiar (críticas)

1. **2+ consumers** antes de promover componente al package (DD-4).
2. **Minimal customization sobre PrimeNG** (DD-5) — 3 preguntas del
   `customs-catalog §0` obligatorias antes de cocinar pure-sc nuevo.
3. **Toda primitive nueva → entry en `customs-catalog.md`** (DD-7).
   No cocinar tokens sin doc explícito + plan para Figma SC Variables.
4. **`sc-preset.ts` es load-bearing** — no mover, no renombrar, no simplificar.

## No-goals

- NO crear componentes "por si acaso". Trigger real o nada.
- NO mover tokens fuera de las 7 capas.
- NO romper el contrato `--sc-*` (renombrar tokens) — AED + Memory dependen.
- NO bootstrap Custom Variables collection en Figma hasta tener ≥5 entries en customs-catalog.
