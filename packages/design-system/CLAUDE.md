# Smart Contact Design System (SCDS) — CLAUDE memory

> Tokens + componentes consumidos por AED, ds-docs, y (futura) Memory.
> Source of truth para identidad visual SC.

## ¿Qué es esto?

SCDS contiene:
- **Tokens** en 7 capas CSS (`tokens/layers/`): primitive → semantic → palette → component → extensions → dark.
- **Componentes** Angular standalone (`components/`): wrappers de PrimeNG (modal, toast) + custom (photo-upload, illustrated-avatar, etc.).
- **Preset PrimeNG** (`tokens/sc-preset.ts`): bridge que mapea cada `--p-*` a su `--sc-*`.
- **Audit docs** (`docs/audit/`): histórico de validación contra Aura, decisiones de divergence.

## Convenciones

- Tokens CSS: `--sc-<scope>-<role>-<step>`. Ej. `--sc-color-blue-500`, `--sc-spacing-300`.
- Componentes selector `sc-*` (brand prefix). Clase TS sin prefijo: `ModalComponent`, no `ScModalComponent`.
- Standalone-first. `ChangeDetection.OnPush` por defecto.
- Components ENTRAN al package cuando: (a) se usan en ≥2 lugares de AED, o (b) son parte explícita de SCDS por decisión de diseño.
- Cualquier componente NUEVO necesita: implementación + page en ds-docs + entry en `docs/MIGRATION-INVENTORY.md`.

## Customs (divergencias documentadas)

Cuando un componente SCDS sobrescribe un token de Aura por marca:
- Override en `sc-preset.ts` con comentario explicando WHY.
- Anota en `docs/customs-catalog.md` (TBD, se crea cuando llegamos a 5+ divergencias).
- Eventualmente sync con Custom Variables collection de Figma vía plugin Variables Importer.

## No-goals

- NO crear componentes "por si acaso". Solo añadir cuando hay 2+ consumidores reales.
- NO bootstrap Custom Variables collection en Figma hasta `customs-catalog.md` tenga ≥5 entradas.
- NO mover tokens fuera de las 7 capas. La cascada es estable y validada.
- NO romper el contrato `--sc-*` (renombrar tokens) — componentes en AED dependen de ellos.

## Estado actual

- Tokens: 7 capas estables. Validados contra Aura (ver `docs/audit/`).
- Componentes: 24 migrados desde `apps/aed/src/app/shared/components/` (Fase 1 Foundation).
- Preset `ScPreset` cubre primitive overrides (green/yellow/red/blue/sky/orange), semantic primary, focus ring, formField, overlays, content surface.
- Próximo: bootstrap Input (text/email/password) — primer componente cocinado nativo SCDS.

## Para más detalle

- [docs/CLAUDE.md](docs/CLAUDE.md) — versión expandida del CLAUDE original (audit context).
- [docs/MIGRATION-INVENTORY.md](docs/MIGRATION-INVENTORY.md) — inventario completo de componentes y status.
- [docs/audit/](docs/audit/) — validaciones token-by-token + bridge coverage.
- [docs/design-system.md](docs/design-system.md) — overview arquitectónico.
- [docs/impeccable.md](docs/impeccable.md) — patrones banned + canónicos.
- [tokens/GUIA.md](tokens/GUIA.md) — guía de tokens en español, para diseño.
- [tokens/README.md](tokens/README.md) — guía técnica de tokens.
