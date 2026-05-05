# Fase 0 — Informe de análisis previo

> **Estado**: análisis cerrado, esperando decisión del usuario sobre las ambigüedades antes de pasar a la Fase 1.

---

## 1. Vistas detectadas en el prototipo

El prototipo (React + Vite + Tailwind v4 + shadcn/ui + Zustand + react-router) define **39 rutas** de las cuales **23 están construidas** y **16 son `PlaceholderPage`** (placeholders "en construcción"). Inventario:

### 1.1 Páginas construidas (a migrar 1:1)

| # | Ruta | Componente fuente | Tipo de pantalla |
|---|---|---|---|
| 1 | `/admin/usuarios` | `UsersListPage.tsx` | Listado CRUD con bulk actions |
| 2 | `/admin/usuarios/crear` y `/editar/:id` | `CreateUserPage.tsx` | Form multi-sección con sticky header |
| 3 | `/admin/grupos` | `GroupsListPage.tsx` | Listado CRUD con frozen columns |
| 4 | `/admin/grupos/crear` y `/editar/:id` | `CreateGroupPage.tsx` | Form complejo (~2.850 LoC) con drag-drop de agentes |
| 5 | `/admin/agentes` | `AgentsListPage.tsx` | Listado avanzado (column selector, context menu, frozen cols) |
| 6 | `/admin/agentes/crear` y `/editar/:id` | `CreateAgentPage.tsx` | Form multi-sección (~2.500 LoC) |
| 7 | `/admin/repositorios` | `RepositoriosHubPage.tsx` | Hub con grid de cards categorizadas |
| 8 | `/admin/agendas` | `AgendasPage.tsx` (vía `RepositoryListPage`) | CRUD genérico |
| 9 | `/admin/horarios` | `HorariosPage.tsx` (vía `RepositoryListPage`) | CRUD genérico |
| 10 | `/admin/plantillas` | `TemplatesPage.tsx` | Listado con tabs (Chat / Email) e inline form |
| 11 | `/admin/tipificaciones` | `TipificacionesPage.tsx` (vía `RepositoryListPage`) | CRUD genérico |
| 12 | `/admin/labels` | `LabelsPage.tsx` | Listado con color picker inline |
| 13 | `/admin/variables` | `VariablesPage.tsx` (vía `RepositoryListPage`) | CRUD genérico |
| 14 | `/admin/entidades` | `EntidadesPage.tsx` (vía `RepositoryListPage`) | CRUD genérico |
| 15 | `/admin/intenciones` | `IntencionesPage.tsx` (vía `RepositoryListPage`) | CRUD genérico |
| 16 | `/admin/reglas-ia` | `ReglasIAPage.tsx` (vía `RepositoryListPage`) | CRUD genérico |
| 17 | `/admin/entidades-ia` | `EntidadesIAPage.tsx` (vía `RepositoryListPage`) | CRUD genérico |
| 18 | `/admin/clasificacion-ia` | `ClasificacionIAPage.tsx` (vía `RepositoryListPage`) | CRUD genérico |
| 19 | `/config/seguridad` | `SeguridadPage.tsx` | Acordeón + flujo de regeneración con confirmación |
| 20 | `/config/aed` | `AEDPage.tsx` | Selector de prefijos de país |

### 1.2 Páginas placeholder (rutas reservadas, sin UI real)

`/`, `/dashboard`, `/servicios`, `/nodo-ia`, `/campanas`, `/conversaciones`, `/informes`, `/analizador`, `/scc`, `/vui-designer`, `/config/personalizacion`, `/config/integraciones`, `/config/sistema`, y catch-all `*`.

### 1.3 Componentes de layout

- `AppLayout` — Sidebar fijo (220 px) + Outlet vertical, `Ctrl+Z` global con undo stack.
- `Sidebar` — Navegación con 2 secciones (HERRAMIENTAS, AJUSTES), soporte de 4+ niveles de anidamiento, fondo `gray-800`. Incluye botón "Decisiones de diseño" abajo.
- `TopBar` — Breadcrumbs a la izquierda + avatar/menú de usuario a la derecha. Altura 48 px.
- `DesignDecisionsPanel` — Panel lateral derecho con un log de decisiones de diseño (parece tooling interno de prototipado, **no es una feature de producto**).
- `PlaceholderPage` — Estado vacío "Sección en construcción".

