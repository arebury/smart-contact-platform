import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Database, LucideAngularModule, Lock, MoreVertical, Plus } from 'lucide-angular';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import type { MenuItem } from 'primeng/api';

import { ConfirmHostService } from '@core/services/confirm-host.service';
import { PageHeaderComponent } from '@shared/components';

import { EntityFormModalComponent } from '../../components/entity-form-modal/entity-form-modal.component';
import type { Entity } from '../../data/entity.types';
import { EntitiesStore } from '../../state/entities.store';

/**
 * Listado de entidades Memory · iter 10a.
 *
 * 2 secciones: User entities (editables) + System entities (inmutables,
 * lock icon). Tabla 5 cols: Nombre · Tipo · Descripción · Formato · Kebab.
 *
 * Iter 10b añade Create + Edit (modal + sidepanel).
 */
@Component({
  selector: 'sc-memory-entities-page',
  imports: [
    ButtonModule,
    EntityFormModalComponent,
    LucideAngularModule,
    MenuModule,
    PageHeaderComponent,
    TranslateModule,
  ],
  templateUrl: './entities-page.component.html',
  styleUrl: './entities-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntitiesPageComponent {
  private readonly entitiesStore = inject(EntitiesStore);
  private readonly confirm = inject(ConfirmHostService);
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);

  protected readonly userEntities = this.entitiesStore.userEntities;
  protected readonly systemEntities = this.entitiesStore.systemEntities;
  protected readonly hasUserEntities = this.entitiesStore.hasUserEntities;

  protected readonly formOpen = signal(false);
  protected readonly formEntity = signal<Entity | null>(null);

  protected readonly databaseIcon = Database;
  protected readonly plusIcon = Plus;
  protected readonly kebabIcon = MoreVertical;
  protected readonly lockIcon = Lock;

  protected buildMenuItems(entity: Entity): MenuItem[] {
    return [
      {
        label: this.translate.instant('common.edit'),
        icon: 'pi pi-pencil',
        command: () => this.openEditForm(entity),
      },
      {
        separator: true,
      },
      {
        label: this.translate.instant('common.delete'),
        icon: 'pi pi-trash',
        styleClass: 'rules-menu-item--danger',
        command: () => this.confirmDelete(entity),
      },
    ];
  }

  protected onNewEntity(): void {
    this.formEntity.set(null);
    this.formOpen.set(true);
  }

  protected openEditForm(entity: Entity): void {
    this.formEntity.set(entity);
    this.formOpen.set(true);
  }

  protected onFormClose(): void {
    this.formOpen.set(false);
  }

  protected onFormSaved(entity: Entity): void {
    const wasEdit = this.formEntity() !== null;
    this.formOpen.set(false);
    this.messages.add({
      severity: 'success',
      summary: this.translate.instant(
        wasEdit ? 'memory.entities.form.updated_toast' : 'memory.entities.form.created_toast',
        { name: entity.name },
      ),
      life: 2200,
    });
  }

  private async confirmDelete(entity: Entity): Promise<void> {
    const accepted = await this.confirm.request({
      title: this.translate.instant('memory.entities.delete_title'),
      body: this.translate.instant('memory.entities.delete_body', { name: entity.name }),
      acceptLabel: this.translate.instant('common.delete'),
      rejectLabel: this.translate.instant('common.cancel'),
      acceptTone: 'danger',
    });
    if (!accepted) return;
    this.entitiesStore.deleteEntity(entity.id);
    this.messages.add({
      severity: 'success',
      summary: this.translate.instant('memory.entities.deleted_toast', { name: entity.name }),
      life: 2200,
    });
  }
}
