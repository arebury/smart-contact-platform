# 19 · Page Header (`<sc-page-header>`)

> **Type**: Pure SC · **AED uses**: 8 · **Figma parity**: Sin Figma equivalente

> Cabecera de página estática (no sticky) para rutas no-entity: `/config/*` y list pages. Visualmente espejo de `<sc-sticky-form-header>` (mismo leading icon 44×44, eyebrow uppercase, title grande, subtitle sutil) para que el conjunto de la app se lea como una misma familia.
>
> Categoría ⚪ **Pure SC** — pattern propio. Lleno con un Lucide icon como leading (no avatar/photo como el sticky-form-header).

## TL;DR

```html
<sc-page-header
  [icon]="usersIcon"
  entityKey="users.entity_plural"
  titleKey="users.list.title"
  subtitleKey="users.list.subtitle"
>
  <!-- actions slot -->
  <button page-header-actions class="btn btn--primary" (click)="onNew()">
    Nuevo usuario
  </button>
</sc-page-header>
```

## Cuándo usarlo

- Top de cualquier list page (`/admin/usuarios`, `/admin/grupos`, `/admin/agendas`...).
- Top de config pages (`/config/aed/*`, `/config/sistema`, etc.).
- Cualquier ruta que NO sea Create/Edit de entidad — esas usan `<sc-sticky-form-header>`.

## Cuándo NO usarlo

- Form Create/Edit page → `<sc-sticky-form-header>` (sticky + save/cancel actions cluster + editable name).
- Modal / drawer → no aplica (los modals tienen su propio header via `<sc-dialog>`).
- Sub-page dentro de un dialog → mantener el header del dialog.

## Anatomía

```
┌─────────────────────────────────────────────────────────┐
│ ┌──┐                                                    │
│ │📞│  USUARIOS                          [Nuevo usuario] │
│ └──┘  Gestión de usuarios                               │
│       Subtítulo opcional con descripción larga          │
└─────────────────────────────────────────────────────────┘
   ↑        ↑                                    ↑
   icon    entity (eyebrow)                    actions slot
           + title + subtitle
```

44×44 icon chip a la izquierda. Title block centrado vertical. Actions a la derecha (slot proyectado).

## API

```typescript
interface ScPageHeaderProps {
  icon?: LucideIcon | null;          // 44×44 chip leading
  entityKey?: string | null;          // uppercase eyebrow ("USUARIOS")
  titleKey: string;                   // requerido — H1 main title
  subtitleKey?: string | null;        // línea descriptiva debajo
}
```

Todas las keys pasan por `| translate` internamente — el consumer pasa la i18n key, no el texto.

## Slot

`[page-header-actions]` — proyección a la derecha del header. Suele contener:
- Botón primario "Nuevo X"
- Búsqueda inline (`<sc-search>`)
- Filtros / column-selector

## Tokens consumidos

| Token | Uso |
|-------|-----|
| `--sc-bg-secondary-subtle` | icon chip background |
| `--sc-text-primary` | title |
| `--sc-text-secondary` | subtitle + entity eyebrow |
| `--sc-spacing-400/500` | padding del header |
| `--sc-spacing-300` | gap entre icon y title block |
| `--sc-font-size-300` | title |
| `--sc-font-size-100` | entity eyebrow (uppercase) |
| `--sc-font-size-50` | subtitle |
| Icon chip | 44×44 px, radius medium |
| Icon size | 20px (lucide) |

## Decisiones de diseño SC

- **Mirror del sticky-form-header**: mismas dimensiones de icon chip (44×44), mismo size de title (300), mismo eyebrow uppercase. Razón: cuando navegas de una list page (`<sc-page-header>`) a una entity edit page (`<sc-sticky-form-header>`), el header NO cambia de altura ni de jerarquía visual — feels like "still the same surface".
- **No sticky**: las list pages tienen su propio scroll (la tabla puede tener su `<thead>` sticky internamente). Mantener el page header normal evita doble-sticky competition.
- **Sin actions cluster fijo**: a diferencia del sticky-form-header (que tiene Save/Cancel/Delete fijos), aquí cada page proyecta lo que necesita via slot.
- **`<h1>` semántico**: una sola h1 por ruta (a11y + SEO si llegara a importar).
- **Todas las inputs opcionales salvo `titleKey`**: el caso mínimo es solo title — el resto es enriquecimiento.

## A11y

- `<header>` element con landmark role implícito (banner cuando es el primer header del document).
- Title como `<h1>` — los lectores anuncian "encabezado de nivel 1".
- Icon con `aria-hidden="true"` (decorativo — el title ya contiene el contexto).

## Uso en AED

**8 instancias**:
- `/admin/usuarios`, `/admin/grupos`, `/admin/agentes` (list pages).
- `/admin/etiquetas`, `/admin/plantillas` (CRUD pages).
- `/admin/repos/*` (los 9 repository pages — agendas, horarios, motivos...).
- `/config/aed/*` (config pages).

Combinado con `<sc-search>` (en actions slot) + tabla / list body forma el esqueleto canónico de list page SC.

## Página demo

Pendiente — gallery `/components/page-header` con:
- Mínimo (solo title).
- Completo (icon + entity + title + subtitle + actions).
- Sin icon (config pages sencillas).
- Side-by-side comparison con `<sc-sticky-form-header>` para mostrar la mirror.

## Figma reference

**No aplica** — pattern in-house. La consistencia visual con sticky-form-header está validada en código (mismos tokens). Si el equipo de diseño modela ambos como un solo "Header" component family en Figma, anotar URL.