---

## 2. Patrones de UI recurrentes

| # | Patrón | Páginas que lo usan | Equivalente PrimeNG |
|---|---|---|---|
| 1 | Tabla con frozen columns + sort + selección múltiple | Agents, Groups, Users | `p-table` con `[frozenColumns]` + `[(selection)]` ✅ |
| 2 | Bulk action bar fija al fondo (offset por sidebar) | Todas las listas | Componente custom (no hay equivalente directo en PrimeNG) ⚠️ |
| 3 | Sticky form header con Save/Discard/Delete | Todos los Create/Edit | Custom + `position: sticky` (PrimeNG `Toolbar` no es sticky por sí solo) ⚠️ |
| 4 | Form multi-sección con `SectionCard` (header gris + body) | Todos los Create/Edit | `p-fieldset` o `p-panel` adaptados con tokens ✅ |
| 5 | Inline create/edit form en lista (panel al lado) | Labels, Templates, Repositories | Patrón propio con `p-card` o `p-panel` (PrimeNG no tiene "edit-in-place") ⚠️ |
| 6 | Selector de visibilidad de columnas (dropdown con checkboxes) | Agents | Custom o `p-multiSelect` con `display="chip"` adaptado ⚠️ |
| 7 | Context menu (right-click) en filas | Agents, Groups | `p-contextMenu` ✅ |
| 8 | Tabs (Chat / Email) | Templates | `p-tabView` ✅ |
| 9 | Drag-drop reorder de filas | Agents en CreateGroupPage | **Angular CDK `cdkDropList`** (PrimeNG no soporta row drag-drop en Table) ⚠️ |
| 10 | Color picker (12 dots inline) | Labels | Custom (no usar `p-colorPicker`, no es lo que pinta el proto) ⚠️ |
| 11 | Confirmación de borrado con texto manual | Todas las listas | `p-confirmDialog` adaptado ✅ |
| 12 | Toasts (sonner) | Toda la app | `p-toast` + `MessageService` ✅ |
| 13 | Acordeón con flujo gated | Seguridad | `p-accordion` ✅ |
| 14 | Multi-select con búsqueda interna | Create forms | `p-multiSelect` ✅ |
| 15 | File upload (audio) | CreateGroup, CreateAgent | `p-fileUpload` ✅ |
| 16 | Breadcrumbs | Repositories, Config | `p-breadcrumb` ✅ |
| 17 | Tooltip edge-aware | FormComponents, Tooltip.tsx | `pTooltip` (directiva) ✅ |
| 18 | Export a XLSX | Agents, Groups, Users, Labels, Templates, Repos | Mantener librería `xlsx` (es agnóstica) ✅ |
| 19 | Cross-tab warning vía localStorage | Create/Edit forms | Servicio Angular con `BroadcastChannel` o `storage` event ⚠️ |
| 20 | Undo stack global (`Ctrl+Z`) | Borrados con toast | Servicio Angular singleton + `HostListener` global ⚠️ |
| 21 | Navigation guard de form sucio | Create/Edit | `CanDeactivate` guard de Router ✅ |
| 22 | Keyboard nav (↑↓ Home End Esc) en dropdowns | ColumnSelector, LabelFilter | Directiva Angular custom ⚠️ |
| 23 | Sidebar con 4+ niveles de anidamiento | Sidebar.tsx | `p-panelMenu` (limitado) o componente custom recursivo ⚠️ |

**Leyenda**: ✅ mapeo directo · ⚠️ requiere componente custom o adaptación significativa.

---

## 3. Árbol de componentes Angular propuesto

> Sigo la convención que pediste: `core/` (singletons/infra), `shared/` (UI reutilizable cross-feature), `features/<dominio>/` (pages + componentes específicos).
>
> ⚠️ **Nota de scope**: el prompt menciona "módulo Supervisor" pero el prototipo solo construye Admin + Config. Lo trato como **una sola app** con ese mismo árbol de rutas; ver ambigüedad #4.

