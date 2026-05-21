import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Sparkles, X } from 'lucide-angular';

type ComponentType = 'full-primeng' | 'custom-preset' | 'extended' | 'pure-sc';

/**
 * Estado de paridad Figma SC ↔ código. Mide "cuánto puedes fiarte de que el
 * código y el Figma del DS están alineados". Distinto de `type` (que mide
 * cuánto se ha customizado respecto a PrimeNG).
 *
 * Buckets:
 * - `audited-full` — auditado 1:1 contra Figma SC kit, sin gaps activos.
 * - `audited-partial` — hay Figma SC y se ha auditado, pero queda algún
 *   gap menor documentado en backlog (ej. variant faltante).
 * - `no-figma-equivalent` — patrón in-house de SC sin equivalente Figma
 *   PrimeOne (ej. bulk-action-bar, command-palette). La paridad no aplica.
 */
type FigmaParity = 'audited-full' | 'audited-partial' | 'no-figma-equivalent';

/**
 * Agrupación visual del catálogo. Inspirado en Polaris / Carbon — los
 * componentes viven por función, no por orden de creación. El tracker
 * agrupa las cards y la lista filtrable por estas categorías para que
 * el equipo de diseño encuentre piezas relacionadas juntas sin scrollear toda la lista.
 */
type ComponentCategory =
  | 'form'
  | 'actions'
  | 'layout'
  | 'navigation'
  | 'overlay'
  | 'table'
  | 'empty';

interface CategoryMeta {
  readonly id: ComponentCategory;
  readonly label: string;
  /** Orden de aparición — bajo = arriba. */
  readonly order: number;
}

const CATEGORY_META: readonly CategoryMeta[] = [
  { id: 'form', label: 'Formularios y entrada', order: 1 },
  { id: 'actions', label: 'Acciones', order: 2 },
  { id: 'layout', label: 'Layout y estructura', order: 3 },
  { id: 'navigation', label: 'Navegación', order: 4 },
  { id: 'overlay', label: 'Overlays y diálogos', order: 5 },
  { id: 'table', label: 'Tablas y celdas', order: 6 },
  { id: 'empty', label: 'Estados vacíos', order: 7 },
];

const CATEGORY_BY_SLUG: Record<string, ComponentCategory> = {
  // Formularios y entrada
  inputtext: 'form',
  inputnumber: 'form',
  inputgroup: 'form',
  select: 'form',
  multiselect: 'form',
  datepicker: 'form',
  checkbox: 'form',
  toggleswitch: 'form',
  search: 'form',
  'photo-upload': 'form',
  'color-dot-picker': 'form',
  // Acciones
  button: 'actions',
  'bulk-action-bar': 'actions',
  'bulk-edit-menu': 'actions',
  'form-danger-zone': 'actions',
  // Layout
  'section-card': 'layout',
  'page-header': 'layout',
  'sticky-form-header': 'layout',
  // Navegación
  tabs: 'navigation',
  'form-section-nav': 'navigation',
  'command-palette': 'navigation',
  'keyboard-shortcuts': 'navigation',
  // Overlays y diálogos
  dialog: 'overlay',
  toast: 'overlay',
  tooltip: 'overlay',
  'delete-entity-dialog': 'overlay',
  'impact-preview-dialog': 'overlay',
  'confirm-host': 'overlay',
  // Tablas y celdas
  'label-chip': 'table',
  'illustrated-avatar': 'table',
  'inline-rename-cell': 'table',
  'group-popover': 'table',
  'column-selector': 'table',
  // Estados vacíos
  'empty-state': 'empty',
};

interface ComponentEntry {
  slug: string;
  name: string;
  type: ComponentType;
  parity: FigmaParity;
  pageRoute?: string;
  /** Qué hace el componente en lenguaje no técnico. */
  whatItDoes: string;
  /**
   * Dónde verlo en AED o ds-docs para identificarlo visualmente.
   * Si está vacío: el componente está hecho pero no usado todavía.
   */
  whereToSee: string;
  /**
   * Dónde verlo en Memory (feature module hermano de AED). Solo se rellena
   * cuando el componente tiene `memoryUses > 0`. Permite al equipo de
   * diseño localizarlo en el flujo Memory sin tener que cazar el archivo.
   */
  whereToSeeMemory?: string;
  /**
   * Veces que aparece en templates AED (admin + config + supervision + shared + core).
   * Snapshot manual via `grep -rh "<sc-X" apps/supervisor/src/app/features/{admin,config,supervision}`.
   * 0 = sin uso real todavía. Los componentes con uso > 0 son los que el equipo
   * de desarrollo ya tiene interiorizados.
   */
  aedUses: number;
  /**
   * Veces que aparece en templates Memory (`features/memory/`).
   * Equivalente a aedUses pero acotado al feature module Memory (en migración
   * desde el prototipo React). Cuando un componente tiene `aedUses > 0` **y**
   * `memoryUses > 0`, es cross-consumer (★) — son los componentes con más
   * ROI a la hora de cuidarlos y los primeros candidatos a refactor.
   */
  memoryUses: number;
}

