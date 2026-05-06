import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  Download,
  FileStack,
  LucideAngularModule,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-angular';
import { MessageService } from 'primeng/api';

import { ClickOutsideDirective } from '@core/directives';
import { BreadcrumbService } from '@core/services';
import {
  BulkActionBarComponent,
  DeleteEntityDialogComponent,
  ResultCounterComponent,
} from '@shared/components';
import { Template, TemplateType } from '../data/templates-data';
import { TemplatesStore } from '../state/templates.store';
import {
  TemplateFormPanelComponent,
  TemplateFormSubmission,
} from '../components/template-form-panel/template-form-panel.component';

interface ContextMenuPos {
  readonly x: number;
  readonly y: number;
  readonly templateId: number;
}

@Component({
  selector: 'aed-templates-page',
  standalone: true,
  imports: [
    BulkActionBarComponent,
    ClickOutsideDirective,
    DeleteEntityDialogComponent,
    LucideAngularModule,
    ResultCounterComponent,
    TemplateFormPanelComponent,
    TranslateModule,
  ],
  templateUrl: './templates-page.component.html',
  styleUrl: './templates-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplatesPageComponent implements OnInit, OnDestroy {
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly templatesStore = inject(TemplatesStore);
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);

  protected readonly plusIcon = Plus;
  protected readonly searchIcon = Search;
  protected readonly closeIcon = X;
  protected readonly downloadIcon = Download;
  protected readonly fileStackIcon = FileStack;
  protected readonly chatIcon = MessageSquare;
  protected readonly emailIcon = Mail;
  protected readonly moreIcon = MoreHorizontal;
  protected readonly editIcon = Pencil;
  protected readonly trashIcon = Trash2;

  protected readonly templates = this.templatesStore.templates;

  protected readonly activeTab = signal<TemplateType>('chat');
  protected readonly searchQuery = signal('');
  protected readonly creating = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly selectedIds = signal<ReadonlySet<number>>(new Set());
  protected readonly contextMenu = signal<ContextMenuPos | null>(null);
  protected readonly openMenuId = signal<number | null>(null);
  protected readonly deleteTarget = signal<readonly Template[] | null>(null);

  protected readonly chatCount = computed(
    () => this.templates().filter((t) => t.type === 'chat').length,
  );
  protected readonly emailCount = computed(
    () => this.templates().filter((t) => t.type === 'email').length,
  );

  protected readonly filtered = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const tab = this.activeTab();
    return this.templates().filter(
      (t) =>
        t.type === tab &&
        (query === '' ||
          t.title.toLowerCase().includes(query) ||
          t.body.toLowerCase().includes(query)),
    );
  });

  protected readonly sorted = computed(() =>
    [...this.filtered()].sort((a, b) => a.title.localeCompare(b.title)),
  );

  protected readonly existingTitles = computed(() => this.templates().map((t) => t.title));

  protected readonly allSelected = computed(() => {
    const sortedLen = this.sorted().length;
    return sortedLen > 0 && this.selectedIds().size === sortedLen;
  });

  protected readonly deleteItems = computed(() =>
    (this.deleteTarget() ?? []).map((t) => ({ id: t.id, name: t.title })),
  );

  protected readonly bulkEntity = {
    singular: 'plantilla',
    plural: 'plantillas',
    suffixSingular: 'seleccionada',
    suffixPlural: 'seleccionadas',
  } as const;

  ngOnInit(): void {
    this.breadcrumbs.set([
      { label: this.translate.instant('sidebar.administration'), path: '/admin/usuarios' },
      { label: this.translate.instant('sidebar.repositories'), path: '/admin/repositorios' },
      { label: this.translate.instant('templates.breadcrumb') },
    ]);
  }

  ngOnDestroy(): void {
    this.breadcrumbs.clear();
  }

  protected switchTab(tab: TemplateType): void {
    this.activeTab.set(tab);
    this.searchQuery.set('');
    this.selectedIds.set(new Set());
    this.editingId.set(null);
    this.creating.set(false);
  }

  protected onCreateClick(): void {
    this.editingId.set(null);
    this.creating.update((c) => !c);
  }

  protected onCreateSubmit(submission: TemplateFormSubmission): void {
    const created = this.templatesStore.addTemplate({
      title: submission.title,
      type: submission.type,
      body: submission.body,
    });
    this.creating.set(false);
    // Switch to the channel of the new template so the user sees it land.
    if (created.type !== this.activeTab()) {
      this.activeTab.set(created.type);
    }
    this.toastSuccess('templates.toasts.created', { name: created.title });
  }

  protected onEditSubmit(id: number, submission: TemplateFormSubmission): void {
    this.templatesStore.updateTemplate(id, {
      title: submission.title,
      type: submission.type,
      body: submission.body,
    });
    this.editingId.set(null);
    this.toastSuccess('templates.toasts.updated', { name: submission.title });
  }

  protected toggleSelect(id: number): void {
    this.selectedIds.update((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  protected toggleSelectAll(): void {
    this.selectedIds.update((current) => {
      const sorted = this.sorted();
      if (current.size === sorted.length) return new Set();
      return new Set(sorted.map((t) => t.id));
    });
  }

  protected clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  protected requestDeleteSelection(): void {
    const ids = this.selectedIds();
    const targets = this.templates().filter((t) => ids.has(t.id));
    if (targets.length > 0) this.deleteTarget.set(targets);
  }

  protected confirmDelete(remainingIds: readonly number[] | null): void {
    const target = this.deleteTarget();
    if (!target) return;

    let ids: number[];
    let toasted: Template[];
    if (remainingIds === null) {
      ids = target.map((t) => t.id);
      toasted = [...target];
    } else {
      const idSet = new Set(remainingIds);
      toasted = target.filter((t) => idSet.has(t.id));
      ids = toasted.map((t) => t.id);
    }

    if (ids.length === 1) {
      this.templatesStore.deleteTemplate(ids[0]!);
      this.toastSuccess('templates.toasts.deleted_single', { name: toasted[0]!.title });
    } else {
      this.templatesStore.deleteTemplates(ids);
      this.toastSuccess('templates.toasts.deleted_bulk', { count: ids.length });
    }

    this.deleteTarget.set(null);
    this.clearSelection();
  }

  protected cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  protected onContextMenu(event: MouseEvent, templateId: number): void {
    event.preventDefault();
    this.contextMenu.set({ x: event.clientX, y: event.clientY, templateId });
  }

  protected closeContextMenu(): void {
    this.contextMenu.set(null);
  }

  protected toggleRowMenu(id: number): void {
    this.openMenuId.update((current) => (current === id ? null : id));
  }

  protected closeRowMenu(): void {
    this.openMenuId.set(null);
  }

  protected onContextEdit(): void {
    const ctx = this.contextMenu();
    if (!ctx) return;
    this.editingId.set(ctx.templateId);
    this.creating.set(false);
    this.contextMenu.set(null);
  }

  protected onContextDelete(): void {
    const ctx = this.contextMenu();
    if (!ctx) return;
    const tpl = this.templates().find((t) => t.id === ctx.templateId);
    if (tpl) this.deleteTarget.set([tpl]);
    this.contextMenu.set(null);
  }

  protected onRowEdit(tpl: Template): void {
    this.editingId.set(tpl.id);
    this.creating.set(false);
    this.openMenuId.set(null);
  }

  protected onRowDelete(tpl: Template): void {
    this.deleteTarget.set([tpl]);
    this.openMenuId.set(null);
  }

  protected closeCreatePanel(): void {
    this.creating.set(false);
  }

  protected closeEditPanel(): void {
    this.editingId.set(null);
  }

  protected onSearchKey(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    if (this.searchQuery()) {
      this.searchQuery.set('');
    } else {
      (event.target as HTMLInputElement).blur();
    }
  }

  private toastSuccess(key: string, params?: Record<string, string | number>): void {
    this.messages.add({
      severity: 'success',
      summary: this.translate.instant(key, params),
      life: 3000,
    });
  }
}
