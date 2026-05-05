# SmartContact Supervisor

Plataforma de supervision y gestion de entidades para contact centers B2B. Construida con React 18, React Router v7 (Data mode), Vite, y Tailwind CSS v4.

---

## Indice

1. [Vision general](#vision-general)
2. [Stack tecnico](#stack-tecnico)
3. [Estructura de archivos](#estructura-de-archivos)
4. [Estilo visual: Low-fi Design System](#estilo-visual-low-fi-design-system)
5. [Arquitectura de datos: Stores](#arquitectura-de-datos-stores)
6. [Hub de componentes compartidos (/shared)](#hub-de-componentes-compartidos-shared)
7. [Modulos funcionales](#modulos-funcionales)
8. [Patrones UX fundamentales](#patrones-ux-fundamentales)
9. [Sistema de Design Decisions (DD)](#sistema-de-design-decisions-dd)
10. [Reglas absolutas](#reglas-absolutas)
11. [Guia para LLMs que modifiquen este codigo](#guia-para-llms-que-modifiquen-este-codigo)

---

## Vision general

SmartContact Supervisor es un panel de supervision para operaciones de contact center. Permite gestionar:

- **Agentes**: operadores humanos que atienden llamadas, chats y emails
- **Grupos**: agrupaciones logicas de agentes con estrategias de distribucion
- **Labels**: etiquetas de color para categorizar agentes y grupos
- **Plantillas**: mensajes predefinidos reutilizables (WhatsApp, email, SMS)
- **Usuarios**: supervisores y administradores con permisos granulares

La aplicacion es 100% frontend con persistencia en localStorage. No hay backend ni base de datos. Cada modulo usa un store reactivo que sincroniza automaticamente entre componentes y persiste entre recargas.

---

## Stack tecnico

| Capa | Tecnologia | Version |
|------|-----------|---------|
| Framework | React | 18.3.1 |
| Routing | React Router (Data mode) | 7.13.0 |
| Build | Vite | 6.3.5 |
| CSS | Tailwind CSS | 4.1.12 |
| Iconos | lucide-react | 0.487.0 |
| Toasts | sonner | 2.0.3 |
| Excel export | xlsx (SheetJS) | 0.18.5 |
| Drag & Drop | react-dnd + react-dnd-html5-backend | 16.0.1 |

### Importaciones clave

```tsx
// Routing — SIEMPRE usar 'react-router', NUNCA 'react-router-dom'
import { useNavigate, useParams } from "react-router";

// Toasts
import { toast } from "sonner";

// Iconos — siempre de lucide-react
import { Plus, Search, X } from "lucide-react";
```

---

## Estructura de archivos

```
src/
  app/
    App.tsx                          # Root: RouterProvider + Toaster (sonner)
    routes.ts                        # createBrowserRouter — todas las rutas
    components/
      layout/                        # Shell de la aplicacion
        AppLayout.tsx                # Sidebar + Outlet + Ctrl+Z global
        Sidebar.tsx                  # Navegacion lateral con secciones colapsables
        TopBar.tsx                   # Breadcrumbs + menu de usuario
        PlaceholderPage.tsx          # Pagina "en construccion" para rutas pendientes
        DesignDecisionsPanel.tsx     # Panel flotante que muestra las DD
        designDecisions.ts           # Array de 297 decisiones de diseno documentadas
      shared/                        # *** HUB DE COMPONENTES REUTILIZABLES ***
        index.ts                     # Catalogo con categorias y exports comentados
        createLocalStore.ts          # Factory generica de stores (pub/sub + localStorage)
        FormComponents.tsx           # SectionCard, FieldLabel, TooltipIcon, ToggleSwitch, DiscardDialog
        TableComponents.tsx          # ContextMenu, BulkContextMenu, SortableHeader, ChannelBadges, InlineDuplicateRow
        DeleteEntityDialog.tsx       # Dialog de eliminacion (single: copy-paste / bulk: chips)
        ImpactPreviewDialog.tsx      # Preview de operaciones bulk con items removibles
        ColumnSelector.tsx           # Selector de columnas visibles con persistencia
        LabelFilterButton.tsx        # Filtro de labels con 3 variantes visuales
        Tooltip.tsx                  # Tooltip edge-aware con flecha
        exportXlsx.ts                # Helper XLSX (headers, auto-fit, styled header)
        undoStack.ts                 # Pila global de deshacer (Ctrl+Z)
        copyToClipboard.ts           # Clipboard API + fallback textarea
        useClickOutside.ts           # Hook: cerrar al clic fuera o Escape
        useKeyboardNav.ts            # Hook: navegacion con flechas en dropdowns
        useNavigationGuard.ts        # Hook: bloquear navegacion con cambios sin guardar
        useCrossTabWarning.ts        # Hook: detectar edicion concurrente entre pestanas
      agents/                        # Modulo Agentes
        agentsData.ts                # Tipos + datos mock (Agent, PresenceStatus, etc.)
        useAgentsStore.ts            # Store (factory-based)
        AgentsListPage.tsx           # Listado con tabla, bulk actions, export
        CreateAgentPage.tsx          # Formulario creacion/edicion
      groups/                        # Modulo Grupos
        groupsData.ts                # Tipos + datos mock (Group)
        useGroupsStore.ts            # Store (factory-based)
        GroupsListPage.tsx           # Listado con tabla, bulk actions, export
        CreateGroupPage.tsx          # Formulario creacion/edicion
      labels/                        # Modulo Labels
        labelsData.ts                # Tipos + datos mock + colores (Label)
        useLabelsStore.ts            # Store (factory-based)
        LabelsPage.tsx               # Listado inline (sin pagina de creacion separada)
      templates/                     # Modulo Plantillas
        templatesData.ts             # Tipos + datos mock (Template)
        useTemplatesStore.ts         # Store (factory-based)
        TemplatesPage.tsx            # Listado + panel lateral de edicion inline
      users/                         # Modulo Usuarios
        usersData.ts                 # Tipos + datos mock (User, UserSections, UserPermissions)
        useUsersStore.ts             # Store (factory-based)
        UsersListPage.tsx            # Listado con tabla, bulk actions, export
        CreateUserPage.tsx           # Formulario creacion/edicion
      figma/
        ImageWithFallback.tsx        # [PROTEGIDO] Componente de imagen con fallback
      ui/                            # Componentes primitivos (shadcn/ui base) — NO USAR DIRECTAMENTE
        button.tsx, dialog.tsx, ...  # Estos estan por si se necesitan, pero la app usa componentes custom
  styles/
    index.css                        # Entry point CSS
    tailwind.css                     # @import tailwindcss
    theme.css                        # Tokens del design system (colores, radios, tipografia)
    fonts.css                        # Imports de fuentes (@font-face)
```

---

## Estilo visual: Low-fi Design System

La aplicacion sigue un estilo deliberadamente austero y funcional:

### Principios

| Principio | Implementacion |
|-----------|---------------|
| Sin redondeos | `--radius: 0` en theme.css. Todos los border-radius son 0 |
| Sin sombras | No se usa `shadow-*` en ningun componente |
| Sin colores de acento | El unico color "fuerte" es `bg-gray-800` (negro suave) para botones primarios |
| Escala de grises | Todo el UI usa grises (gray-50 a gray-800). El rojo solo aparece en acciones destructivas |
| Iconografia Lucide | Todos los iconos vienen de `lucide-react`. Tamanos estandar: 13-16px |
| Tipografia Inter | Font-family: Inter. Tamanos base: 11px (micro), 12px (small), 13px (body), 14px (section titles), 20px (page headers) |

### Tokens de theme.css

```css
:root {
  --sidebar-w: 220px;      /* Ancho fijo del sidebar */
  --radius: 0;             /* Sin redondeos NUNCA */
  --primary: #1a1a1a;      /* Negro suave para botones primarios */
  --border: #d4d4d4;       /* Borde estandar */
  --destructive: #737373;  /* El destructivo tambien es gris, no rojo */
}
```

### Patrones visuales recurrentes

- **SectionCard**: borde gris, header con fondo `bg-gray-50`, titulo bold con icono Lucide
- **Inputs**: `border border-gray-300 text-[13px] focus:border-gray-500` (sin outline coloreado)
- **Botones primarios**: `bg-gray-800 text-white hover:bg-gray-700`
- **Botones secundarios**: `border border-gray-300 text-gray-500 hover:bg-gray-100`
- **Botones destructivos**: `border border-red-400 text-red-400 hover:bg-red-50`
- **Bulk bar**: `fixed bottom-0 bg-gray-800 text-white` (barra negra inferior)
- **Empty states**: contenedor `border-dashed border-gray-300` con icono dashed y texto gris
- **Badges/chips**: `border border-gray-200 text-[11px]` (sin fondo, sin redondeo)

---

## Arquitectura de datos: Stores

### Factory: createLocalStore<T>

Todos los stores usan la factory generica `createLocalStore<T>()` que encapsula:

1. **Pub/sub**: listeners globales a nivel de modulo, no de instancia React
2. **localStorage**: lectura/escritura con JSON serialization
3. **Versionado**: si `currentVersion` cambia, los datos se re-seedean desde defaults
4. **useSyncExternalStore**: integracion nativa con React 18 para re-renders eficientes
5. **CRUD basico**: `addItem`, `updateItem`, `deleteItem`, `deleteItems`, `getItem`, `setItems`

```tsx
// Crear un store
const store = createLocalStore<Agent>({
  storageKey: "smartcontact_agents",
  versionKey: "smartcontact_agents_v",
  currentVersion: 10,
  defaults: agentsData,
});

// Usarlo en un hook custom que expone metodos de dominio
export function useAgentsStore() {
  const base = store.useStore();

  // Metodos custom que usan base.addItem, base.setItems, store.getRawSnapshot(), etc.
  const duplicateAgent = useCallback((...) => {
    const snapshot = store.getRawSnapshot();
    // ... logica custom ...
    store.writeToStorage([...snapshot, newAgent]);
  }, []);

  return {
    agents: base.items,
    addAgent,
    updateAgent: base.updateItem,  // Delegar directamente metodos base
    deleteAgent: base.deleteItem,
    duplicateAgent,                // Metodos custom
    bulkUpdate,
  };
}
```

### Stores existentes

| Store | Entidad | StorageKey | Custom methods |
|-------|---------|-----------|---------------|
| useAgentsStore | Agent | smartcontact_agents | duplicateAgent, bulkUpdate, updatePresence |
| useGroupsStore | Group | smartcontact_groups | duplicateGroup, bulkUpdate |
| useLabelsStore | Label | smartcontact_labels | (solo CRUD basico) |
| useTemplatesStore | Template | smartcontact_templates | addTemplate (con timestamps), updateTemplate (con updatedAt) |
| useUsersStore | User | smartcontact_users | duplicateUser |

### Bump de version

Cuando cambias la estructura de datos (anadir campo, cambiar tipo), **incrementa `currentVersion`** en el store. Esto fuerza un re-seed desde los defaults en todos los navegadores que tengan datos antiguos.

---

## Hub de componentes compartidos (/shared)

El archivo `/src/app/components/shared/index.ts` es el catalogo central. Organizado en 9 categorias:

### 1. Form Components (`FormComponents.tsx`)

| Componente | Descripcion | Usado en |
|-----------|-------------|----------|
| `SectionCard` | Tarjeta con header gris e icono para agrupar campos | Todos los formularios |
| `FieldLabel` | Label con asterisco obligatorio y tooltip | Todos los formularios |
| `TooltipIcon` | Icono (i) con tooltip contextual | Todos los formularios |
| `ToggleSwitch` | Toggle on/off estilo low-fi (sm/md) | Agentes, Grupos |
| `DiscardDialog` | Dialog "Descartar cambios?" con focus management | Todos los formularios |
| `inputClass` | String de clases CSS para inputs consistentes | Todos los formularios |

### 2. Table Components (`TableComponents.tsx`)

| Componente | Descripcion | Usado en |
|-----------|-------------|----------|
| `ContextMenu` | Menu contextual (clic derecho) con viewport clamping | Agentes, Grupos, Usuarios |
| `BulkContextMenu` | Menu contextual para multi-seleccion | Agentes, Grupos |
| `SortableHeader` | Header de tabla clicable con icono asc/desc | Todos los listados |
| `ChannelBadges` | Badges de canal (telefono/chat/email) | Agentes, Grupos |
| `InlineDuplicateRow` | Fila inline para duplicar con nombre editable | Agentes, Grupos |

### 3. Dialogs

| Componente | Descripcion | Usado en |
|-----------|-------------|----------|
| `DeleteEntityDialog` | Eliminacion con copy-paste (single) o chips removibles (bulk) | Todos los modulos |
| `ImpactPreviewDialog` | Preview de operacion bulk con items quitables | Agentes, Grupos |

### 4. Otros componentes

| Componente | Descripcion |
|-----------|-------------|
| `ColumnSelector` | Dropdown para mostrar/ocultar columnas de tabla |
| `LabelFilterButton` | Filtro de labels con 3 variantes: action-bar, compact, header |
| `Tooltip` / `IconTooltip` | Tooltip edge-aware con reposicionamiento automatico |

### 5. Hooks

| Hook | Descripcion |
|------|-------------|
| `useClickOutside` | Cierra componente al clic fuera o Escape |
| `useKeyboardNav` | Navegacion con flechas + Enter + Home/End en dropdowns |
| `useNavigationGuard` | Bloquea navegacion React Router si hay cambios sin guardar |
| `useCrossTabWarning` | Detecta si otra pestana esta editando la misma entidad |

### 6. Utilities

| Funcion | Descripcion |
|---------|-------------|
| `exportToXlsx()` | Genera archivo Excel con headers styled y auto-fit columnas |
| `copyToClipboard()` | Copia al portapapeles con Clipboard API + fallback |
| `pushUndo()` / `popUndo()` | Pila global de Ctrl+Z (consumida por AppLayout) |

---

## Modulos funcionales

### Agentes (`/agents`)

Modelo: `Agent` con campos name, code, extension, email, status, presenceStatus, agentType, channels, groups, skills, permissions, schedules, labels, isDraft.

- **AgentsListPage**: tabla sortable, busqueda, seleccion multiple, context menu (editar/duplicar/eliminar), bulk bar (cambiar tipo/estado/canales/grabacion), export XLSX, column selector, label filter, inline duplicate row con undo
- **CreateAgentPage**: formulario dos columnas, panel izquierdo sticky con resumen y drag-and-drop de skills, SectionCards (datos, canales, permisos, grupo/horarios, labels), navigation guard, cross-tab warning, Ctrl+S, draft banner

### Grupos (`/groups`)

Modelo: `Group` con campos name, code, channels, strategy, priority, agents, labels, schedules, isDraft.

- **GroupsListPage**: mismos patrones que AgentsListPage (tabla, bulk, export, undo, duplicate)
- **CreateGroupPage**: formulario dos columnas, panel izquierdo con lista de agentes asignados, SectionCards, navigation guard

### Labels (`/labels`)

Modelo: `Label` con campos name, color, description.

- **LabelsPage**: gestion inline (sin pagina separada de creacion). Tabla con edicion in-place, creacion en fila superior, colores predefinidos. Export XLSX.

### Plantillas (`/templates`)

Modelo: `Template` con campos title, category, channel, body, variables, status, createdAt, updatedAt.

- **TemplatesPage**: lista + panel lateral de edicion. Preview del mensaje con variables resaltadas. Filtros por canal y categoria. Usa DeleteEntityDialog compartido.

### Usuarios (`/users`)

Modelo: `User` con campos name, code, email, identifier, type (admin/supervisor/agent/viewer), photo, sections (checkboxes jerarquicos), permissions (toggles), assignedGroups, assignedServices, status, isDraft.

- **UsersListPage**: tabla sortable, busqueda, seleccion, context menu, bulk delete, export XLSX, inline duplicate con undo
- **CreateUserPage**: formulario dos columnas. Panel izquierdo sticky con foto + resumen + tabs (grupos/servicios asignados). SectionCards: datos personales, accesos (secciones con jerarquia padre/hijo + permisos lado a lado con "marcar/desmarcar todo"), grupos con busqueda, servicios con busqueda. Navigation guard, cross-tab, Ctrl+S, draft banner, delete from edit.

---

## Patrones UX fundamentales

Estos patrones estan documentados en designDecisions.ts y deben mantenerse en TODOS los modulos:

### DD#267 — Prohibicion absoluta de layout shift

NUNCA montar/desmontar condicionalmente elementos que afecten el flujo del layout. Usar `opacity-0 pointer-events-none min-h-[X]` para reservar espacio. Los mensajes de error de validacion siempre tienen `min-h-[16px]`.

### DD#293 — Undo global con Ctrl+Z / Cmd+Z

Cuando una accion destructiva muestra un toast (eliminar, duplicar), se registra un `pushUndo()` con el callback de reversion. El listener global en `AppLayout` intercepta Ctrl+Z y ejecuta `popUndo()`. Cada entrada expira a los 9 segundos.

### DD#294 — Duplicar como borrador (isDraft)

Al duplicar una entidad, la copia se crea con `isDraft: true` y `status: "inactive"`. Los borradores flotan siempre a la primera posicion de la tabla, independientemente del sort. Se muestran con icono `FilePen` amber y tooltip "Borrador - pendiente de revision".

### DD#295 — Oficializacion automatica al guardar borrador

Al guardar un borrador en el formulario de edicion, se limpia `isDraft` y se establece `status: "active"` automaticamente. El toast dice "activado correctamente" en vez de "guardado".

### DD#136 — Navigation guard + beforeunload

Todos los formularios de creacion/edicion implementan:
1. `useNavigationGuard(formTouched && !saving)` para interceptar navegacion in-app
2. `beforeunload` event para interceptar cierre de pestana
3. `DiscardDialog` cuando se intenta navegar con cambios pendientes

### DD#169 — Cross-tab conflict warning

`useCrossTabWarning(entityType, entityId)` detecta si otra pestana esta editando la misma entidad usando localStorage locks.

### DD#134 — Context menu con viewport clamping

Los menus contextuales (clic derecho) se reposicionan automaticamente para no salir de la ventana del navegador.

### DD#135 — Keyboard navigation en dropdowns

Arrow Up/Down, Enter, Escape, Home/End. Auto-scroll del item activo al viewport del contenedor.

### Patron de formulario de creacion/edicion

Todos los formularios (`CreateAgentPage`, `CreateGroupPage`, `CreateUserPage`) siguen esta estructura:

```
TopBar (breadcrumbs)
Draft banner (si isDraft)
Sticky header (nombre editable inline + botones Eliminar/Cancelar/Guardar)
Cross-tab warning (si aplica)
Two-column layout:
  LEFT: Panel sticky con resumen de la entidad
  RIGHT: SectionCards apiladas con los campos del formulario
DiscardDialog (si blocker.state === "blocked")
DeleteEntityDialog (si se activa desde boton Eliminar)
```

### Patron de pagina de listado

Todas las paginas de lista (`AgentsListPage`, `GroupsListPage`, `UsersListPage`) siguen:

```
TopBar (breadcrumbs)
Action bar: boton "Crear", buscador, column selector, export XLSX
Tabla con:
  - SortableHeader en cada columna
  - Checkbox de seleccion por fila + header "seleccionar todos"
  - Borradores siempre primero (isDraft: true)
  - Context menu (clic derecho): Editar, Duplicar, Eliminar
  - Inline duplicate row (se inserta bajo la fila original)
Empty state con icono dashed si no hay resultados
Bulk bar (fixed bottom): contador + botones de accion bulk + eliminar
DeleteEntityDialog (single o bulk segun contexto)
```

---

## Sistema de Design Decisions (DD)

El archivo `designDecisions.ts` contiene un array de 297 decisiones documentadas. Cada DD tiene:

- `id`: numero secuencial unico
- `category`: Navegacion, Visualizacion, Interaccion, Formularios, Estructura, Listas, Datos, Auditoria UX, Patch UX, Arquitectura, Limpieza, UI
- `title`: resumen de una linea
- `description`: explicacion detallada
- `status`: "reviewed" (validada) o "pending" (propuesta)
- `discovery`: contexto de por que se tomo la decision (opcional)
- `date`: fecha ISO (opcional)

### Como anadir una nueva DD

1. Incrementar el `id` secuencialmente
2. Usar una `category` existente del tipo `DecisionCategory`
3. Marcar como `"reviewed"` si ya esta implementada, `"pending"` si es propuesta
4. Siempre incluir `date` con formato YYYY-MM-DD
5. El campo `discovery` es valioso: explica el "por que" ademas del "que"

---

## Reglas absolutas

Estas reglas no son negociables y aplican a TODO el codigo:

1. **CERO layout shift** (DD#267): nunca montar/desmontar elementos que cambien el flujo visual
2. **CERO border-radius**: el design system es low-fi, `--radius: 0` siempre
3. **CERO sombras**: no usar `shadow-*` en ningun componente
4. **CERO colores de acento**: no introducir azules, verdes, morados. Solo grises + rojo para destructivo
5. **Todos los iconos de lucide-react**: no importar de otras librerias de iconos
6. **Toasts con sonner**: nunca alert() ni confirm()
7. **React Router sin -dom**: importar de `"react-router"`, nunca de `"react-router-dom"`
8. **Stores con factory**: usar `createLocalStore<T>()` para nuevos stores
9. **Formularios con guard**: todo formulario debe tener useNavigationGuard + beforeunload + DiscardDialog
10. **Undo en acciones destructivas**: pushUndo() en cada delete/duplicate que muestre toast
11. **Draft pattern**: las duplicaciones siempre crean isDraft:true con oficializacion automatica al guardar
12. **Archivos protegidos**: NUNCA modificar `/src/app/components/figma/ImageWithFallback.tsx` ni `/pnpm-lock.yaml`

---

## Guia para LLMs que modifiquen este codigo

### Antes de modificar cualquier cosa

1. **Lee `designDecisions.ts`**: contiene 297 decisiones que explican por que cada cosa es como es. Busca DDs relevantes antes de cambiar patrones.
2. **Lee `/src/app/components/shared/index.ts`**: es el catalogo de componentes reutilizables. Antes de crear algo nuevo, verifica que no exista ya.
3. **Lee el store del modulo**: entiende que metodos expone y como funciona la persistencia.
4. **Lee un modulo hermano**: si vas a modificar Agentes, lee como funciona Grupos (son espejos). Si vas a crear un modulo nuevo, usa Usuarios como template mas reciente.

### Al crear un modulo nuevo

1. Crear `[modulo]Data.ts` con tipos e interfaces + datos mock
2. Crear `use[Modulo]Store.ts` usando `createLocalStore` factory
3. Crear `[Modulo]ListPage.tsx` siguiendo el patron de listado
4. Crear `Create[Modulo]Page.tsx` siguiendo el patron de formulario
5. Anadir rutas en `routes.ts` (lista + crear + editar/:id)
6. Anadir entrada en el sidebar (`Sidebar.tsx`)
7. Documentar en `designDecisions.ts` con nueva DD

### Al modificar un componente shared

1. Verificar que el cambio no rompe los consumidores existentes (buscar imports del componente)
2. Si el cambio es breaking, actualizar TODOS los consumidores en el mismo commit
3. Documentar el cambio en una nueva DD

### Convenciones de nombrado

- Paginas: `[Entidad]ListPage.tsx`, `Create[Entidad]Page.tsx`
- Stores: `use[Entidad]Store.ts`
- Datos: `[entidad]Data.ts`
- Componentes shared: PascalCase descriptivo (`DeleteEntityDialog`, `SortableHeader`)
- Hooks shared: `use[Comportamiento].ts` (`useClickOutside`, `useNavigationGuard`)

### Testing mental

Antes de dar por terminado un cambio, verifica mentalmente:

- [ ] No hay layout shift? (DD#267)
- [ ] No hay border-radius? (--radius: 0)
- [ ] No hay sombras?
- [ ] Los iconos son de lucide-react?
- [ ] Los toasts usan sonner?
- [ ] El formulario tiene navigation guard + beforeunload?
- [ ] Las acciones destructivas tienen undo?
- [ ] Los borradores se muestran primero en la tabla?
- [ ] El context menu tiene viewport clamping?
- [ ] Los imports de routing usan "react-router" (no "-dom")?

### Rutas actuales

```
/                           PlaceholderPage (home)
/admin/agentes              AgentsListPage
/admin/agentes/crear        CreateAgentPage
/admin/agentes/editar/:id   CreateAgentPage (modo edicion)
/admin/grupos               GroupsListPage
/admin/grupos/crear         CreateGroupPage
/admin/grupos/editar/:id    CreateGroupPage (modo edicion)
/admin/usuarios             UsersListPage
/admin/usuarios/crear       CreateUserPage
/admin/usuarios/editar/:id  CreateUserPage (modo edicion)
/admin/labels               LabelsPage
/admin/plantillas           TemplatesPage
/admin/agendas              PlaceholderPage (pendiente)
/admin/tipificaciones       PlaceholderPage (pendiente)
/dashboard                  PlaceholderPage (pendiente)
/servicios                  PlaceholderPage (pendiente)
/nodo-ia                    PlaceholderPage (pendiente)
/campanas                   PlaceholderPage (pendiente)
/conversaciones             PlaceholderPage (pendiente)
/informes                   PlaceholderPage (pendiente)
/analizador                 PlaceholderPage (pendiente)
/scc                        PlaceholderPage (pendiente)
/vui-designer               PlaceholderPage (pendiente)
/config/seguridad           PlaceholderPage (pendiente)
/config/personalizacion     PlaceholderPage (pendiente)
/config/aed                 PlaceholderPage (pendiente)
/config/integraciones       PlaceholderPage (pendiente)
/config/sistema             PlaceholderPage (pendiente)
```

### Modelos de datos clave

```typescript
// Agent (simplificado)
interface Agent {
  id: number; code: string; name: string; extension: string;
  email?: string; status: "active" | "inactive";
  presenceStatus: PresenceStatus; agentType: AgentType;
  channels: ("phone" | "chat" | "email")[];
  groups: number[]; skills: Skill[];
  permissions: AgentPermissions; schedules: ScheduleAssignment[];
  labels: number[]; isDraft?: boolean;
}

// Group (simplificado)
interface Group {
  id: number; code: string; name: string;
  channels: string[]; strategy: string; priority: string;
  agents: number[]; labels: number[];
  schedules: ScheduleAssignment[]; isDraft?: boolean;
}

// User
interface User {
  id: number; code: string; name: string; email: string;
  identifier: string; type: "administrator" | "supervisor" | "agent" | "viewer";
  photo?: string; sections: UserSections; permissions: UserPermissions;
  assignedGroups: number[]; assignedServices: string[];
  status: "active" | "inactive"; createdAt: string; isDraft?: boolean;
}

// Label
interface Label {
  id: number; name: string; color: string; description: string;
}

// Template
interface Template {
  id: number; title: string; category: string; channel: string;
  body: string; variables: string[];
  status: "active" | "draft"; createdAt: string; updatedAt: string;
}
```
