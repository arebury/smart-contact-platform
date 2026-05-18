import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  LucideAngularModule,
  MoreVertical,
  Plus,
  Tags,
} from 'lucide-angular';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import type { MenuItem } from 'primeng/api';

import { ConfirmHostService } from '@core/services/confirm-host.service';
import { PageHeaderComponent } from '@shared/components';

import type { Category } from '../../data/category.types';
import { CategoriesStore } from '../../state/categories.store';

/**
 * Listado de Categorías IA · iter 11a.
 *
 * Categorías = temas/motivos de contacto que la IA etiqueta sobre las
 * conversaciones (ej. "queja facturación"). Tabla con 5 cols: Nombre ·
 * Descripción · Usada en · Llamadas · Estado · Kebab.
 *
 * Iter 11b: Create/Edit panel + CategoryRuleLinking (relación
 * bidireccional con reglas).
 */
@Component({
  selector: 'sc-memory-categories-page',
  imports: [
    ButtonModule,
    LucideAngularModule,
    MenuModule,
    PageHeaderComponent,
    TranslateModule,
  ],
  templateUrl: './categories-page.component.html',
  styleUrl: './categories-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesPageComponent {
  private readonly categoriesStore = inject(CategoriesStore);
  private readonly confirm = inject(ConfirmHostService);
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);

  protected readonly categories = this.categoriesStore.categories;
  protected readonly isEmpty = this.categoriesStore.isEmpty;

  protected readonly tagsIcon = Tags;
  protected readonly plusIcon = Plus;
  protected readonly kebabIcon = MoreVertical;

  protected buildMenuItems(cat: Category): MenuItem[] {
    return [
      {
        label: this.translate.instant('memory.categories.menu.edit'),
        icon: 'pi pi-pencil',
        disabled: true, // iter 11b
      },
      {
        label: this.translate.instant('memory.categories.menu.duplicate'),
        icon: 'pi pi-copy',
        command: () => this.duplicateCategory(cat),
      },
      {
        separator: true,
      },
      {
        label: this.translate.instant('memory.categories.menu.delete'),
        icon: 'pi pi-trash',
        styleClass: 'rules-menu-item--danger',
        command: () => this.confirmDelete(cat),
      },
    ];
  }

  protected onNewCategory(): void {
    this.messages.add({
      severity: 'info',
      summary: this.translate.instant('memory.categories.coming_soon_toast'),
      life: 2200,
    });
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  private duplicateCategory(cat: Category): void {
    const copy = this.categoriesStore.duplicateCategory(cat.id);
    if (!copy) return;
    this.messages.add({
      severity: 'success',
      summary: this.translate.instant('memory.categories.duplicated_toast', { name: copy.name }),
      life: 2200,
    });
  }

  private async confirmDelete(cat: Category): Promise<void> {
    const accepted = await this.confirm.request({
      title: this.translate.instant('memory.categories.delete_title'),
      body: this.translate.instant('memory.categories.delete_body', { name: cat.name }),
      acceptLabel: this.translate.instant('common.delete'),
      rejectLabel: this.translate.instant('common.cancel'),
      acceptTone: 'danger',
    });
    if (!accepted) return;
    this.categoriesStore.deleteCategory(cat.id);
    this.messages.add({
      severity: 'success',
      summary: this.translate.instant('memory.categories.deleted_toast', { name: cat.name }),
      life: 2200,
    });
  }
}
