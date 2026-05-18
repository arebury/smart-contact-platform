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
import { ExternalLink, LucideAngularModule, Tags } from 'lucide-angular';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

import { InputComponent } from '@shared/components/input/input.component';
import { ModalComponent } from '@shared/components/modal/modal.component';

import type { Category } from '../../data/category.types';
import type { Rule } from '../../data/rule.types';
import { CategoriesStore } from '../../state/categories.store';
import { RulesStore } from '../../state/rules.store';

/**
 * CategoryFormModal · Crear + Editar categorías IA · iter 11b.
 *
 * Unifica `CreateCategoryPanel` (488 líneas) + `EditCategoryPanel`
 * (581 líneas) del prototipo React en modal SCDS.
 *
 * Simplificaciones pragmáticas (anotadas §10 si surge trigger):
 *  - SIN templates predefinidos (Create Panel del React tiene 6 plantillas).
 *  - Sección "Reglas que la usan" **read-only**: lista con enlaces a
 *    editar reglas. CategoryRuleLinking interactivo (que permite
 *    linkar/unlinkar desde la categoría) → iter 11c.
 *
 * Campos:
 *  - Name (required, min 3 chars, unique).
 *  - Description (required, min 10 chars).
 *  - Group (opcional, free text — ej. "Atención al Cliente", "Ventas").
 *  - isActive toggle.
 */
@Component({
  selector: 'sc-memory-category-form-modal',
  imports: [
    ButtonModule,
    FormsModule,
    InputComponent,
    LucideAngularModule,
    ModalComponent,
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

  readonly visible = input.required<boolean>();
  readonly category = input<Category | null>(null);

  readonly closed = output<void>();
  readonly saved = output<Category>();

  protected readonly tagsIcon = Tags;
  protected readonly externalIcon = ExternalLink;

  protected readonly name = signal('');
  protected readonly description = signal('');
  protected readonly group = signal('');
  protected readonly isActive = signal(true);

  protected readonly isEditMode = computed(() => this.category() !== null);

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
