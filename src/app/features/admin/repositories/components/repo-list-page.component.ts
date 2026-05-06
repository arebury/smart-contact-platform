import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  Download,
  LucideAngularModule,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-angular';
import { MessageService } from 'primeng/api';

import { ClickOutsideDirective } from '@core/directives/click-outside.directive';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { XlsxExportService } from '@core/services/xlsx-export.service';
import { clampToViewport } from '@core/utils/viewport';
import { BulkActionBarComponent } from '@shared/components/bulk-action-bar/bulk-action-bar.component';
import { DeleteEntityDialogComponent } from '@shared/components/delete-entity-dialog/delete-entity-dialog.component';
import { ResultCounterComponent } from '@shared/components/result-counter/result-counter.component';
import { RepoFormPanelComponent, RepoFormSubmission } from './repo-form-panel.component';
import { RepoEntity, RepoPageConfig, RepoStore } from './repo-types';

interface ContextMenuPos {
  readonly x: number;
  readonly y: number;
  readonly itemId: number;
}

/**
 * Generic CRUD page used by all 9 repository instances. Driven by a
 * `RepoPageConfig<T>` (columns, fields, breadcrumb, copy) plus a `RepoStore<T>`
 * that supplies the data. Mirrors the prototype's `RepositoryListPage`
 * including search, sort, table with row + context menus, dynamic edit panel,
 * bulk delete (via shared `DeleteEntityDialog`), and XLSX export.
 */