```
aed/
├── src/
│   ├── app/
│   │   ├── app.config.ts                        # ApplicationConfig + provideRouter + providePrimeNG + provideAnimations
│   │   ├── app.routes.ts                        # router root con lazy-load por feature
│   │   ├── app.component.{ts,html,scss}         # <p-toast> + <router-outlet>
│   │   │
│   │   ├── core/
│   │   │   ├── tokens/
│   │   │   │   └── sc-tokens.css                # Única fuente de verdad de tokens --sc-*
│   │   │   ├── layout/
│   │   │   │   ├── app-shell/                   # AppLayout (sidebar + outlet)
│   │   │   │   ├── sidebar/                     # Recursivo, soporta N niveles
│   │   │   │   ├── top-bar/
│   │   │   │   └── placeholder-page/
│   │   │   ├── services/
│   │   │   │   ├── undo-stack.service.ts        # Reemplaza undoStack.ts
│   │   │   │   ├── cross-tab.service.ts         # Reemplaza useCrossTabWarning
│   │   │   │   ├── local-store.factory.ts       # Reemplaza createLocalStore
│   │   │   │   └── xlsx-export.service.ts       # Reemplaza exportXlsx
│   │   │   ├── guards/
│   │   │   │   └── unsaved-changes.guard.ts     # CanDeactivate
│   │   │   └── directives/
│   │   │       ├── click-outside.directive.ts
│   │   │       └── keyboard-nav.directive.ts
│   │   │
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── section-card/                # SectionCard (form section)
│   │   │   │   ├── sticky-form-header/          # StickyFormHeader
│   │   │   │   ├── bulk-action-bar/             # BulkActionBar
│   │   │   │   ├── column-selector/             # ColumnSelector
│   │   │   │   ├── label-filter-button/         # LabelFilterButton
│   │   │   │   ├── label-chip/                  # Chip con dot de color
│   │   │   │   ├── delete-entity-dialog/        # DeleteEntityDialog
│   │   │   │   ├── impact-preview-dialog/       # ImpactPreviewDialog
│   │   │   │   ├── discard-dialog/              # DiscardDialog
│   │   │   │   ├── toggle-switch/               # ToggleSwitch (custom, no PrimeNG)
│   │   │   │   ├── tooltip-icon/                # info (i) icon + tooltip
│   │   │   │   ├── field-label/                 # label + asterisco + tooltip
│   │   │   │   ├── sortable-header/             # th con asc/desc/none
│   │   │   │   ├── channel-icon/                # Phone/Chat/Email badge
│   │   │   │   ├── context-menu/                # wrapper de p-contextMenu
│   │   │   │   └── color-dot-picker/            # 12 color dots
│   │   │   └── pipes/
│   │   │       └── safe-html.pipe.ts            # si hace falta
│   │   │
│   │   └── features/
│   │       ├── supervision/                     # placeholders por ahora (Dashboard, Servicios, etc.)
│   │       │   └── pages/
│   │       ├── admin/
│   │       │   ├── users/
│   │       │   │   ├── pages/
│   │       │   │   │   ├── users-list/
│   │       │   │   │   └── user-form/           # crear + editar (mismo componente)
│   │       │   │   ├── data/users.mock.ts
│   │       │   │   └── state/users.store.ts
│   │       │   ├── groups/
│   │       │   │   ├── pages/{groups-list, group-form}
│   │       │   │   ├── data/groups.mock.ts
│   │       │   │   └── state/groups.store.ts
│   │       │   ├── agents/
│   │       │   │   ├── pages/{agents-list, agent-form}
│   │       │   │   ├── data/{agents.mock, country-prefixes}.ts
│   │       │   │   └── state/agents.store.ts
│   │       │   ├── labels/
│   │       │   │   ├── pages/labels/
│   │       │   │   ├── data/labels.mock.ts
│   │       │   │   └── state/labels.store.ts
│   │       │   ├── templates/
│   │       │   │   ├── pages/templates/
│   │       │   │   ├── data/templates.mock.ts
│   │       │   │   └── state/templates.store.ts
│   │       │   └── repositories/
│   │       │       ├── pages/repositories-hub/
│   │       │       ├── shared/repository-list-page/   # equivalente al RepositoryListPage genérico
│   │       │       └── instances/                     # 9 páginas (agendas, horarios, etc.)
│   │       │           ├── agendas/
│   │       │           ├── horarios/
│   │       │           ├── tipificaciones/
│   │       │           ├── variables/
│   │       │           ├── entidades/
│   │       │           ├── intenciones/
│   │       │           ├── reglas-ia/
│   │       │           ├── entidades-ia/
│   │       │           └── clasificacion-ia/
│   │       └── config/
│   │           ├── pages/{seguridad, aed, placeholder-pages}
│   │           └── ...
│   │
│   ├── assets/
│   ├── environments/
│   ├── styles/
│   │   ├── _reset.scss
│   │   ├── _tokens.scss          # importa core/tokens/sc-tokens.css
│   │   └── main.scss             # entrypoint
│   ├── index.html
│   └── main.ts
├── public/
├── .github/workflows/ci.yml
├── .eslintrc.json
├── .prettierrc
├── angular.json
├── package.json
├── tsconfig.{json,app.json,spec.json}
└── README.md
```

