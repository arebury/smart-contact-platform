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
  summary: string;
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
      summary: 'PrimeNG <p-button> con paleta brand vía sc-preset.',
      figmaParity: 100,
    },
    {
      slug: 'input',
      name: 'Input',
      type: 'extended',
      status: 'ready',
      pageRoute: '/components/input',
      summary: 'Text input — wrapper sobre pInputText con label, helper, error e iconos.',
      figmaParity: 80,
    },
    { slug: 'modal', name: 'Modal', type: 'extended', status: 'ready', summary: 'Wrapper sobre p-dialog con shell SC.' },
    { slug: 'toast', name: 'Toast', type: 'extended', status: 'ready', summary: 'Wrapper sobre p-toast con shell SC.' },
    { slug: 'photo-upload', name: 'Photo upload', type: 'pure-sc', status: 'ready', summary: 'Custom — drag-drop + crop + thumbnail.' },
    { slug: 'toggle-switch', name: 'Toggle switch', type: 'pure-sc', status: 'ready', summary: 'Custom — checkbox visual estilo iOS.' },
    { slug: 'tri-state-checkbox', name: 'Tri-state checkbox', type: 'pure-sc', status: 'ready', summary: 'Custom — unchecked / indeterminate / checked.' },
    { slug: 'illustrated-avatar', name: 'Illustrated avatar', type: 'pure-sc', status: 'ready', summary: 'Custom — pool de avatares ilustrados hashed.' },
    { slug: 'section-card', name: 'Section card', type: 'pure-sc', status: 'ready', summary: 'Custom — anchor para form-section-nav scroll-spy.' },
    { slug: 'bulk-action-bar', name: 'Bulk action bar', type: 'pure-sc', status: 'ready', summary: 'Custom — overlay sin layout shift.' },
    { slug: 'bulk-edit-menu', name: 'Bulk edit menu', type: 'pure-sc', status: 'ready', summary: 'Custom — combinable con bulk-action-bar.' },
    { slug: 'empty-state', name: 'Empty state', type: 'pure-sc', status: 'ready', summary: 'Custom — CTA opcional via slot.' },
    { slug: 'form-danger-zone', name: 'Form danger zone', type: 'pure-sc', status: 'ready', summary: 'Custom — sección roja para acciones destructivas.' },
    { slug: 'form-section-nav', name: 'Form section nav', type: 'pure-sc', status: 'ready', summary: 'Custom — scroll-spy a section cards.' },
    { slug: 'confirm-host', name: 'Confirm host', type: 'pure-sc', status: 'ready', summary: 'Custom — host de confirmaciones global.' },
    { slug: 'label-chip', name: 'Label chip', type: 'pure-sc', status: 'ready', summary: 'Custom — chip con paleta --sc-label-*.' },
    { slug: 'color-dot-picker', name: 'Color dot picker', type: 'pure-sc', status: 'ready', summary: 'Custom — selección de color para label.' },
    { slug: 'inline-rename-cell', name: 'Inline rename cell', type: 'pure-sc', status: 'ready', summary: 'Custom — in-place edit de cell de tabla.' },
    { slug: 'group-popover', name: 'Group popover', type: 'pure-sc', status: 'ready', summary: 'Custom — popover con miembros + acciones.' },
    { slug: 'column-selector', name: 'Column selector', type: 'pure-sc', status: 'ready', summary: 'Custom — show/hide cols de tabla.' },
    { slug: 'command-palette', name: 'Command palette', type: 'pure-sc', status: 'ready', summary: 'Custom — ⌘K trigger global.' },
    { slug: 'keyboard-shortcuts', name: 'Keyboard shortcuts', type: 'pure-sc', status: 'ready', summary: 'Custom — help overlay con bindings.' },
    { slug: 'delete-entity-dialog', name: 'Delete entity dialog', type: 'pure-sc', status: 'ready', summary: 'Custom — confirm para borrar entidad.' },
    { slug: 'impact-preview-dialog', name: 'Impact preview dialog', type: 'pure-sc', status: 'ready', summary: 'Custom — impacto antes de mutación.' },
    { slug: 'page-header', name: 'Page header', type: 'pure-sc', status: 'ready', summary: 'Custom — headers de list page + form page.' },
    { slug: 'sticky-form-header', name: 'Sticky form header', type: 'pure-sc', status: 'ready', summary: 'Custom — sticky on scroll.' },
    { slug: 'input-number', name: 'Input number', type: 'extended', status: 'pending', summary: 'TBD — p-inputNumber wrap. AED tiene 7 candidatos.' },
    { slug: 'dropdown', name: 'Dropdown / select', type: 'extended', status: 'pending', summary: 'TBD — p-select wrap. AED tiene <select> nativos pendientes de migrar.' },
    { slug: 'datepicker', name: 'Datepicker', type: 'custom-preset', status: 'pending', summary: 'TBD — p-datepicker passthrough.' },
    { slug: 'tabs', name: 'Tabs', type: 'custom-preset', status: 'pending', summary: 'TBD — p-tabs passthrough.' },
    { slug: 'tooltip', name: 'Tooltip', type: 'full-primeng', status: 'pending', summary: 'TBD — [pTooltip] directive.' },
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
