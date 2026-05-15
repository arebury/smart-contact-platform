import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

type ComponentType = 'full-primeng' | 'custom-preset' | 'extended' | 'pure-sc';
type ComponentStatus = 'ready' | 'in-progress' | 'pending';

interface ComponentEntry {
  slug: string;
  name: string;
  type: ComponentType;
  status: ComponentStatus;
  pageRoute?: string;
  /** Qué hace el componente en lenguaje no técnico. */
  whatItDoes: string;
  /**
   * Dónde verlo en AED o ds-docs para identificarlo visualmente.
   * Si está vacío: el componente está hecho pero no usado todavía.
   */
  whereToSee: string;
  figmaParity?: number;
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
  imports: [RouterLink],
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
      status: 'ready',
      pageRoute: '/components/button',
      whatItDoes: 'Botón de acción (primario azul, secundario gris, peligro rojo, etc.).',
      whereToSee: 'En cualquier pantalla. Ej: AED → Administración → Agentes → botón "Crear agente" arriba a la derecha.',
      figmaParity: 100,
    },
    {
      slug: 'input',
      name: 'Input',
      type: 'extended',
      status: 'ready',
      pageRoute: '/components/input',
      whatItDoes: 'Campo de texto para formularios: nombre, email, contraseña, teléfono… Incluye label, texto de ayuda y mensaje de error.',
      whereToSee: 'AED → Administración → Agentes → "Crear agente" → cualquier campo de la ficha.',
      figmaParity: 100,
    },
    {
      slug: 'input-number',
      name: 'Input number',
      type: 'extended',
      status: 'ready',
      pageRoute: '/components/input-number',
      whatItDoes: 'Campo numérico para formularios: capacidades, contadores, segundos, porcentajes. Mismo aspecto que el campo de texto pero con la unidad ("s", "%", "agentes") a la derecha y el número alineado a la derecha también.',
      whereToSee: 'AED → Configuración → AED → Servicio → "Pausa standard" (segundos). También en "Crear grupo" → capacidad.',
    },
    {
      slug: 'select',
      name: 'Select / dropdown',
      type: 'extended',
      status: 'ready',
      pageRoute: '/components/select',
      whatItDoes: 'Desplegable para elegir UNA opción entre varias. Reemplaza los menús nativos del navegador para que se vean igual en Chrome, Safari y Firefox y combinen con el resto de campos.',
      whereToSee: 'AED → Administración → Agentes → "Crear agente" → cualquier desplegable (grupo, idioma, canal). También en Configuración → AED.',
      figmaParity: 100,
    },
    {
      slug: 'datepicker',
      name: 'Datepicker',
      type: 'extended',
      status: 'ready',
      pageRoute: '/components/datepicker',
      whatItDoes: 'Selector de fecha. Abre un calendario al hacer click. Soporta selección día/mes/año, rangos min-max ("solo próximos 30 días"), y modo inline (calendario siempre visible).',
      whereToSee: 'Aún no hay datepickers visibles en AED — primer caso planeado es "fecha de alta del agente". Demo en ds-docs hasta entonces.',
      figmaParity: 100,
    },
    {
      slug: 'tabs',
      name: 'Tabs',
      type: 'custom-preset',
      status: 'ready',
      pageRoute: '/components/tabs',
      whatItDoes: 'Navegación por pestañas dentro de UNA pantalla. Por ejemplo: "Activos / Archivados / Todos" en una lista, o secciones de un formulario largo. El tab activo se marca con un underline en color de marca.',
      whereToSee: 'Aún no hay tabs nativos en AED — primer caso planeado es la pantalla de configuración avanzada. Demo en ds-docs hasta entonces.',
      figmaParity: 100,
    },
    {
      slug: 'tooltip',
      name: 'Tooltip',
      type: 'full-primeng',
      status: 'ready',
      pageRoute: '/components/tooltip',
      whatItDoes: 'Cajita oscura con texto que aparece al pasar el ratón por encima de un botón o icono. Sirve para explicar botones que solo tienen icono (sin texto) o para añadir contexto a un campo.',
      whereToSee: 'AED tiene tooltips en los botones icon-only de las tablas (ej: el botón "borrar" papelera). En ds-docs tienes ejemplos interactivos.',
      figmaParity: 100,
    },
    {
      slug: 'modal',
      name: 'Modal',
      type: 'extended',
      status: 'ready',
      whatItDoes: 'Ventana emergente con título y botones que aparece centrada sobre la pantalla.',
      whereToSee: 'AED → Administración → Etiquetas → click en una etiqueta para editarla (se abre encima).',
    },
    {
      slug: 'toast',
      name: 'Toast',
      type: 'extended',
      status: 'ready',
      whatItDoes: 'Notificación pequeña que aparece y desaparece sola en una esquina (típicamente arriba o abajo a la derecha).',
      whereToSee: 'AED → guarda cualquier cambio (ej: edita una etiqueta y dale a "Guardar") → ves el "Guardado correctamente".',
    },
    {
      slug: 'photo-upload',
      name: 'Photo upload',
      type: 'pure-sc',
      status: 'ready',
      whatItDoes: 'Sube una foto arrastrándola o haciendo click; permite recortarla y previsualizarla.',
      whereToSee: 'AED → Administración → Agentes → "Crear agente" → bloque "Foto del agente".',
    },
    {
      slug: 'toggle-switch',
      name: 'Toggle switch',
      type: 'pure-sc',
      status: 'ready',
      whatItDoes: 'Interruptor on/off estilo iOS (la bolita que se desliza de izquierda a derecha).',
      whereToSee: 'AED → Configuración → AED → Servicio → opciones tipo "Activo / Inactivo".',
    },
    {
      slug: 'tri-state-checkbox',
      name: 'Tri-state checkbox',
      type: 'pure-sc',
      status: 'ready',
      whatItDoes: 'Checkbox con 3 estados: vacío, marcado a medias (cuando hay selección parcial) y marcado del todo.',
      whereToSee: 'AED → Administración → Etiquetas → checkbox de cabecera de la tabla (cuando marcas algunas filas pero no todas se pone a medias).',
    },
    {
      slug: 'illustrated-avatar',
      name: 'Illustrated avatar',
      type: 'pure-sc',
      status: 'ready',
      whatItDoes: 'Avatar dibujado que se asigna automáticamente a usuarios o agentes que no tienen foto subida.',
      whereToSee: 'AED → Administración → Agentes → en la tabla, los agentes sin foto muestran un avatar ilustrado.',
    },
    {
      slug: 'section-card',
      name: 'Section card',
      type: 'pure-sc',
      status: 'ready',
      whatItDoes: 'Tarjeta blanca con título que agrupa campos relacionados dentro de un formulario largo.',
      whereToSee: 'AED → Administración → Agentes → "Crear agente" → cada bloque blanco con título ("Datos personales", "Configuración", etc.) es una section-card.',
    },
    {
      slug: 'bulk-action-bar',
      name: 'Bulk action bar',
      type: 'pure-sc',
      status: 'ready',
      whatItDoes: 'Barra que aparece flotando abajo cuando seleccionas varios elementos de una tabla, con acciones masivas (borrar varios, editar varios…).',
      whereToSee: 'AED → Administración → Etiquetas → marca 2 o más etiquetas con los checkboxes → aparece la barra flotante abajo.',
    },
    {
      slug: 'bulk-edit-menu',
      name: 'Bulk edit menu',
      type: 'pure-sc',
      status: 'ready',
      whatItDoes: 'Menú desplegable de "edición masiva" que sale de la barra anterior para cambiar un campo a varios elementos a la vez.',
      whereToSee: 'AED → Administración → Etiquetas → marca varias → en la barra de abajo dale a "Editar" → sale este menú.',
    },
    {
      slug: 'empty-state',
      name: 'Empty state',
      type: 'pure-sc',
      status: 'ready',
      whatItDoes: 'Mensaje grande con ilustración que aparece cuando una lista o pantalla está vacía ("No hay nada todavía").',
      whereToSee: 'AED → cualquier sección vacía (ej: una pantalla recién creada sin datos aún).',
    },
    {
      slug: 'form-danger-zone',
      name: 'Form danger zone',
      type: 'pure-sc',
      status: 'ready',
      whatItDoes: 'Bloque rojo al final de los formularios de edición con acciones destructivas (borrar la entidad entera).',
      whereToSee: 'AED → edita un agente o etiqueta ya existente → baja al final del formulario.',
    },
    {
      slug: 'form-section-nav',
      name: 'Form section nav',
      type: 'pure-sc',
      status: 'ready',
      whatItDoes: 'Navegación lateral del formulario: muestra las secciones y resalta en cuál estás según vas haciendo scroll.',
      whereToSee: 'AED → Administración → Agentes → "Crear agente" → barra lateral izquierda con el índice de secciones.',
    },
    {
      slug: 'confirm-host',
      name: 'Confirm host',
      type: 'pure-sc',
      status: 'ready',
      whatItDoes: 'Pop-up de "¿Estás seguro?" que aparece antes de acciones importantes (borrar, archivar…).',
      whereToSee: 'AED → intenta borrar cualquier cosa → sale el "¿Estás seguro?".',
    },
    {
      slug: 'label-chip',
      name: 'Label chip',
      type: 'pure-sc',
      status: 'ready',
      whatItDoes: 'Etiqueta de color con texto (las pastillitas redondeadas con el color de la categoría).',
      whereToSee: 'AED → Administración → Etiquetas → cada etiqueta de la tabla se muestra como un chip.',
    },
    {
      slug: 'color-dot-picker',
      name: 'Color dot picker',
      type: 'pure-sc',
      status: 'ready',
      whatItDoes: 'Selector de color: muestra varios círculos de colores y eliges uno haciendo click.',
      whereToSee: 'AED → Administración → Etiquetas → crear o editar etiqueta → fila de círculos de colores.',
    },
    {
      slug: 'inline-rename-cell',
      name: 'Inline rename cell',
      type: 'pure-sc',
      status: 'ready',
      whatItDoes: 'Editar el nombre de algo directamente en la tabla, sin abrir formulario (típicamente con doble-click).',
      whereToSee: 'AED → Administración → Etiquetas → doble-click sobre el nombre de una etiqueta → se vuelve editable in-situ.',
    },
    {
      slug: 'group-popover',
      name: 'Group popover',
      type: 'pure-sc',
      status: 'ready',
      whatItDoes: 'Tarjeta flotante que aparece al pasar el ratón sobre un grupo, mostrando sus miembros y acciones rápidas.',
      whereToSee: 'AED → Administración → Grupos → pasa el ratón sobre la fila de un grupo.',
    },
    {
      slug: 'column-selector',
      name: 'Column selector',
      type: 'pure-sc',
      status: 'ready',
      whatItDoes: 'Menú para mostrar u ocultar columnas en tablas que tienen muchas.',
      whereToSee: 'AED → Administración → Agentes (o cualquier tabla con muchas columnas) → icono de engranaje/columnas arriba a la derecha de la tabla.',
    },
    {
      slug: 'command-palette',
      name: 'Command palette',
      type: 'pure-sc',
      status: 'ready',
      whatItDoes: 'Buscador rápido global que se abre con ⌘K (Cmd+K en Mac, Ctrl+K en Windows) y permite saltar a cualquier sección.',
      whereToSee: 'AED → en cualquier pantalla pulsa Cmd+K (o Ctrl+K).',
    },
    {
      slug: 'keyboard-shortcuts',
      name: 'Keyboard shortcuts',
      type: 'pure-sc',
      status: 'ready',
      whatItDoes: 'Pantalla de ayuda que lista todos los atajos de teclado disponibles.',
      whereToSee: 'AED → pulsa "?" en cualquier pantalla (o el icono de ayuda en la barra superior).',
    },
    {
      slug: 'delete-entity-dialog',
      name: 'Delete entity dialog',
      type: 'pure-sc',
      status: 'ready',
      whatItDoes: 'Ventana específica para confirmar que quieres borrar algo (más explícita que un "¿seguro?" normal).',
      whereToSee: 'AED → Administración → Etiquetas → borra una etiqueta → diálogo que pide confirmación.',
    },
    {
      slug: 'impact-preview-dialog',
      name: 'Impact preview dialog',
      type: 'pure-sc',
      status: 'ready',
      whatItDoes: 'Ventana que aparece antes de un cambio importante avisando de a cuántas cosas va a afectar ("Esto afectará a X agentes…").',
      whereToSee: 'AED → Administración → Grupos → borra o cambia un grupo con miembros → diálogo de impacto.',
    },
    {
      slug: 'page-header',
      name: 'Page header',
      type: 'pure-sc',
      status: 'ready',
      whatItDoes: 'Cabecera grande de página: título, descripción opcional y botones de acción a la derecha.',
      whereToSee: 'AED → Administración → Agentes → la zona de arriba con el título "Agentes" y el botón "Crear agente".',
    },
    {
      slug: 'sticky-form-header',
      name: 'Sticky form header',
      type: 'pure-sc',
      status: 'ready',
      whatItDoes: 'Cabecera del formulario que se queda pegada arriba cuando haces scroll, para que siempre veas el título y los botones Guardar/Cancelar.',
      whereToSee: 'AED → Administración → Agentes → "Crear agente" → empieza a hacer scroll hacia abajo y verás que la cabecera se queda fija.',
    },
    {
      slug: 'input-number',
      name: 'Input number',
      type: 'extended',
      status: 'pending',
      whatItDoes: 'Campo para introducir números, con flechitas arriba/abajo para sumar/restar de uno en uno.',
      whereToSee: 'Todavía no migrado. En AED se ven varios — por ejemplo "Duración máxima" en horarios o ajustes numéricos.',
    },
    {
      slug: 'dropdown',
      name: 'Dropdown / select',
      type: 'extended',
      status: 'pending',
      whatItDoes: 'Lista desplegable para elegir UNA opción de varias.',
      whereToSee: 'Todavía no migrado. En AED se ven varios — por ejemplo el selector de "Tipo" o "Rol" en formularios.',
    },
    {
      slug: 'datepicker',
      name: 'Datepicker',
      type: 'custom-preset',
      status: 'pending',
      whatItDoes: 'Selector de fecha con calendario emergente.',
      whereToSee: 'Todavía no migrado. En AED aparece al editar horarios o filtros de fecha.',
    },
    {
      slug: 'tabs',
      name: 'Tabs',
      type: 'custom-preset',
      status: 'pending',
      whatItDoes: 'Pestañas para cambiar entre vistas dentro de una misma página, sin recargar.',
      whereToSee: 'Todavía no migrado. En AED aparece en formularios complejos (ej: Configuración).',
    },
    {
      slug: 'tooltip',
      name: 'Tooltip',
      type: 'full-primeng',
      status: 'pending',
      whatItDoes: 'Mini-cartelito que aparece al pasar el ratón sobre un icono o botón para explicar qué hace.',
      whereToSee: 'Todavía no migrado. En AED aparece en iconos de la barra superior y abreviaciones de columnas.',
    },
  ];

  /** Componentes marcados como "yo, Rafa, lo he validado en AED". Persistido en localStorage. */
  private readonly validated = signal<Set<string>>(readValidated());

  protected readonly tracked = computed(() =>
    this.catalog.map((entry) => ({
      ...entry,
      isValidated: this.validated().has(entry.slug),
    })),
  );

  protected readonly validatedCount = computed(() => this.validated().size);

  protected readonly readyComponents = computed(() =>
    this.catalog.filter((c) => c.status === 'ready'),
  );

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
      'extended': 'Extended',
      'pure-sc': 'Pure SC',
    }[type];
  }
}