---

## 4. Mapeo de tokens `--sc-*` → JSON → PrimeNG

> **Estrategia (3 capas)**: `--sc-color-*` (primitivos) → `--sc-bg|text|border|...` (semánticos) → `--p-*` (sobreescritura PrimeNG).
>
> El JSON tiene **solid mode** por defecto (`semantic.background.primary = blue/700`). PrimeNG (Aura) usa nombres tipo `--p-primary-color`, `--p-surface-N`, `--p-content-*`. La columna PrimeNG indica el var oficial que se sobreescribe en `:root`.

### 4.1 Primitivos de color (extracción 1:1 desde el JSON)

Se exportan **TODAS** las escalas. Patrón de naming: `--sc-color-<scale>-<step>`.

| Token `--sc-*` | Valor JSON | Notas |
|---|---|---|
| `--sc-color-blue-50` … `--sc-color-blue-950` | `#edf0f5` … `#05080d` | Marca primaria oscura |
| `--sc-color-soft-blue-50` … `--sc-color-soft-blue-950` | `#effbfc` … `#0d262b` | Acento cian |
| `--sc-color-gray-0` … `--sc-color-gray-950` | `#ffffff` … `#0b0f14` | Neutros (incluye 0=white) |
| `--sc-color-green-50` … `--sc-color-green-950` | `#f0fdf4` … `#0a2916` | Success |
| `--sc-color-yellow-50` … `--sc-color-yellow-950` | `#fffbeb` … `#451a03` | Warning |
| `--sc-color-red-50` … `--sc-color-red-950` | `#fef2f2` … `#450a0a` | Danger |
| `--sc-color-electric-blue-50` … `--sc-color-electric-blue-950` | `#eef4ff` … `#020c21` | Info |
| `--sc-color-indigo-50` … `--sc-color-indigo-950` | `#f5f0ff` … `#11031d` | Indigo |

(En CSS los nombres con espacio se compactan: `soft blue` → `soft-blue`, `electric blue` → `electric-blue`).

### 4.2 Semánticos — sobreescritura sobre PrimeNG (Aura)