@Component({
  selector: 'aed-repo-list-page',
  standalone: true,
  imports: [
    BulkActionBarComponent,
    ClickOutsideDirective,
    DeleteEntityDialogComponent,
    LucideAngularModule,
    RepoFormPanelComponent,
    ResultCounterComponent,
    TranslateModule,
  ],
  templateUrl: './repo-list-page.component.html',
  styleUrl: './repo-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RepoListPageComponent<T extends RepoEntity> implements OnInit, OnDestroy {
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly xlsx = inject(XlsxExportService);

  readonly config = input.required<RepoPageConfig<T>>();
  readonly store = input.required<RepoStore<T>>();

  protected readonly plusIcon = Plus;
  protected readonly searchIcon = Search;
  protected readonly closeIcon = X;
  protected readonly downloadIcon = Download;
  protected readonly moreIcon = MoreHorizontal;
  protected readonly editIcon = Pencil;
  protected readonly trashIcon = Trash2;

  protected readonly searchQuery = signal('');
  protected readonly creating = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly selectedIds = signal<ReadonlySet<number>>(new Set());
  protected readonly contextMenu = signal<ContextMenuPos | null>(null);
  protected readonly openMenuId = signal<number | null>(null);
  protected readonly deleteTarget = signal<readonly T[] | null>(null);

  protected readonly items = computed(() => this.store().items());

  protected readonly filtered = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const all = this.items();
    if (!query) return all;
    const keys = this.config().searchKeys;
    return all.filter((item) =>
      keys.some((key) => {
        const value = (item as unknown as Record<string, unknown>)[key];
        return typeof value === 'string' && value.toLowerCase().includes(query);
      }),
    );
  });

  protected readonly sorted = computed(() =>
    [...this.filtered()].sort((a, b) => a.name.localeCompare(b.name)),
  );

  protected readonly existingNames = computed(() => this.items().map((item) => item.name));

  protected readonly allSelected = computed(() => {
    const sortedLen = this.sorted().length;
    return sortedLen > 0 && this.selectedIds().size === sortedLen;
  });

  protected readonly deleteItems = computed(() =>
    (this.deleteTarget() ?? []).map((item) => ({ id: item.id, name: item.name })),
  );

  protected readonly bulkEntity = computed(() => ({
    singular: this.config().entityNameSpanish,
    plural: this.config().entityPluralSpanish,
    suffixSingular: 'seleccionado',
    suffixPlural: 'seleccionados',
  }));

  ngOnInit(): void {
    const cfg = this.config();
    this.breadcrumbs.set([
      { label: this.translate.instant('sidebar.administration'), path: '/admin/usuarios' },
      { label: this.translate.instant('sidebar.repositories'), path: '/admin/repositorios' },
      { label: this.translate.instant(cfg.breadcrumbExtraKey) },
    ]);
  }

  ngOnDestroy(): void {
    this.breadcrumbs.clear();
  }

  protected getCellValue(item: T, key: string): string {
    const cfg = this.config();
    const column = cfg.columns.find((c) => c.key === key);
    if (!column) return '';
    return column.accessor(item);
  }

  protected getStatusEntry(
    item: T,
    key: string,
  ): { labelKey: string; tone: 'success' | 'muted' | 'warning' | 'danger' | 'info' } | null {
    const column = this.config().columns.find((c) => c.key === key);
    if (!column || column.kind !== 'status' || !column.statusMap) return null;
    return column.statusMap[column.accessor(item)] ?? null;
  }

  protected onCreateClick(): void {
    this.editingId.set(null);
    this.creating.update((c) => !c);
  }

  protected onCreateSubmit(submission: RepoFormSubmission): void {
    const created = this.store().addItem(submission as unknown as Omit<T, 'id'>);
    this.creating.set(false);
    this.toastSuccess('repositories.toasts.created', {
      entity: this.config().entityNameSpanish,
      name: created.name,
    });
  }

  protected onEditSubmit(id: number, submission: RepoFormSubmission): void {
    this.store().updateItem(id, submission as unknown as Partial<T>);
    this.editingId.set(null);
    const name = submission['name'] ?? '';
    this.toastSuccess('repositories.toasts.updated', {
      entity: this.config().entityNameSpanish,
      name,
    });
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
      return new Set(sorted.map((item) => item.id));
    });
  }

  protected clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  protected requestDeleteSelection(): void {
    const ids = this.selectedIds();
    const targets = this.items().filter((item) => ids.has(item.id));
    if (targets.length > 0) this.deleteTarget.set(targets);
  }

  protected confirmDelete(remainingIds: readonly number[] | null): void {
    const target = this.deleteTarget();
    if (!target) return;

    let ids: number[];
    let toasted: T[];
    if (remainingIds === null) {
      ids = target.map((t) => t.id);
      toasted = [...target];
    } else {
      const idSet = new Set(remainingIds);
      toasted = target.filter((t) => idSet.has(t.id));
      ids = toasted.map((t) => t.id);
    }

    if (ids.length === 1) {
      this.store().deleteItem(ids[0]!);
      this.toastSuccess('repositories.toasts.deleted_single', {
        entity: this.config().entityNameSpanish,
        name: toasted[0]!.name,
      });
    } else {
      this.store().deleteItems(ids);
      this.toastSuccess('repositories.toasts.deleted_bulk', {
        count: ids.length,
        entity: this.config().entityPluralSpanish,
      });
    }

    this.deleteTarget.set(null);
    this.clearSelection();
  }

  protected cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  protected onContextMenu(event: MouseEvent, itemId: number): void {
    event.preventDefault();
    const { x, y } = clampToViewport(event.clientX, event.clientY);
    this.contextMenu.set({ x, y, itemId });
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
    this.editingId.set(ctx.itemId);
    this.creating.set(false);
    this.contextMenu.set(null);
  }

  protected onContextDelete(): void {
    const ctx = this.contextMenu();
    if (!ctx) return;
    const item = this.items().find((i) => i.id === ctx.itemId);
    if (item) this.deleteTarget.set([item]);
    this.contextMenu.set(null);
  }

  protected onRowEdit(item: T): void {
    this.editingId.set(item.id);
    this.creating.set(false);
    this.openMenuId.set(null);
  }

  protected onRowDelete(item: T): void {
    this.deleteTarget.set([item]);
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

  protected onExport(): void {
    const cfg = this.config();
    const headers = cfg.columns.map((c) => this.translate.instant(c.labelKey));
    const rows = this.sorted().map((item) =>
      cfg.columns.map((c) => {
        if (c.kind === 'status' && c.statusMap) {
          const entry = c.statusMap[c.accessor(item)];
          return entry ? this.translate.instant(entry.labelKey) : c.accessor(item);
        }
        return c.accessor(item);
      }),
    );
    this.xlsx.export({
      headers,
      rows,
      sheetName: this.translate.instant(cfg.sheetNameKey),
      filePrefix: cfg.filePrefix,
    });
  }

  private toastSuccess(key: string, params: Record<string, string | number>): void {
    this.messages.add({
      severity: 'success',
      summary: this.translate.instant(key, params),
      life: 3000,
    });
  }
}
