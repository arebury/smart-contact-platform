import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  AlertOctagon,
  GripVertical,
  LucideAngularModule,
  Mic,
  MoreVertical,
  Plus,
  Settings2,
  Sparkles,
} from 'lucide-angular';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import type { MenuItem } from 'primeng/api';

import { ConfirmHostService } from '@core/services/confirm-host.service';
import { PageHeaderComponent } from '@shared/components';

import type { Rule } from '../../data/rule.types';
import { RulesStore } from '../../state/rules.store';

/**
 * Listado de reglas Memory.
 *
 * Iter 9a: tabla 7 cols + 2 secciones.
 * Iter 9b: + drag-drop priorización activas (CDK DragDrop) + kebab menu
 *          (Editar / Activar-Desactivar / Eliminar) + delete confirmación
 *          danger (alta fricción real con input "escribir nombre" diferida
 *          a iter futura — anotado en backlog).
 */
@Component({
  selector: 'sc-memory-rules-page',
  imports: [
    ButtonModule,
    CdkDrag,
    CdkDropList,
    LucideAngularModule,
    MenuModule,
    PageHeaderComponent,
    TranslateModule,
  ],
  templateUrl: './rules-page.component.html',
  styleUrl: './rules-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RulesPageComponent {
  private readonly rulesStore = inject(RulesStore);
  private readonly confirm = inject(ConfirmHostService);
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);

  protected readonly activeRules = this.rulesStore.activeRules;
  protected readonly inactiveOrDraftRules = this.rulesStore.inactiveOrDraftRules;
  protected readonly isEmpty = this.rulesStore.isEmpty;

  protected readonly menuTargetRule = signal<Rule | null>(null);

  protected readonly settingsIcon = Settings2;
  protected readonly plusIcon = Plus;
  protected readonly gripIcon = GripVertical;
  protected readonly micIcon = Mic;
  protected readonly sparklesIcon = Sparkles;
  protected readonly alertIcon = AlertOctagon;
  protected readonly kebabIcon = MoreVertical;

  protected scopeSummary(rule: Rule): string {
    const parts: string[] = [];
    if (rule.servicios.length === 1) {
      parts.push(`Servicio ${rule.servicios[0]}`);
    } else if (rule.servicios.length > 1) {
      parts.push(`${rule.servicios.length} servicios`);
    }
    if (rule.grupos.length === 1) {
      parts.push(`grupo ${rule.grupos[0]}`);
    } else if (rule.grupos.length > 1) {
      parts.push(`${rule.grupos.length} grupos`);
    }
    if (rule.agentes.length === 1) {
      parts.push(`agente ${rule.agentes[0]}`);
    } else if (rule.agentes.length > 1) {
      parts.push(`${rule.agentes.length} agentes`);
    }
    return parts.length > 0 ? parts.join(', ') : 'Cualquier conversación';
  }

  protected formatRelativeDate(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    if (diffHours < 1) return 'hace unos minutos';
    if (diffHours < 24) return `hace ${diffHours} h`;
    if (diffDays === 1) return 'ayer';
    if (diffDays < 7) return `hace ${diffDays} d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  protected onActiveReorder(event: CdkDragDrop<Rule[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    const current = [...this.activeRules()];
    moveItemInArray(current, event.previousIndex, event.currentIndex);
    this.rulesStore.reorderActive(current.map((r) => r.id));
    this.messages.add({
      severity: 'success',
      summary: this.translate.instant('memory.rules.order_updated'),
      life: 1800,
    });
  }

  protected setMenuTarget(rule: Rule): void {
    this.menuTargetRule.set(rule);
  }

  protected buildMenuItems(rule: Rule): MenuItem[] {
    const isActive = rule.active && !rule.isDraft;
    const toggleLabel = isActive
      ? this.translate.instant('memory.rules.menu.deactivate')
      : this.translate.instant('memory.rules.menu.activate');
    return [
      {
        label: this.translate.instant('memory.rules.menu.edit'),
        icon: 'pi pi-pencil',
        disabled: true, // iter 9c
      },
      {
        label: this.translate.instant('memory.rules.menu.duplicate'),
        icon: 'pi pi-copy',
        disabled: true, // iter 9d
      },
      {
        separator: true,
      },
      {
        label: toggleLabel,
        icon: isActive ? 'pi pi-pause' : 'pi pi-play',
        command: () => this.rulesStore.toggleActive(rule.id),
      },
      {
        label: this.translate.instant('memory.rules.menu.delete'),
        icon: 'pi pi-trash',
        styleClass: 'rules-menu-item--danger',
        command: () => this.confirmDelete(rule),
      },
    ];
  }

  private async confirmDelete(rule: Rule): Promise<void> {
    const accepted = await this.confirm.request({
      title: this.translate.instant('memory.rules.delete_title'),
      body: this.translate.instant('memory.rules.delete_body', { name: rule.name }),
      acceptLabel: this.translate.instant('common.delete'),
      rejectLabel: this.translate.instant('common.cancel'),
      acceptTone: 'danger',
    });
    if (!accepted) return;
    this.rulesStore.deleteRule(rule.id);
    this.messages.add({
      severity: 'success',
      summary: this.translate.instant('memory.rules.deleted_toast', { name: rule.name }),
      life: 2200,
    });
  }
}