| `--sc-*` (semántico) | JSON ref | Color resuelto | PrimeNG var sobreescrita |
|---|---|---|---|
| `--sc-text-primary` | `text/primary` → gray/800 | `#2f3642` | `--p-text-color` |
| `--sc-text-secondary` | `text/secondary` → gray/600 | `#6f7784` | `--p-text-muted-color` |
| `--sc-text-subtle` | `text/subtle` → gray/400 | `#aeb6c2` | — |
| `--sc-text-disabled` | `text/disabled` → gray/300 | `#c6ccd6` | `--p-text-color-disabled` |
| `--sc-text-inverse` | gray/0 | `#ffffff` | — |
| `--sc-text-link` | `text/link` → soft-blue/600 | `#48b8c9` | — |
| `--sc-text-on-primary` | gray/0 | `#ffffff` | — |
| `--sc-bg-default` | `background/default` → gray/50 | `#f7f8fa` | `--p-content-background` *(modo claro)* |
| `--sc-bg-surface` | gray/0 | `#ffffff` | `--p-overlay-modal-background`, panel bg |
| `--sc-bg-subtle` | blue/50 | `#edf0f5` | — |
| `--sc-bg-primary` | blue/700 | `#1b273d` | `--p-primary-color` |
| `--sc-bg-primary-hover` | blue/800 | `#131b2b` | `--p-primary-hover-color` |
| `--sc-bg-primary-active` | blue/900 | `#0b1019` | `--p-primary-active-color` |
| `--sc-bg-accent` | soft-blue/500 | `#5ad3e6` | — (accent custom) |
| `--sc-bg-accent-hover` | soft-blue/600 | `#48b8c9` | — |
| `--sc-bg-success` | green/600 | `#16a34a` | `--p-green-500` (overrides scale) |
| `--sc-bg-warning` | yellow/500 | `#f59e0b` | `--p-yellow-500` |
| `--sc-bg-danger` | red/600 | `#dc2626` | `--p-red-500` |
| `--sc-bg-info` | electric-blue/500 | `#1464fe` | `--p-blue-500` |
| `--sc-bg-disabled` | gray/200 | `#dadfe6` | `--p-form-field-disabled-background` |
| `--sc-border-default` | `border/default` → gray/200 | `#dadfe6` | `--p-content-border-color`, `--p-form-field-border-color` |
| `--sc-border-strong` | gray/400 | `#aeb6c2` | — |
| `--sc-border-subtle` | gray/100 | `#eceff3` | — |
| `--sc-border-primary` | blue/700 | `#1b273d` | `--p-primary-color` |
| `--sc-border-error` | red/500 | `#ef4444` | `--p-form-field-invalid-border-color` |

### 4.3 Tipografía

| `--sc-*` | JSON ref | Valor | PrimeNG var |
|---|---|---|---|
| `--sc-font-family-primary` | Inter | `'Inter', system-ui, sans-serif` | `--p-font-family` |
| `--sc-font-family-secondary` | Open Sans | `'Open Sans', sans-serif` | — |
| `--sc-font-size-50` … `-900` | `Font Size/font-size-50…900` | `10px … 64px` | — |
| `--sc-line-height-50` … `-900` | `Line height/line-height-…` | `15px … 96px` | — |
| `--sc-font-weight-regular/medium/semibold/bold` | 400/500/600/700 | — | `--p-font-weight-bold` (700) |
| `--sc-font-size-h1` … `caption` | semantic `font size/h1`, etc. | resuelto vía JSON | — |

### 4.4 Espaciado

| `--sc-*` | JSON ref | Valor px |
|---|---|---|
| `--sc-spacing-0` | spacing-0 | 0 |
| `--sc-spacing-50` | spacing-50 | 4 |
| `--sc-spacing-100` | spacing-100 | 8 |
| `--sc-spacing-200` | spacing-200 | 12 |
| `--sc-spacing-300` | spacing-300 | 16 |
| `--sc-spacing-400` | spacing-400 | 20 |
| `--sc-spacing-500` | spacing-500 | 24 |
| `--sc-spacing-600` | spacing-600 | 32 |
| `--sc-spacing-700` | spacing-700 | 40 |
| `--sc-spacing-800` | spacing-800 | 48 |
| `--sc-spacing-900` | spacing-900 | 64 |

### 4.5 Radio

| `--sc-*` | JSON ref | Valor | PrimeNG var |
|---|---|---|---|
| `--sc-radius-0` | radius-0 | 0 | — |
| `--sc-radius-50` | radius-50 | 2px | — |
| `--sc-radius-100` | radius-100 | 4px | — |
| `--sc-radius-200` | radius-200 | 6px | `--p-border-radius-md` |
| `--sc-radius-300` | radius-300 | 8px | `--p-border-radius-lg` |
| `--sc-radius-400` | radius-400 | 12px | — |
| `--sc-radius-500` | radius-500 | 16px | `--p-border-radius-xl` |
| `--sc-radius-full` | radius-full | 9999px | `--p-border-radius-full` |

