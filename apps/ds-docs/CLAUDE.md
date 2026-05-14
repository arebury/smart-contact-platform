# ds-docs — CLAUDE memory

> Sitio de documentación del Smart Contact Design System (SCDS).
> Crece componente a componente. Inspirado en Wise / Polaris / Carbon.

## ¿Qué es esto?

App Angular 21 que muestra cada componente de SCDS con:
- Variantes / size / states
- Code snippets copy-paste
- Link al Figma source
- Notas de uso

También aloja páginas de "Foundations" (tokens, color, type, spacing) y
"Audit" (sc vs Aura divergence, bridge coverage, etc.).

Deploy: site Netlify propio (URL TBD, probable `ds.smartcontact.netlify.app`).

## Convenciones

- Standalone-first.
- Routes lazy.
- Componentes importados desde `@sc/design-system` para garantizar que ds-docs siempre muestra LO QUE SE PRODUCE — no copy/paste local.
- Tokens consumidos directamente desde `packages/design-system/tokens/`.

## No-goals

- NO duplicar componentes en ds-docs. Si una variante no existe en SCDS, primero añadirla al package.
- NO usar componentes externos a SCDS (sin shadcn, sin Material, sin Tailwind utilities).
- NO incluir lógica de negocio. Esto es display-only.

## Estado actual

- Scaffold mínimo: Home + Button. Resto pendiente.
- Próximo: añadir Input cuando esté listo en design-system.

## Para más detalle

- [packages/design-system/docs/MIGRATION-INVENTORY.md](../../packages/design-system/docs/MIGRATION-INVENTORY.md) — qué componentes existen y cuáles documentar.
- [packages/design-system/CLAUDE.md](../../packages/design-system/CLAUDE.md) — convenciones del package.
