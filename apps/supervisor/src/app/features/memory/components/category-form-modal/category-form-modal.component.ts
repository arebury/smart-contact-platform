import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  ExternalLink,
  LayoutTemplate,
  LucideAngularModule,
  Tags,
  Wrench,
} from 'lucide-angular';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

import { InputTextComponent } from '@shared/components/inputtext/inputtext.component';
import { DialogComponent } from '@shared/components/dialog/dialog.component';

import type { Category } from '../../data/category.types';
import type { Rule } from '../../data/rule.types';
import { CategoriesStore } from '../../state/categories.store';
import { RulesStore } from '../../state/rules.store';

/**
 * CategoryFormModal · Crear + Editar categorías IA · iter 11b + 11c.
 *
 * Unifica `CreateCategoryPanel` + `EditCategoryPanel` del prototipo
 * React en modal SCDS.
 *
 * Features:
 *  - **Templates predefinidos** (S39, iter 11c): 4 plantillas (Queja,
 *    Intención de baja, Competencia, Incidencia) seleccionables vía
 *    dialog secundario que prellena name + description. Réplica del
 *    React `CreateCategoryPanel.templates` + `TEMPLATE_DATA`.
 *
 * Simplificaciones pragmáticas (anotadas §10 si surge trigger):
 *  - Sección "Reglas que la usan" **read-only**: lista con enlaces a
 *    editar reglas. CategoryRuleLinking interactivo (que permite
 *    linkar/unlinkar desde la categoría) → iter 11d.
 *
 * Campos:
 *  - Name (required, min 3 chars, unique).
 *  - Description (required, min 10 chars).
 *  - Group (opcional, free text — ej. "Atención al Cliente", "Ventas").
 *  - isActive toggle.
 */

/** ID de las 4 plantillas predefinidas. Mapean al `TEMPLATE_DATA` del
 *  prototipo React `CreateCategoryPanel.tsx` línea 46-63. */
type CategoryTemplateId = 'complaint' | 'churn' | 'competitor' | 'incident';

interface CategoryTemplate {
  readonly id: CategoryTemplateId;
  readonly icon: typeof AlertCircle;
  readonly title: string;
  /** Hint corto en la card del dialog. */
  readonly hint: string;
  /** Lo que se prellena en el campo `name` al seleccionar. */
  readonly name: string;
  /** Lo que se prellena en el campo `description` al seleccionar. */
  readonly description: string;
}