### 4.6 Tokens NO presentes en el JSON pero requeridos por el prototipo

El prototipo usa hardcodes que el JSON no cubre. Hay que **crearlos como nuevos `--sc-*`** y **decidir su valor** (ver ambigüedad #1):

| Token nuevo | Uso en prototipo | Propuesta |
|---|---|---|
| `--sc-sidebar-width` | `--sidebar-w: 220px` (theme.css L4) | `220px` (no en JSON) |
| `--sc-sidebar-bg` | `bg-gray-800` en Sidebar | `var(--sc-color-gray-800)` |
| `--sc-topbar-height` | `h-12` (48px) en TopBar | `48px` |
| `--sc-shadow-card` / `dropdown` / `dialog` | el JSON no tiene `shadow` | **Crear primitivos** desde 0 (ver ambigüedad #1) |
| `--sc-z-sticky-header`, `--sc-z-bulk-bar`, `--sc-z-toast`, etc. | uso de z-index custom | Stack de z-indexes a crear |

---

## 5. Componentes PrimeNG que se utilizarán

`Table`, `ContextMenu`, `Dialog`, `ConfirmDialog`, `Drawer (Sidebar)`, `Tabs`, `Accordion`, `Breadcrumb`, `Toast`, `MultiSelect`, `Dropdown`, `InputText`, `InputNumber`, `Textarea`, `Checkbox`, `RadioButton`, `Toolbar`, `Card`, `Panel`, `Fieldset`, `FileUpload`, `Tag`, `Chip`, `Skeleton`, `OverlayPanel`, `Tooltip` (directiva), `Stepper` (no usado en el proto, pero útil para forms grandes — descartado salvo decisión).

Custom (no hay equivalente directo): `BulkActionBar`, `StickyFormHeader`, `ToggleSwitch` (el `p-inputSwitch` no replica el visual del proto), `ColorDotPicker`, `ColumnSelector` (con persistencia en localStorage), drag-drop de filas (CDK).

---

## 6. ⚠️ Ambigüedades / inconsistencias detectadas — **necesito tu decisión**

Estas son las **5 decisiones bloqueantes** antes de tocar la Fase 1. No avanzo hasta tener respuesta:

### 🔴 #1 — Conflicto entre el prototipo y los tokens del JSON

El prototipo (`src/styles/theme.css`) implementa un look **monocromo blanco/gris/negro con `--radius: 0` (sin bordes redondeados)**:
- `--primary: #1a1a1a` (casi negro), `--background: #ffffff`, `--border: #d4d4d4`
- Tipografía hardcoded en utilidades Tailwind: `text-[13px]`, `text-[11px]`, `text-[12px]` (no coinciden con la escala 10/12/14/16/18/20/24/28/32 del JSON)
- Sidebar `bg-gray-800` (gris oscuro), no azul
- Sin uso de soft-blue, electric-blue, indigo, ni de `radius-200/300/full`

El **JSON de tokens** describe en cambio una marca **azul oscura (blue/700) + acento cian (soft-blue/500) con radios redondeados** y una escala tipográfica diferente.

**Pregunta**: ¿Cuál es la fuente de verdad visual?
- **(a)** El JSON manda. Reinterpretamos el prototipo a la marca SmartContact: primary=blue/700, accent=soft-blue/500, radius-200 por defecto, escala tipográfica del JSON. El look final será **distinto** al de los screenshots del proto pero coherente con la marca.
- **(b)** El proto manda. Ignoramos partes del JSON y mantenemos look monocromo, `radius:0`, tipografía 11/12/13. El sistema de tokens queda muy infrautilizado.
- **(c)** Híbrido: estructura visual del proto (densidad, layouts, sticky bars) + paleta y radios del JSON (azul, redondeado).

**Mi recomendación**: **(a)** o **(c)**. La (b) hace que el JSON sea papel mojado.

### 🟠 #2 — Alcance: "Supervisor" vs Admin/Config

Tu prompt dice "**módulo Supervisor**" pero el prototipo solo tiene **Admin + Config** construidos; las páginas bajo "Supervisión" (Dashboard, Servicios, Conversaciones, Informes…) son **placeholders vacíos**.

**Pregunta**: ¿Qué hago?
- **(a)** Migrar **TODO** el prototipo (Admin + Config + placeholders Supervisión vacíos), tal como está. Estructura `features/admin/`, `features/config/`, `features/supervision/`.
- **(b)** Migrar **solo Admin + Config** (lo construido), descartar las rutas placeholder.
- **(c)** Considerar las páginas Supervisión como objetivo a **construir desde cero** en esta fase (fuera del prompt; expande el alcance varios días).

**Mi recomendación**: **(a)**. Mantiene paridad estructural con el prototipo.

### 🟠 #3 — Funcionalidades infraestructurales

El prototipo tiene 4 mecanismos avanzados que no son triviales de portar:

- **Undo stack global** con `Ctrl+Z` y toasts de "deshacer"
- **Cross-tab warning** (detecta edición concurrente del mismo registro en otra pestaña vía localStorage)
- **Navigation guard** con `DiscardDialog` para forms sucios
- **Stores Zustand** persistidos en localStorage con versionado

**Pregunta**: ¿Migración 1:1 o simplificación?
- **(a)** Migración 1:1 — replico todos. Realista pero es ~3 días extra de trabajo y testing fino.
- **(b)** Simplificada: navigation guard ✅, stores ✅, undo y cross-tab los dejo **stubbed** (interfaces creadas, implementación mínima) y se trabajan después.
- **(c)** Solo lo esencial: navigation guard + stores. Undo y cross-tab se descartan en Fase 3.

**Mi recomendación**: **(b)**. Stub para no bloquear, pero la arquitectura los soporta.

### 🟠 #4 — Idioma de las rutas y de los textos

El prototipo está **en español** (`/admin/grupos`, `/admin/agentes`, "Volver al inicio", "Cerrar sesión"…).

**Pregunta**: ¿Mantengo español en URLs y UI? ¿Quieres i18n (`@ngx-translate/core` o Angular i18n) preparado desde el día 1?

**Mi recomendación**: Mantener español 1:1 (URLs y UI), **sin** i18n por ahora. Si más tarde se interna­cio­nali­za, se hace en una fase aparte.

### 🟡 #5 — Versión de Angular y PrimeNG, y stack adicional

No has especificado versiones. Mi propuesta por defecto:

- **Angular 18.x** con standalone components, signals, control flow nuevo (`@if` / `@for`), inject() en lugar de constructor DI
- **PrimeNG 17.x o 18.x** con tema **Aura** (preset de Sakai) — **18.x** soporta CSS layer y design tokens nativos, encaja perfecto con `--sc-*`
- **Otras**: `@angular/cdk` (drag-drop, overlay, a11y), `xlsx` (export), `lucide-angular` (mismos iconos que el proto)
- **Tests**: Karma + Jasmine por defecto Angular, **NO Jest** salvo que pidas
- **Linter**: ESLint con `@angular-eslint`, Prettier

**Pregunta**: ¿OK con este stack y versiones, o tienes restricciones (versión LTS específica, tema PrimeNG concreto, Jest, etc.)?

---

## 7. Resumen ejecutivo

- Prototipo bien estructurado: **20 páginas funcionales** + 16 placeholders + un layout shell.
- Mapeo de tokens **viable**: el JSON cubre ~95% de lo necesario; falta solo definir shadows, sidebar-width y z-indexes.
- **2 retos técnicos** principales: drag-drop de filas en tabla (CDK) y replicar el look monocromo del proto si la respuesta a #1 es (b).
- **5 ambigüedades bloqueantes** arriba — necesito tu decisión sobre cada una antes de pasar a Fase 1.

---

**Esperando respuesta a las 5 preguntas para pasar a la Fase 1.**