const STORAGE_KEY = 'sc-ds-validated';

/**
 * Lee del localStorage el set de slugs marcados como validados.
 * Tolerante a JSON malformado / storage no disponible (SSR, modo privado).
 */
function readValidated(): Set<string> {
  if (typeof window === 'undefined' || !window.localStorage) return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function writeValidated(set: Set<string>): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    /* storage llena o bloqueada — degrada silenciosamente */
  }
}

@Component({
  selector: 'sc-ds-docs-home',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  /**
   * Catálogo único de componentes del SCDS. Espejo de
   * `packages/design-system/docs/MIGRATION-INVENTORY.md` — si añades
   * uno ahí, añádelo aquí también (TODO: extraer a JSON shared).
   */
  protected readonly catalog: readonly ComponentEntry[] = [
    {
      slug: 'button',
      name: 'Button',
      type: 'custom-preset',
      parity: 'audited-full',
      aedUses: 37,
      memoryUses: 18,
      pageRoute: '/components/button',
      whatItDoes: 'Botón de acción (primario azul, secundario gris, peligro rojo, etc.).',
      whereToSee:
        'En cualquier pantalla. Ej: AED → Administración → Agentes → botón "Crear agente" arriba a la derecha.',
      whereToSeeMemory:
        'Memory → /conversaciones → bulk action bar (Marcar leídas / Transcribir) + en cada modal del módulo (Player, Categorías, Entidades, Reglas).',
    },
    {
      slug: 'inputtext',
      name: 'InputText',
      type: 'extended',
      parity: 'audited-full',
      aedUses: 15,
      memoryUses: 7,
      pageRoute: '/components/inputtext',
      whatItDoes:
        'Campo de texto para formularios: nombre, email, contraseña, teléfono… Incluye label, texto de ayuda y mensaje de error.',
      whereToSee:
        'AED → Administración → Agentes/Usuarios/Grupos/Plantillas/Etiquetas/Repositorios → "Crear/Editar" → cualquier campo de texto. Migración completada en Sesiones 31 + 32 (21 instancias).',
      whereToSeeMemory:
        "Memory → /conversaciones/categorías o /entidades → 'Crear/Editar' → campos nombre y descripción. También en filtros de búsqueda.",
    },
    {
      slug: 'inputnumber',
      name: 'InputNumber',
      type: 'extended',
      parity: 'audited-full',
      aedUses: 9,
      memoryUses: 0,
      pageRoute: '/components/inputnumber',
      whatItDoes:
        'Campo numérico para formularios: capacidades, contadores, segundos, porcentajes. Mismo aspecto que el campo de texto pero con la unidad ("s", "%", "agentes") a la derecha y el número alineado a la derecha también.',
      whereToSee:
        'AED → Configuración → AED → Grupos → Capacidad ("Límite de cola") + 2 tiempos en segundos (transferencia, max espera). 3 fields migrados como POC. Resto pendiente de migración por feature.',
    },
    {
      slug: 'inputgroup',
      name: 'InputGroup',
      type: 'extended',
      parity: 'audited-full',
      aedUses: 1,
      memoryUses: 0,
      pageRoute: '/components/inputgroup',
      whatItDoes:
        'Agrupa un input con addons pegados a izquierda o derecha (prefijo $, sufijo .00, icono usuario, botón "Añadir"…). PrimeNG funde los bordes para que el conjunto se lea como una pieza única.',
      whereToSee:
        'AED → Configuración → AED → Servicio → bloque "Estados de no disponibilidad" (input + botón "Añadir"). Demo con 5 escenarios en ds-docs (texto, icono, múltiples, botón con caso real tag-input, sizes).',
    },
    {
      slug: 'select',
      name: 'Select / dropdown',
      type: 'extended',
      parity: 'audited-full',
      aedUses: 25,
      memoryUses: 0,
      pageRoute: '/components/select',
      whatItDoes:
        'Desplegable para elegir UNA opción entre varias. Reemplaza los menús nativos del navegador para que se vean igual en Chrome, Safari y Firefox y combinen con el resto de campos.',
      whereToSee:
        'AED → Administración → Agentes/Usuarios/Grupos/Repositorios → "Crear/Editar" → cualquier desplegable. Migración completada en Sesiones 31 + 32 (16 instancias). También usado internamente por sc-bulk-edit-menu (refactor S32).',
    },
    {
      slug: 'datepicker',
      name: 'Datepicker',
      type: 'extended',
      parity: 'audited-full',
      aedUses: 0,
      memoryUses: 2,
      pageRoute: '/components/datepicker',
      whatItDoes:
        'Selector de fecha. Abre un calendario al hacer click. Soporta selección día/mes/año, rangos min-max ("solo próximos 30 días"), y modo inline (calendario siempre visible).',
      whereToSee:
        'Aún no hay datepickers visibles en AED — primer caso planeado es "fecha de alta del agente". Demo en ds-docs hasta entonces.',
      whereToSeeMemory: "Memory → /conversaciones → top-bar → filtro 'Fecha'.",
    },
    {
      slug: 'tabs',
      name: 'Tabs',
      type: 'custom-preset',
      parity: 'audited-full',
      aedUses: 0,
      memoryUses: 0,
      pageRoute: '/components/tabs',
      whatItDoes:
        'Navegación por pestañas dentro de UNA pantalla. Por ejemplo: "Activos / Archivados / Todos" en una lista, o secciones de un formulario largo. El tab activo se marca con un underline en color de marca.',
      whereToSee:
        'Aún no hay tabs nativos en AED — primer caso planeado es la pantalla de configuración avanzada. Demo en ds-docs hasta entonces.',
    },
    {
      slug: 'tooltip',
      name: 'Tooltip',
      type: 'full-primeng',
      parity: 'audited-full',
      aedUses: 0,
      memoryUses: 0,
      pageRoute: '/components/tooltip',
      whatItDoes:
        'Cajita oscura con texto que aparece al pasar el ratón por encima de un botón o icono. Sirve para explicar botones que solo tienen icono (sin texto) o para añadir contexto a un campo.',
      whereToSee:
        'AED tiene tooltips en los botones icon-only de las tablas (ej: el botón "borrar" papelera). En ds-docs tienes ejemplos interactivos.',
    },
    {
      slug: 'multiselect',
      name: 'MultiSelect',
      type: 'extended',
      parity: 'audited-full',
      aedUses: 0,
      memoryUses: 8,
      pageRoute: '/components/multiselect',
      whatItDoes:
        'Desplegable para elegir VARIAS opciones a la vez (al contrario que select, que es solo una). Los seleccionados aparecen como texto separado por comas O como pills removibles (X cada uno) según prefieras.',
      whereToSee:
        'AED aún no lo usa nativamente, pero próximo caso: asignación de canales a un agente (Email + WhatsApp + Teléfono…). Demo en ds-docs hasta entonces.',
      whereToSeeMemory:
        'Memory → /conversaciones → top-bar → Servicios / Grupos ACD / Agentes (filtros multi-valor).',
    },
    {
      slug: 'search',
      name: 'Search',
      type: 'extended',
      parity: 'audited-full',
      aedUses: 8,
      memoryUses: 0,
      pageRoute: '/components/search',
      whatItDoes:
        'Campo de búsqueda con icono lupa a la izquierda + botón × para vaciar + opcional pista de atajo (⌘K, /) que se ve cuando el campo está vacío. Lo típico de un buscador de tabla o de un picker.',
      whereToSee:
        'AED → Administración → cualquier list page (Agentes/Usuarios/Grupos/Etiquetas/Plantillas/Repositorios) → buscador del toolbar arriba. También en agent-form picker-search (agendas/plantillas). 8 instancias en producción. Figma SC `❖ Search` canvas compuesto en S31.',
    },
    {
      slug: 'dialog',
      name: 'Dialog',
      type: 'extended',
      parity: 'audited-full',
      aedUses: 2,
      memoryUses: 6,
      pageRoute: '/components/dialog',
      whatItDoes:
        'Ventana emergente con título, body (acepta cualquier contenido apilado) y botones de acción. Se abre centrada sobre la pantalla con un velo gris detrás.',
      whereToSee:
        'AED → Administración → Etiquetas → click en una etiqueta para editarla (se abre encima). Demo interactiva en ds-docs con 5 escenarios.',
      whereToSeeMemory:
        'Memory → click en una fila de la tabla → ConversationPlayerModal. Y los modales CategoryForm, EntityForm, BulkTranscription se montan también con <sc-dialog>.',
    },
    {
      slug: 'toast',
      name: 'Toast',
      type: 'custom-preset',
      parity: 'audited-full',
      aedUses: 1,
      memoryUses: 0,
      pageRoute: '/components/toast',
      whatItDoes:
        'Notificación pequeña que aparece y desaparece sola en una esquina (típicamente abajo a la derecha). Soporta success / info / warn / error / "neutral notice" violeta + botón "deshacer" opcional.',
      whereToSee:
        'AED → guarda cualquier cambio (ej: edita una etiqueta y dale a "Guardar") → ves el "Guardado correctamente". Demo interactiva en ds-docs.',
    },
    {
      slug: 'photo-upload',
      name: 'Photo upload',
      type: 'pure-sc',
      parity: 'no-figma-equivalent',
      aedUses: 2,
      memoryUses: 0,
      pageRoute: '/components/photo-upload',
      whatItDoes:
        'Sube una foto arrastrándola o haciendo click; permite recortarla y previsualizarla.',
      whereToSee: 'AED → Administración → Agentes → "Crear agente" → bloque "Foto del agente".',
    },
    {
      slug: 'toggleswitch',
      name: 'ToggleSwitch',
      type: 'extended',
      parity: 'audited-full',
      aedUses: 21,
      memoryUses: 0,
      pageRoute: '/components/toggleswitch',
      whatItDoes:
        'Interruptor on/off estilo iOS (la bolita que se desliza de izquierda a derecha).',
      whereToSee:
        'AED → Configuración → AED → Servicio → opciones tipo "Activo / Inactivo". Refactor S32: ahora wrapper de PrimeNG `<p-toggleswitch>` (era CSS custom). Figma SC node 6738:22645.',
    },
    {
      slug: 'checkbox',
      name: 'Checkbox (tri-state)',
      // Reclasificado de 'extended' → 'pure-sc' tras auditoría Figma SC:
      // el componente NO importa nada de PrimeNG, usa `<input type="checkbox">`
      // nativo con CSS custom para los 3 estados. Es pure-sc por definición.
      type: 'pure-sc',
      parity: 'audited-full',
      aedUses: 6,
      memoryUses: 0,
      pageRoute: '/components/checkbox',
      whatItDoes:
        'Checkbox con 3 estados: vacío, marcado a medias (cuando hay selección parcial) y marcado del todo. Tres tamaños sm/md/lg + variant filled (slate-50). Patrón típico: "seleccionar todo" del header de tabla.',
      whereToSee:
        'AED → Administración → Etiquetas → checkbox de cabecera de la tabla (cuando marcas algunas filas pero no todas se pone a medias). Demo interactiva en ds-docs.',
    },
    {
      slug: 'illustrated-avatar',
      name: 'Illustrated avatar',
      type: 'pure-sc',
      parity: 'no-figma-equivalent',
      aedUses: 7,
      memoryUses: 0,
      pageRoute: '/components/illustrated-avatar',
      whatItDoes:
        'Avatar dibujado que se asigna automáticamente a usuarios o agentes que no tienen foto subida.',
      whereToSee:
        'AED → Administración → Agentes → en la tabla, los agentes sin foto muestran un avatar ilustrado.',
    },
    {
      slug: 'section-card',
      name: 'Section card',
      type: 'pure-sc',
      parity: 'no-figma-equivalent',
      aedUses: 12,
      memoryUses: 0,
      pageRoute: '/components/section-card',
      whatItDoes:
        'Tarjeta blanca con título que agrupa campos relacionados dentro de un formulario largo.',
      whereToSee:
        'AED → Administración → Agentes → "Crear agente" → cada bloque blanco con título ("Datos personales", "Configuración", etc.) es una section-card.',
    },
    {
      slug: 'bulk-action-bar',
      name: 'Bulk action bar',
      type: 'pure-sc',
      parity: 'no-figma-equivalent',
      aedUses: 6,
      memoryUses: 2,
      pageRoute: '/components/bulk-action-bar',
      whatItDoes:
        'Barra que aparece flotando abajo cuando seleccionas varios elementos de una tabla, con acciones masivas (borrar varios, editar varios…).',
      whereToSee:
        'AED → Administración → Etiquetas → marca 2 o más etiquetas con los checkboxes → aparece la barra flotante abajo.',
      whereToSeeMemory:
        "Memory → /conversaciones → marca dos o más filas con los checkboxes → aparece la barra abajo con 'Marcar leídas' + 'Transcribir y analizar'.",
    },
    {
      slug: 'bulk-edit-menu',
      name: 'Bulk edit menu',
      type: 'pure-sc',
      parity: 'no-figma-equivalent',
      aedUses: 2,
      memoryUses: 0,
      pageRoute: '/components/bulk-edit-menu',
      whatItDoes:
        'Menú desplegable de "edición masiva" que sale de la barra anterior para cambiar un campo a varios elementos a la vez.',
      whereToSee:
        'AED → Administración → Etiquetas → marca varias → en la barra de abajo dale a "Editar" → sale este menú.',
    },
    {
      slug: 'empty-state',
      name: 'Empty state',
      type: 'pure-sc',
      parity: 'no-figma-equivalent',
      aedUses: 3,
      memoryUses: 0,
      pageRoute: '/components/empty-state',
      whatItDoes:
        'Mensaje grande con ilustración que aparece cuando una lista o pantalla está vacía ("No hay nada todavía").',
      whereToSee: 'AED → cualquier sección vacía (ej: una pantalla recién creada sin datos aún).',
    },
    {
      slug: 'form-danger-zone',
      name: 'Form danger zone',
      type: 'pure-sc',
      parity: 'no-figma-equivalent',
      aedUses: 3,
      memoryUses: 0,
      pageRoute: '/components/form-danger-zone',
      whatItDoes:
        'Bloque rojo al final de los formularios de edición con acciones destructivas (borrar la entidad entera).',
      whereToSee: 'AED → edita un agente o etiqueta ya existente → baja al final del formulario.',
    },
    {
      slug: 'form-section-nav',
      name: 'Form section nav',
      type: 'pure-sc',
      parity: 'no-figma-equivalent',
      aedUses: 5,
      memoryUses: 0,
      pageRoute: '/components/form-section-nav',
      whatItDoes:
        'Navegación lateral del formulario: muestra las secciones y resalta en cuál estás según vas haciendo scroll.',
      whereToSee:
        'AED → Administración → Agentes → "Crear agente" → barra lateral izquierda con el índice de secciones.',
    },
    {
      slug: 'confirm-host',
      name: 'Confirm host',
      type: 'pure-sc',
      parity: 'no-figma-equivalent',
      aedUses: 1,
      memoryUses: 0,
      pageRoute: '/components/confirm-host',
      whatItDoes:
        'Pop-up de "¿Estás seguro?" que aparece antes de acciones importantes (borrar, archivar…).',
      whereToSee: 'AED → intenta borrar cualquier cosa → sale el "¿Estás seguro?".',
    },
    {
      slug: 'label-chip',
      name: 'Label chip',
      type: 'pure-sc',
      parity: 'audited-full',
      aedUses: 3,
      memoryUses: 0,
      pageRoute: '/components/label-chip',
      whatItDoes:
        'Etiqueta de color con texto (las pastillitas redondeadas con el color de la categoría).',
      whereToSee:
        'AED → Administración → Etiquetas → cada etiqueta de la tabla se muestra como un chip.',
    },
    {
      slug: 'color-dot-picker',
      name: 'Color dot picker',
      type: 'pure-sc',
      parity: 'no-figma-equivalent',
      aedUses: 2,
      memoryUses: 0,
      pageRoute: '/components/color-dot-picker',
      whatItDoes:
        'Selector de color: muestra varios círculos de colores y eliges uno haciendo click.',
      whereToSee:
        'AED → Administración → Etiquetas → crear o editar etiqueta → fila de círculos de colores.',
    },
    {
      slug: 'inline-rename-cell',
      name: 'Inline rename cell',
      type: 'pure-sc',
      parity: 'no-figma-equivalent',
      aedUses: 3,
      memoryUses: 0,
      pageRoute: '/components/inline-rename-cell',
      whatItDoes:
        'Editar el nombre de algo directamente en la tabla, sin abrir formulario (típicamente con doble-click).',
      whereToSee:
        'AED → Administración → Etiquetas → doble-click sobre el nombre de una etiqueta → se vuelve editable in-situ.',
    },
    {
      slug: 'group-popover',
      name: 'Group popover',
      type: 'pure-sc',
      parity: 'no-figma-equivalent',
      aedUses: 2,
      memoryUses: 0,
      pageRoute: '/components/group-popover',
      whatItDoes:
        'Tarjeta flotante que aparece al pasar el ratón sobre un grupo, mostrando sus miembros y acciones rápidas.',
      whereToSee: 'AED → Administración → Grupos → pasa el ratón sobre la fila de un grupo.',
    },
    {
      slug: 'column-selector',
      name: 'Column selector',
      type: 'pure-sc',
      parity: 'no-figma-equivalent',
      aedUses: 3,
      memoryUses: 0,
      pageRoute: '/components/column-selector',
      whatItDoes: 'Menú para mostrar u ocultar columnas en tablas que tienen muchas.',
      whereToSee:
        'AED → Administración → Agentes (o cualquier tabla con muchas columnas) → icono de engranaje/columnas arriba a la derecha de la tabla.',
    },
    {
      slug: 'command-palette',
      name: 'Command palette',
      type: 'pure-sc',
      parity: 'no-figma-equivalent',
      aedUses: 2,
      memoryUses: 0,
      pageRoute: '/components/command-palette',
      whatItDoes:
        'Buscador rápido global que se abre con ⌘K (Cmd+K en Mac, Ctrl+K en Windows) y permite saltar a cualquier sección.',
      whereToSee: 'AED → en cualquier pantalla pulsa Cmd+K (o Ctrl+K).',
    },
    {
      slug: 'keyboard-shortcuts',
      name: 'Keyboard shortcuts',
      type: 'pure-sc',
      parity: 'no-figma-equivalent',
      aedUses: 1,
      memoryUses: 0,
      pageRoute: '/components/keyboard-shortcuts',
      whatItDoes: 'Pantalla de ayuda que lista todos los atajos de teclado disponibles.',
      whereToSee:
        'AED → pulsa "?" en cualquier pantalla (o el icono de ayuda en la barra superior).',
    },
    {
      slug: 'delete-entity-dialog',
      name: 'Delete entity dialog',
      type: 'pure-sc',
      parity: 'no-figma-equivalent',
      aedUses: 8,
      memoryUses: 0,
      pageRoute: '/components/delete-entity-dialog',
      whatItDoes:
        'Ventana específica para confirmar que quieres borrar algo (más explícita que un "¿seguro?" normal).',
      whereToSee:
        'AED → Administración → Etiquetas → borra una etiqueta → diálogo que pide confirmación.',
    },
    {
      slug: 'impact-preview-dialog',
      name: 'Impact preview dialog',
      type: 'pure-sc',
      parity: 'no-figma-equivalent',
      aedUses: 2,
      memoryUses: 0,
      pageRoute: '/components/impact-preview-dialog',
      whatItDoes:
        'Ventana que aparece antes de un cambio importante avisando de a cuántas cosas va a afectar ("Esto afectará a X agentes…").',
      whereToSee:
        'AED → Administración → Grupos → borra o cambia un grupo con miembros → diálogo de impacto.',
    },
    {
      slug: 'page-header',
      name: 'Page header',
      type: 'pure-sc',
      parity: 'no-figma-equivalent',
      aedUses: 8,
      memoryUses: 4,
      pageRoute: '/components/page-header',
      whatItDoes:
        'Cabecera grande de página: título, descripción opcional y botones de acción a la derecha.',
      whereToSee:
        'AED → Administración → Agentes → la zona de arriba con el título "Agentes" y el botón "Crear agente".',
      whereToSeeMemory:
        'Memory → cabecera de /conversaciones, /conversaciones/reglas, /conversaciones/entidades y /conversaciones/categorías.',
    },
    {
      slug: 'sticky-form-header',
      name: 'Sticky form header',
      type: 'pure-sc',
      parity: 'no-figma-equivalent',
      aedUses: 6,
      memoryUses: 0,
      pageRoute: '/components/sticky-form-header',
      whatItDoes:
        'Cabecera del formulario que se queda pegada arriba cuando haces scroll, para que siempre veas el título y los botones Guardar/Cancelar.',
      whereToSee:
        'AED → Administración → Agentes → "Crear agente" → empieza a hacer scroll hacia abajo y verás que la cabecera se queda fija.',
    },
  ];

  /** Componentes marcados como "yo, Rafa, lo he validado en AED". Persistido en localStorage. */
  private readonly validated = signal<Set<string>>(readValidated());

  // ─── Filter state ────────────────────────────────────────────────────
  protected readonly searchQuery = signal('');
  protected readonly typeFilter = signal<ComponentType | 'all'>('all');
  protected readonly validationFilter = signal<'all' | 'validated' | 'pending'>('all');
  protected readonly usageFilter = signal<'all' | 'cross' | 'in-use' | 'unused'>('all');

  /** Ref al input de búsqueda para autofocus con "/" (shortcut tipo GitHub). */
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  /**
   * Lightbox preview state — null = closed, ítem = abierto con esa imagen.
   * Mantiene también `pageRoute` para el enlace "Ver gallery" interno del overlay,
   * por si tras ampliar el usuario quiere entrar al detalle del componente.
   */
  protected readonly lightboxItem = signal<{
    readonly slug: string;
    readonly name: string;
    readonly pageRoute: string;
  } | null>(null);
  protected readonly closeIcon = X;

  protected openLightbox(item: { slug: string; name: string; pageRoute: string }): void {
    this.lightboxItem.set({ slug: item.slug, name: item.name, pageRoute: item.pageRoute });
  }

  protected closeLightbox(): void {
    this.lightboxItem.set(null);
  }

  /** Click sobre el backdrop del <dialog>: cierra. Click sobre la card interior NO propaga. */
  protected onLightboxBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeLightbox();
    }
  }

  protected readonly tracked = computed(() =>
    this.catalog.map((entry) => ({
      ...entry,
      isValidated: this.validated().has(entry.slug),
      category: CATEGORY_BY_SLUG[entry.slug] ?? ('layout' as ComponentCategory),
    })),
  );

  protected readonly categoryMeta = CATEGORY_META;

  protected readonly validatedCount = computed(() => this.validated().size);

  /** Componentes con gallery interactiva publicada (los que tienen pageRoute). */
  protected readonly documentedComponents = computed(() =>
    this.tracked().filter((c) => !!c.pageRoute),
  );

  /**
   * Componentes documentados agrupados por categoría — la sección "Componentes
   * con documentación viva" del home rinde cada bucket con su título y un
   * grid propio. Reduce la sensación de "muro de cards" que el listado plano
   * de 17 cards generaba.
   */
  protected readonly documentedByCategory = computed(() => {
    const docs = this.documentedComponents();
    const meta = CATEGORY_META;
    return meta
      .map((cat) => ({
        meta: cat,
        items: docs.filter((c) => c.category === cat.id),
      }))
      .filter((g) => g.items.length > 0);
  });

  /**
   * Lista filtrada agrupada por categoría — usada por el tracker checklist
   * para que las piezas relacionadas aparezcan juntas en lugar de en una
   * lista plana de 33 entries.
   */
  protected readonly filteredByCategory = computed(() => {
    const list = this.filtered();
    return CATEGORY_META.map((cat) => ({
      meta: cat,
      items: list.filter((c) => c.category === cat.id),
    })).filter((g) => g.items.length > 0);
  });

  /**
   * Conteos por tipo (sobre TODO el catálogo, no sobre el resultado filtrado).
   * Sirve para que los chips muestren cuántos hay en total, independiente del
   * search activo — patrón típico de barras de filtro (GitHub Issues, Linear).
   */
  protected readonly typeCounts = computed(() => {
    const counts: Record<ComponentType | 'all', number> = {
      all: this.catalog.length,
      'full-primeng': 0,
      'custom-preset': 0,
      extended: 0,
      'pure-sc': 0,
    };
    for (const c of this.catalog) counts[c.type]++;
    return counts;
  });

  protected readonly pendingCount = computed(() => this.catalog.length - this.validated().size);

  /** Cuántos componentes están en uso real (AED + Memory sumados). */
  protected readonly inUseCount = computed(
    () => this.catalog.filter((c) => c.aedUses + c.memoryUses > 0).length,
  );
  protected readonly unusedCount = computed(
    () => this.catalog.filter((c) => c.aedUses + c.memoryUses === 0).length,
  );
  /**
   * Cross-consumers: componentes con `aedUses > 0` y `memoryUses > 0`.
   * Son los que validan el SCDS multi-app y los primeros candidatos a
   * cuidar (alta superficie de impacto si rompen).
   */
  protected readonly crossCount = computed(
    () => this.catalog.filter((c) => c.aedUses > 0 && c.memoryUses > 0).length,
  );

  /**
   * Spec docs publicados — count manual sincronizado con
   * `packages/design-system/docs/components/*.md`. Bumpear cuando se añada
   * un spec doc nuevo. Mantener hardcoded (vs dynamic import) para no
   * acoplar al filesystem desde el cliente.
   */
  protected readonly specDocsCount = 34;

  /** Componentes con gallery interactiva en este sitio (entries con pageRoute). */
  protected readonly galleriesCount = computed(
    () => this.catalog.filter((c) => !!c.pageRoute).length,
  );

  protected readonly sparklesIcon = Sparkles;

  /**
   * Lista filtrada por search + tipo + validación.
   * Search matchea name + whatItDoes + whereToSee (case-insensitive).
   */
  protected readonly filtered = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const type = this.typeFilter();
    const validation = this.validationFilter();
    const usage = this.usageFilter();
    return this.tracked().filter((item) => {
      if (type !== 'all' && item.type !== type) return false;
      if (validation === 'validated' && !item.isValidated) return false;
      if (validation === 'pending' && item.isValidated) return false;
      if (usage === 'cross' && !(item.aedUses > 0 && item.memoryUses > 0)) return false;
      if (usage === 'in-use' && item.aedUses + item.memoryUses === 0) return false;
      if (usage === 'unused' && item.aedUses + item.memoryUses > 0) return false;
      if (!q) return true;
      const haystack = `${item.name} ${item.whatItDoes} ${item.whereToSee}`.toLowerCase();
      return haystack.includes(q);
    });
  });

  protected toggleValidated(slug: string): void {
    this.validated.update((set) => {
      const next = new Set(set);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      writeValidated(next);
      return next;
    });
  }

  protected typeLabel(type: ComponentType): string {
    return {
      'full-primeng': 'Full PrimeNG',
      'custom-preset': 'Custom (preset)',
      extended: 'Extended',
      'pure-sc': 'Pure SC',
    }[type];
  }

  /**
   * Copy corto para el chip de paridad. El label debe ser legible paral equipo de diseño
   * (diseño), sin jargon técnico. La distinción es: ¿se parece el código a lo
   * que hay en Figma SC?
   */
  protected parityLabel(p: FigmaParity): string {
    return {
      'audited-full': '1:1 con Figma',
      'audited-partial': 'Auditoría parcial',
      'no-figma-equivalent': 'Sin Figma equivalente',
    }[p];
  }

  /** Marcador visual (● ◐ ○) que refuerza la semántica del color — a11y. */
  protected parityGlyph(p: FigmaParity): string {
    return {
      'audited-full': '●',
      'audited-partial': '◐',
      'no-figma-equivalent': '○',
    }[p];
  }

  protected setTypeFilter(type: ComponentType | 'all'): void {
    this.typeFilter.set(type);
  }

  protected setValidationFilter(v: 'all' | 'validated' | 'pending'): void {
    this.validationFilter.set(v);
  }

  protected setUsageFilter(v: 'all' | 'cross' | 'in-use' | 'unused'): void {
    this.usageFilter.set(v);
  }

  protected onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected clearSearch(): void {
    this.searchQuery.set('');
    this.searchInput()?.nativeElement.focus();
  }

  protected clearAllFilters(): void {
    this.searchQuery.set('');
    this.typeFilter.set('all');
    this.validationFilter.set('all');
    this.usageFilter.set('all');
  }

  /**
   * Shortcut "/" foca el search (mismo patrón que GitHub / Linear / Slack).
   * Ignorado cuando el usuario ya está tecleando en otro input o textarea.
   * Escape cierra el lightbox si está abierto (precedencia sobre el search).
   */
  @HostListener('document:keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.lightboxItem() !== null) {
      event.preventDefault();
      this.closeLightbox();
      return;
    }
    if (event.key !== '/') return;
    const target = event.target as HTMLElement | null;
    const tag = target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return;
    event.preventDefault();
    this.searchInput()?.nativeElement.focus();
  }
}
