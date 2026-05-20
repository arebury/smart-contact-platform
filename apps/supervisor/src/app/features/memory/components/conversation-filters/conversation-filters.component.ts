import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
  AlertCircle,
  AlignLeft,
  CircleHelp,
  CheckCheck,
  Download,
  LucideAngularModule,
  RotateCcw,
  Search,
} from 'lucide-angular';

import { DatepickerComponent } from '@shared/components/datepicker/datepicker.component';
import { InputTextComponent } from '@shared/components/inputtext/inputtext.component';
import { MultiSelectComponent } from '@shared/components/multiselect/multiselect.component';

import {
  AGENT_OPTIONS,
  GROUP_OPTIONS,
  SERVICE_OPTIONS,
} from '../../data/conversation-filter-options';
import {
  EMPTY_FILTERS,
  type MemoryConversationFilters,
} from '../../data/conversation-filters.types';
import { CategoryFilterButtonComponent } from '../category-filter-button/category-filter-button.component';
import { TypeFilterButtonComponent } from '../type-filter-button/type-filter-button.component';

/**
 * Top-bar de filtros para Memory ConversationsView.
 *
 * Iter 3 (S37): grid 6 columnas con pickers:
 *   - Servicios (sc-multiselect)
 *   - Fecha (sc-datepicker single)
 *   - Origen (sc-inputtext)
 *   - Destino (sc-inputtext)
 *   - Grupos ACD (sc-multiselect)
 *   - Agentes (sc-multiselect)
 *
 * + botón Reset (RotateCcw) que limpia todos los filtros.
 * + botón Search icon-only navy (placeholder, hoy es submit-on-change).
 *
 * Cambio respecto al prototipo React: el filtrado es **reactivo
 * sin botón** (mientras escribes/seleccionas, la tabla actualiza). El
 * botón Search del prototipo era cosmético — el onChange en cada picker
 * ya disparaba el filtrado. Mantenemos un botón visual por afinidad
 * Figma pero hoy no añade comportamiento (lo dejamos disabled).
 *
 * Estrena los wrappers `<sc-multiselect>` y `<sc-datepicker>` por
 * primer caso real en el monorepo (ambos 0 uses AED hasta hoy).
 */
@Component({
  selector: 'sc-memory-conversation-filters',
  imports: [
    FormsModule,
    TranslateModule,
    LucideAngularModule,
    MultiSelectComponent,
    DatepickerComponent,
    InputTextComponent,
    TypeFilterButtonComponent,
    CategoryFilterButtonComponent,
  ],
  templateUrl: './conversation-filters.component.html',
  styleUrl: './conversation-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationFiltersComponent {
  readonly filters = model.required<MemoryConversationFilters>();
  readonly availableAiCategories = input.required<readonly string[]>();
  /** Count de conversaciones con `hasFailedTranscription: true` en el set
   *  actual. Si es 0 el chip "Solo fallidas" se oculta automáticamente. */
  readonly failedCount = input<number>(0);
  /** S50 toolbar inline (legacy parity): conteos para los action icons. */
  readonly filteredCount = input<number>(0);
  readonly selectedCount = input<number>(0);
  /** Timestamp de la última búsqueda — null si no ha ocurrido. */
  readonly lastSearchAt = input<Date | null>(null);

  readonly bulkTranscribeRequested = output<void>();
  readonly downloadRequested = output<void>();
  readonly bulkMarkReadRequested = output<void>();
  readonly helpRequested = output<void>();

  protected readonly serviceOptions = SERVICE_OPTIONS;
  protected readonly groupOptions = GROUP_OPTIONS;
  protected readonly agentOptions = AGENT_OPTIONS;

  protected readonly searchIcon = Search;
  protected readonly resetIcon = RotateCcw;
  protected readonly alertIcon = AlertCircle;
  protected readonly transcribeIcon = AlignLeft;
  protected readonly downloadIcon = Download;
  protected readonly markReadIcon = CheckCheck;
  protected readonly helpIcon = CircleHelp;

  /** Badge del botón "Transcribir": número de seleccionadas. Disabled si 0.
   *  S52: las 3 acciones (Transcribir / Download / Marcar leídas) requieren
   *  selección explícita — el operador no descarga/procesa 75 filas
   *  accidentalmente con un click. */
  protected readonly transcribeBadge = computed(() => this.selectedCount());

  /** Las 3 acciones bulk están enabled SOLO cuando hay selección. */
  protected readonly bulkActionsEnabled = computed(() => this.selectedCount() > 0);

  /** Hora última búsqueda en formato `HH:mm - dd/mm/yyyy` ES. */
  protected readonly lastSearchLabel = computed(() => {
    const d = this.lastSearchAt();
    if (!d) return '';
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    return `${hh}:${mm} - ${dd}/${mo}/${d.getFullYear()}`;
  });

  protected setServices(services: readonly string[] | unknown[]): void {
    this.filters.update((f) => ({ ...f, services: (services ?? []) as readonly string[] }));
  }

  protected setGroups(groups: readonly string[] | unknown[]): void {
    this.filters.update((f) => ({ ...f, groups: (groups ?? []) as readonly string[] }));
  }

  protected setAgents(agents: readonly string[] | unknown[]): void {
    this.filters.update((f) => ({ ...f, agents: (agents ?? []) as readonly string[] }));
  }

  protected setDate(date: Date | null): void {
    this.filters.update((f) => ({ ...f, date }));
  }

  protected setOrigin(origin: string): void {
    this.filters.update((f) => ({ ...f, origin }));
  }

  protected setDestination(destination: string): void {
    this.filters.update((f) => ({ ...f, destination }));
  }

  protected onTypeFiltersChange(next: MemoryConversationFilters): void {
    this.filters.set(next);
  }

  protected onAiCategoriesChange(next: readonly string[]): void {
    this.filters.update((f) => ({ ...f, aiCategories: next }));
  }

  protected toggleOnlyFailed(): void {
    this.filters.update((f) => ({
      ...f,
      status: { ...f.status, onlyFailed: !f.status.onlyFailed },
    }));
  }

  protected onReset(): void {
    this.filters.set(EMPTY_FILTERS);
  }
}
