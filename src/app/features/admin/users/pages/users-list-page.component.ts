import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  Copy,
  Download,
  LucideAngularModule,
  EllipsisVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCog,
  X,
} from 'lucide-angular';
import { MessageService } from 'primeng/api';

import { ClickOutsideDirective, SortableHeaderDirective } from '@core/directives';
import { UndoStackService, XlsxExportService } from '@core/services';
import { SelectionState } from '@core/utils/selection-state';
import { clampToViewport } from '@core/utils/viewport';
import {
  BulkActionBarComponent,
  ColumnDef,
  ColumnSelectorComponent,
  DeleteEntityDialogComponent,
  EmptyStateComponent,
  InlineRenameCellComponent,
} from '@shared/components';
import { USER_TYPE_LABEL_KEYS, USER_TYPES, User, UserType } from '../data/users-data';
import { UsersStore } from '../state/users.store';

const COLUMN_PREF_KEY = 'sc_users_columns_v1';

type SortField = 'name' | 'email' | 'type' | 'identifier' | 'status';

interface ContextMenuPos {
  readonly x: number;
  readonly y: number;
  readonly userId: number;
}

@Component({
    selector: 'aed-users-list-page',
    imports: [
        BulkActionBarComponent,
        ClickOutsideDirective,
        ColumnSelectorComponent,
        DeleteEntityDialogComponent,
        EmptyStateComponent,
        InlineRenameCellComponent,
        LucideAngularModule,
        SortableHeaderDirective,
        TranslateModule,
    ],
    templateUrl: './users-list-page.component.html',
    styleUrl: './users-list-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersListPageComponent {
  private readonly usersStore = inject(UsersStore);
  private readonly xlsx = inject(XlsxExportService);
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly undoStack = inject(UndoStackService);

  protected readonly plusIcon = Plus;
  protected readonly searchIcon = Search;
  protected readonly closeIcon = X;
  protected readonly downloadIcon = Download;
  protected readonly moreIcon = EllipsisVertical;
  protected readonly editIcon = Pencil;
  protected readonly trashIcon = Trash2;
  protected readonly copyIcon = Copy;
  protected readonly emptyIcon = UserCog;

  protected readonly typeLabelKeys = USER_TYPE_LABEL_KEYS;
  protected readonly users = this.usersStore.users;

  /**
   * Translated user-type label table — built once on init so filter
   * and sort comparators can do `O(1)` map lookups instead of calling
   * `translate.instant()` inside `.filter()` / `.sort()` (per-row,
   * per-keystroke). Language is static (`'es'`) at runtime so the
   * cache doesn't need an invalidation hook; revisit if a runtime
   * language switcher is ever added.
   */
  private readonly translatedTypeLabels = (() => {
    const map = new Map<UserType, string>();
    for (const t of USER_TYPES) {
      map.set(t, this.translate.instant(this.typeLabelKeys[t]));
    }
    return map;
  })();

  protected readonly searchQuery = signal('');
  protected readonly sortField = signal<SortField | null>(null);
  protected readonly sortDir = signal<'asc' | 'desc'>('asc');
  /** See `agents-list-page` for the rationale behind the delegate pattern. */
  private readonly selection = new SelectionState<{ readonly id: number }>(() => this.sorted());
  protected readonly selectedIds = this.selection.ids;
  protected readonly contextMenu = signal<ContextMenuPos | null>(null);
  protected readonly openMenuId = signal<number | null>(null);
  protected readonly deleteTarget = signal<readonly User[] | null>(null);
  protected readonly renamingId = signal<number | null>(null);
  protected readonly columnPrefKey = COLUMN_PREF_KEY;
  protected readonly visibleColumns = signal<ReadonlySet<string>>(new Set());

  protected readonly columnDefs = computed<readonly ColumnDef[]>(() => [
    { key: 'name', label: this.translate.instant('users.table.name'), locked: true },
    { key: 'email', label: this.translate.instant('users.table.email') },
    { key: 'identifier', label: this.translate.instant('users.table.identifier') },
    { key: 'type', label: this.translate.instant('users.table.type') },
    { key: 'status', label: this.translate.instant('users.table.status') },
  ]);

  protected readonly filtered = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const all = this.users();
    if (!q) return all;
    return all.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.identifier.toLowerCase().includes(q) ||
        (this.translatedTypeLabels.get(u.type) ?? '').toLowerCase().includes(q),
    );
  });

  protected readonly sorted = computed(() => {
    const list = [...this.filtered()];
    const field = this.sortField();
    const dir = this.sortDir();

    list.sort((a, b) => {
      // Drafts always first.
      if (a.isDraft && !b.isDraft) return -1;
      if (!a.isDraft && b.isDraft) return 1;
      if (!field) return 0;

      let cmp = 0;
      switch (field) {
        case 'name':
          cmp = a.name.localeCompare(b.name, 'es');
          break;
        case 'email':
          cmp = a.email.localeCompare(b.email);
          break;
        case 'type':
          cmp = (this.translatedTypeLabels.get(a.type) ?? '').localeCompare(
            this.translatedTypeLabels.get(b.type) ?? '',
          );
          break;
        case 'identifier':
          cmp = a.identifier.localeCompare(b.identifier);
          break;
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return dir === 'asc' ? cmp : -cmp;
    });
    return list;
  });

  protected readonly allSelected = this.selection.allSelected;

  protected readonly deleteItems = computed(() =>
    (this.deleteTarget() ?? []).map((u) => ({ id: u.id, name: u.name })),
  );

  protected readonly bulkEntity = {
    singular: 'usuario',
    plural: 'usuarios',
    suffixSingular: 'seleccionado',
    suffixPlural: 'seleccionados',
  } as const;

  protected typeLabel(type: UserType): string {
    return this.translate.instant(this.typeLabelKeys[type]);
  }

  protected isColVisible(key: string): boolean {
    const set = this.visibleColumns();
    /* See groups-list-page.component.ts for context — same fallback so a
     * future `defaultVisible: false` column doesn't render on first
     * paint. */
    if (set.size === 0) {
      const col = this.columnDefs().find((c) => c.key === key);
      return !!col && col.defaultVisible !== false;
    }
    return set.has(key);
  }

  protected onColumnsChange(set: ReadonlySet<string>): void {
    this.visibleColumns.set(set);
  }

  protected toggleSort(field: SortField): void {
    if (this.sortField() === field) {
      this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortField.set(field);
      this.sortDir.set('asc');
    }
  }

  /** Current sort direction for `field`, or `null` if not the active column. */
  protected getSortDir(field: SortField): 'asc' | 'desc' | null {
    return this.sortField() === field ? this.sortDir() : null;
  }

  protected toggleSelect(id: number): void {
    this.selection.toggle(id);
  }

  protected toggleSelectAll(): void {
    this.selection.toggleAll();
  }

  protected clearSelection(): void {
    this.selection.clear();
  }

  protected onCreateClick(): void {
    void this.router.navigateByUrl('/admin/usuarios/crear');
  }

  protected onRowClick(user: User): void {
    if (this.renamingId() === user.id) return;
    void this.router.navigateByUrl(`/admin/usuarios/editar/${user.id}`);
  }

  protected onRowEdit(user: User): void {
    this.openMenuId.set(null);
    void this.router.navigateByUrl(`/admin/usuarios/editar/${user.id}`);
  }

  protected onRowDuplicate(user: User): void {
    const draft = this.usersStore.duplicate(user.id);
    this.openMenuId.set(null);
    if (!draft) return;
    this.renamingId.set(draft.id);
    this.undoStack.push(
      this.translate.instant('common.draft_created', { name: draft.name }),
      this.translate.instant('common.draft_removed'),
      () => {
        this.usersStore.deleteUser(draft.id);
        if (this.renamingId() === draft.id) this.renamingId.set(null);
      },
    );
  }

  protected onRowDelete(user: User): void {
    this.deleteTarget.set([user]);
    this.openMenuId.set(null);
  }

  protected onRenameCommit(id: number, value: string): void {
    this.usersStore.updateUser(id, { name: value });
    this.renamingId.set(null);
    this.messages.add({
      severity: 'secondary',
      summary: this.translate.instant('users.toasts.duplicated', { name: value }),
      life: 3000,
    });
  }

  protected onRenameCancel(id: number): void {
    const target = this.usersStore.getUser(id);
    this.renamingId.set(null);
    if (target?.isDraft) this.usersStore.deleteUser(id);
  }

  protected requestDeleteSelection(): void {
    const ids = this.selectedIds();
    const targets = this.users().filter((u) => ids.has(u.id));
    if (targets.length > 0) this.deleteTarget.set(targets);
  }

  protected confirmDelete(remainingIds: readonly number[] | null): void {
    const target = this.deleteTarget();
    if (!target) return;

    let toasted: User[];
    if (remainingIds === null) {
      toasted = [...target];
    } else {
      const idSet = new Set(remainingIds);
      toasted = target.filter((u) => idSet.has(u.id));
    }
    const ids = toasted.map((u) => u.id);

    if (ids.length === 1) {
      this.usersStore.deleteUser(ids[0]!);
      this.messages.add({
        severity: 'success',
        summary: this.translate.instant('users.toasts.deleted_single', {
          name: toasted[0]!.name,
        }),
        life: 3000,
      });
    } else {
      this.usersStore.deleteUsers(ids);
      this.messages.add({
        severity: 'success',
        summary: this.translate.instant('users.toasts.deleted_bulk', { count: ids.length }),
        life: 3000,
      });
    }

    this.deleteTarget.set(null);
    this.clearSelection();
  }

  protected cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  protected onContextMenu(event: MouseEvent, userId: number): void {
    event.preventDefault();
    const { x, y } = clampToViewport(event.clientX, event.clientY);
    this.contextMenu.set({ x, y, userId });
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
    this.contextMenu.set(null);
    void this.router.navigateByUrl(`/admin/usuarios/editar/${ctx.userId}`);
  }

  protected onContextDuplicate(): void {
    const ctx = this.contextMenu();
    if (!ctx) return;
    const user = this.users().find((u) => u.id === ctx.userId);
    this.contextMenu.set(null);
    if (user) this.onRowDuplicate(user);
  }

  protected onContextDelete(): void {
    const ctx = this.contextMenu();
    if (!ctx) return;
    const user = this.users().find((u) => u.id === ctx.userId);
    if (user) this.deleteTarget.set([user]);
    this.contextMenu.set(null);
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
    const headers = [
      this.translate.instant('users.export.code'),
      this.translate.instant('users.export.name'),
      this.translate.instant('users.export.email'),
      this.translate.instant('users.export.identifier'),
      this.translate.instant('users.export.type'),
      this.translate.instant('users.export.status'),
      this.translate.instant('users.export.created_at'),
    ];
    const rows = this.sorted().map((u) => [
      u.code,
      u.name,
      u.email,
      u.identifier,
      this.typeLabel(u.type),
      this.translate.instant(`users.status.${u.status}`),
      u.createdAt,
    ]);
    this.xlsx.export({
      headers,
      rows,
      sheetName: this.translate.instant('users.export.sheet'),
      filePrefix: 'usuarios',
    });
  }
}