const CATEGORY_TEMPLATES: readonly CategoryTemplate[] = [
  {
    id: 'complaint',
    icon: AlertCircle,
    title: 'Queja',
    hint: 'Cliente expresa insatisfacción',
    name: 'Queja',
    description:
      'Llamadas donde los clientes expresan insatisfacción, frustración o presentan quejas sobre el servicio, productos o experiencias vividas. Incluye reclamaciones formales y expresiones de descontento.',
  },
  {
    id: 'churn',
    icon: AlertTriangle,
    title: 'Intención de baja',
    hint: 'Cliente quiere cancelar servicio',
    name: 'Intención de baja',
    description:
      'Llamadas donde el cliente manifiesta su deseo de cancelar el servicio, darse de baja o terminar la relación comercial. Incluye amenazas de baja y solicitudes formales de cancelación.',
  },
  {
    id: 'competitor',
    icon: Building2,
    title: 'Competencia',
    hint: 'Menciona otras empresas',
    name: 'Competencia',
    description:
      'Llamadas donde se mencionan empresas competidoras, comparaciones de precios o servicios, ofertas de la competencia o intención de cambiar de proveedor por una alternativa del mercado.',
  },
  {
    id: 'incident',
    icon: Wrench,
    title: 'Incidencia',
    hint: 'Reporta problemas técnicos',
    name: 'Incidencia',
    description:
      'Llamadas reportando problemas técnicos, fallos en el servicio, averías, errores en sistemas o cualquier situación que requiera intervención técnica o resolución de incidentes.',
  },
];
@Component({
  selector: 'sc-memory-category-form-modal',
  imports: [
    ButtonModule,
    FormsModule,
    InputTextComponent,
    LucideAngularModule,
    DialogComponent,
    RouterLink,
    ToggleSwitchModule,
    TranslateModule,
  ],
  templateUrl: './category-form-modal.component.html',
  styleUrl: './category-form-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryFormModalComponent {
  private readonly categoriesStore = inject(CategoriesStore);
  private readonly rulesStore = inject(RulesStore);

  // input con default false: el effect del constructor lee `this.visible()`
  // antes del primer binding y `input.required` cascaría con NG0950
  // (mismo bug que arregló 7525864 en BulkTranscriptionModal).
  readonly visible = input<boolean>(false);
  readonly category = input<Category | null>(null);

  readonly closed = output<void>();
  readonly saved = output<Category>();

  protected readonly tagsIcon = Tags;
  protected readonly externalIcon = ExternalLink;
  protected readonly layoutTemplateIcon = LayoutTemplate;

  protected readonly name = signal('');
  protected readonly description = signal('');
  protected readonly group = signal('');
  protected readonly isActive = signal(true);

  protected readonly isEditMode = computed(() => this.category() !== null);

  /** Estado del dialog secundario "Plantillas predefinidas". Solo visible
   *  en modo Create — al editar una categoría existente no tiene sentido
   *  sobrescribir sus campos con un template. */
  protected readonly templatesDialogVisible = signal(false);
  protected readonly templates: readonly CategoryTemplate[] = CATEGORY_TEMPLATES;

  protected readonly nameError = computed<string | null>(() => {
    const trimmed = this.name().trim();
    if (trimmed.length === 0) return null; // No mostrar error inicial
    if (trimmed.length < 3) return 'memory.categories.form.name_error_short';
    if (this.categoriesStore.isNameTaken(trimmed, this.category()?.id)) {
      return 'memory.categories.form.name_error_duplicate';
    }
    return null;
  });

  protected readonly canSave = computed(() => {
    const trimmedName = this.name().trim();
    const trimmedDesc = this.description().trim();
    return (
      trimmedName.length >= 3 &&
      !this.categoriesStore.isNameTaken(trimmedName, this.category()?.id) &&
      trimmedDesc.length >= 10
    );
  });

  /**
   * Reglas que referencian esta categoría — read-only en iter 11b.
   * Iter 9c builders aún NO permiten seleccionar categorías al crear/
   * editar regla (la spec lo incluye en Análisis IA pero el builder
   * Angular no expone aún). Por ahora retorna lista vacía en edit y
   * NO se renderiza la sección hasta que iter futura conecte la
   * relación bidireccional via `categorias[]` en Rule.
   */
  protected readonly linkedRules = computed<readonly Rule[]>(() => {
    // Placeholder: cuando RuleBuilder añada selector de categorías,
    // filtrar `rules().filter(r => r.categorias?.includes(this.category()?.id))`.
    void this.rulesStore; // referencia para tree-shaking awareness
    return [];
  });

  constructor() {
    effect(() => {
      if (!this.visible()) return;
      const c = this.category();
      if (c) {
        this.name.set(c.name);
        this.description.set(c.description);
        this.group.set(c.group ?? '');
        this.isActive.set(c.isActive);
      } else {
        this.name.set('');
        this.description.set('');
        this.group.set('');
        this.isActive.set(true);
      }
    });
  }

  protected setName(v: string): void {
    this.name.set(v);
  }

  protected setDescription(v: string): void {
    this.description.set(v);
  }

  protected setGroup(v: string): void {
    this.group.set(v);
  }

  protected onCancel(): void {
    this.closed.emit();
  }

  protected openTemplatesDialog(): void {
    this.templatesDialogVisible.set(true);
  }

  protected closeTemplatesDialog(): void {
    this.templatesDialogVisible.set(false);
  }

  protected selectTemplate(t: CategoryTemplate): void {
    this.name.set(t.name);
    this.description.set(t.description);
    this.templatesDialogVisible.set(false);
  }

  protected onSave(): void {
    if (!this.canSave()) return;
    const base = {
      name: this.name().trim(),
      description: this.description().trim(),
      group: this.group().trim() || undefined,
      isActive: this.isActive(),
    };

    const editing = this.category();
    if (editing) {
      this.categoriesStore.updateCategory(editing.id, base);
      const updated = this.categoriesStore.getCategory(editing.id)!;
      this.saved.emit(updated);
    } else {
      const created = this.categoriesStore.addCategory(base);
      this.saved.emit(created);
    }
  }
}
