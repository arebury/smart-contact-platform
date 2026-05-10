import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  Copy,
  Download,
  EllipsisVertical,
  LucideAngularModule,
  Mail,
  MessageSquare,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  Users2,
  X,
} from 'lucide-angular';
import { MessageService } from 'primeng/api';

import { ClickOutsideDirective, SortableHeaderDirective } from '@core/directives';
import { UndoStackService, XlsxExportService } from '@core/services';
import { SelectionState } from '@core/utils/selection-state';
import { clampToViewport } from '@core/utils/viewport';
import {
  BulkActionBarComponent,
  BulkEditCommit,
  BulkEditFieldOption,
  BulkEditMenuComponent,
  ColumnDef,
  ColumnSelectorComponent,
  DeleteEntityDialogComponent,
  EmptyStateComponent,
  IllustratedAvatarComponent,
  ImpactBadge,
  ImpactItem,
  ImpactPreviewDialogComponent,
  InlineRenameCellComponent,
} from '@shared/components';
import {
  CHANNEL_LABEL_KEYS,
  CHAT_STRATEGIES,
  GROUP_PRIORITIES,
  Group,
  GroupChannel,
  PHONE_STRATEGIES,
  PRIORITY_LABEL_KEYS,
} from '../data/groups-data';
import { GroupBulkField, GroupsStore } from '../state/groups.store';
import { GroupAgentLinksStore } from '@features/admin/services/group-agent-links.store';

type SortField = 'name' | 'code' | 'priority' | 'agents' | 'strategy';

interface ContextMenuPos {
  readonly x: number;
  readonly y: number;
  readonly groupId: number;
}

interface PendingBulkEdit {
  readonly field: GroupBulkField;
  readonly fieldLabel: string;
  readonly value: unknown;
  readonly valueLabel: string;
}

/* v2 — bumped when ColumnSelector schema changed (set → ordered array)
 * and when `code` started shipping hidden by default. */
const COLUMN_PREF_KEY = 'sc_groups_columns_v2';

@Component({
    selector: 'aed-groups-list-page',
    imports: [
        BulkActionBarComponent,
        BulkEditMenuComponent,
        ClickOutsideDirective,
        ColumnSelectorComponent,
        DeleteEntityDialogComponent,
        EmptyStateComponent,
        IllustratedAvatarComponent,
        ImpactPreviewDialogComponent,
        InlineRenameCellComponent,
        LucideAngularModule,
        SortableHeaderDirective,
        TranslateModule,
    ],
    templateUrl: './groups-list-page.component.html',
    styleUrl: './groups-list-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupsListPageComponent {
  private readonly groupsStore = inject(GroupsStore);
  private readonly linksStore = inject(GroupAgentLinksStore);
  private readonly xlsx = inject(XlsxExportService);
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly undoStack = inject(UndoStackService);

  /** Derived count of agents assigned to a group. */
  protected assignedCountForGroup(groupId: number): number {
    return this.linksStore.linksForGroup(groupId).length;
  }

  protected readonly plusIcon = Plus;
  protected readonly searchIcon = Search;
  protected readonly closeIcon = X;
  protected readonly downloadIcon = Download;
  protected readonly moreIcon = EllipsisVertical;
  protected readonly editIcon = Pencil;
  protected readonly trashIcon = Trash2;
  protected readonly copyIcon = Copy;
  protected readonly phoneIcon = Phone;
  protected readonly chatIcon = MessageSquare;
  protected readonly emailIcon = Mail;
  protected readonly emptyIcon = Users2;

  protected readonly priorityKeys = PRIORITY_LABEL_KEYS;
  protected readonly channelKeys = CHANNEL_LABEL_KEYS;
  protected readonly groups = this.groupsStore.groups;

  protected readonly searchQuery = signal('');
  protected readonly sortField = signal<SortField | null>(null);
  protected readonly sortDir = signal<'asc' | 'desc'>('asc');
  /** See `agents-list-page` for the rationale behind the delegate pattern. */
  private readonly selection = new SelectionState<{ readonly id: number }>(() => this.sorted());
  protected readonly selectedIds = this.selection.ids;
  protected readonly contextMenu = signal<ContextMenuPos | null>(null);
  protected readonly openMenuId = signal<number | null>(null);
  protected readonly deleteTarget = signal<readonly Group[] | null>(null);
  protected readonly renamingId = signal<number | null>(null);
  protected readonly pendingBulkEdit = signal<PendingBulkEdit | null>(null);
  protected readonly columnPrefKey = COLUMN_PREF_KEY;
  protected readonly visibleColumns = signal<ReadonlySet<string>>(new Set());

  protected readonly columnDefs = computed<readonly ColumnDef[]>(() => [
    {
      key: 'code',
      label: this.translate.instant('groups.table.code'),
      defaultVisible: false,
    },
    { key: 'name', label: this.translate.instant('groups.table.name'), locked: true },
    { key: 'phone', label: this.translate.instant('groups.table.phone') },
    { key: 'channels', label: this.translate.instant('groups.table.channels') },
    { key: 'priority', label: this.translate.instant('groups.table.priority') },
    { key: 'strategy', label: this.translate.instant('groups.table.strategy') },
    { key: 'agents', label: this.translate.instant('groups.table.agents') },
  ]);

  protected readonly bulkEditFields = computed<readonly BulkEditFieldOption[]>(() => [
    {
      key: 'priority',
      label: this.translate.instant('groups.table.priority'),
      values: GROUP_PRIORITIES.map((p) => ({
        value: p,
        label: this.translate.instant(this.priorityKeys[p]),
      })),
    },
    {
      key: 'strategy',
      label: this.translate.instant('groups.table.strategy'),
      values: [...PHONE_STRATEGIES, ...CHAT_STRATEGIES].map((s) => ({ value: s, label: s })),
    },
  ]);

  protected readonly filtered = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const all = this.groups();
    if (!q) return all;
    return all.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.code.includes(q) ||
        g.phone.includes(q) ||
        g.strategy.toLowerCase().includes(q),
    );
  });

  protected readonly sorted = computed(() => {
    const list = [...this.filtered()];
    const field = this.sortField();
    const dir = this.sortDir();
    list.sort((a, b) => {
      if (a.isDraft && !b.isDraft) return -1;
      if (!a.isDraft && b.isDraft) return 1;
      if (!field) return 0;
      let cmp = 0;
      switch (field) {
        case 'name':
          cmp = a.name.localeCompare(b.name, 'es');
          break;
        case 'code':
          cmp = a.code.localeCompare(b.code);
          break;
        case 'priority':
          cmp = a.priority.localeCompare(b.priority);
          break;
        case 'agents':
          cmp = this.assignedCountForGroup(a.id) - this.assignedCountForGroup(b.id);
          break;
        case 'strategy':
          cmp = a.strategy.localeCompare(b.strategy);
          break;
      }
      return dir === 'asc' ? cmp : -cmp;
    });
    return list;
  });

  protected readonly allSelected = this.selection.allSelected;

  protected readonly deleteItems = computed(() =>
    (this.deleteTarget() ?? []).map((g) => ({ id: g.id, name: g.name })),
  );

  protected readonly bulkEntity = {
    singular: 'grupo',
    plural: 'grupos',
    suffixSingular: 'seleccionado',
    suffixPlural: 'seleccionados',
  } as const;

  protected readonly impactItems = computed<readonly ImpactItem[]>(() => {
    const ids = this.selectedIds();
    return this.groups()
      .filter((g) => ids.has(g.id))
      .map((g) => ({
        id: g.id,
        name: g.name,
        hint: `(${this.assignedCountForGroup(g.id)} agentes)`,
      }));
  });

  protected readonly impactBadge = computed<ImpactBadge | null>(() => {
    const op = this.pendingBulkEdit();
    if (!op) return null;
    return { fieldLabel: op.fieldLabel, newValueLabel: op.valueLabel };
  });

  protected channelIcon(channel: GroupChannel) {
    if (channel === 'phone') return this.phoneIcon;
    if (channel === 'chat') return this.chatIcon;
    return this.emailIcon;
  }

  protected priorityTone(priority: string): 'muted' | 'info' | 'warning' | 'danger' {
    switch (priority) {
      case 'Media':
        return 'info';
      case 'Alta':
        return 'warning';
      case 'Máxima':
        return 'danger';
      default:
        return 'muted';
    }
  }

  protected isColVisible(key: string): boolean {
    const set = this.visibleColumns();
    /* Before column-selector emits its first visibilityChange the set is
     * empty. Falling back to `true` here would render every column on
     * first paint, including those declared `defaultVisible: false` —
     * which is why "código" appeared toggled on entry. Mirror the
     * column-selector's own default rule so the table matches. */
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
    void this.router.navigateByUrl('/admin/grupos/crear');
  }

  protected onRowClick(group: Group): void {
    if (this.renamingId() === group.id) return;
    void this.router.navigateByUrl(`/admin/grupos/editar/${group.id}`);
  }

  protected onRowEdit(group: Group): void {
    this.openMenuId.set(null);
    void this.router.navigateByUrl(`/admin/grupos/editar/${group.id}`);
  }

  protected onRowDuplicate(group: Group): void {
    const draft = this.groupsStore.duplicate(group.id);
    this.openMenuId.set(null);
    if (!draft) return;
    this.renamingId.set(draft.id);
    this.undoStack.push(
      this.translate.instant('common.draft_created', { name: draft.name }),
      this.translate.instant('common.draft_removed'),
      () => {
        this.groupsStore.deleteGroup(draft.id);
        if (this.renamingId() === draft.id) this.renamingId.set(null);
      },
    );
  }

  protected onRowDelete(group: Group): void {
    this.deleteTarget.set([group]);
    this.openMenuId.set(null);
  }

  protected onRenameCommit(id: number, value: string): void {
    this.groupsStore.updateGroup(id, { name: value });
    this.renamingId.set(null);
    this.messages.add({
      severity: 'secondary',
      summary: this.translate.instant('groups.toasts.duplicated', { name: value }),
      life: 3000,
    });
  }

  protected onRenameCancel(id: number): void {
    const target = this.groupsStore.getGroup(id);
    this.renamingId.set(null);
    if (target?.isDraft) this.groupsStore.deleteGroup(id);
  }

  protected requestDeleteSelection(): void {
    const ids = this.selectedIds();
    const targets = this.groups().filter((g) => ids.has(g.id));
    if (targets.length > 0) this.deleteTarget.set(targets);
  }

  protected onBulkEditCommit(commit: BulkEditCommit): void {
    this.pendingBulkEdit.set({
      field: commit.fieldKey as GroupBulkField,
      fieldLabel: commit.fieldLabel,
      value: commit.value,
      valueLabel: commit.valueLabel,
    });
  }

  protected onBulkPreviewConfirm(remainingIds: readonly number[]): void {
    const op = this.pendingBulkEdit();
    if (!op) return;
    const idSet = new Set(remainingIds);
    const snapshot = this.groups()
      .filter((g) => idSet.has(g.id))
      .map((g) => ({ ...g }));

    this.groupsStore.bulkUpdate(remainingIds, op.field, op.value);
    this.pendingBulkEdit.set(null);
    this.clearSelection();

    this.undoStack.push(
      this.translate.instant('common.bulk_updated', { count: remainingIds.length }),
      this.translate.instant('common.change_reverted'),
      () => {
        for (const prev of snapshot) {
          this.groupsStore.updateGroup(prev.id, prev);
        }
      },
    );
  }

  protected onBulkPreviewCancel(): void {
    this.pendingBulkEdit.set(null);
  }

  protected confirmDelete(remainingIds: readonly number[] | null): void {
    const target = this.deleteTarget();
    if (!target) return;

    let toasted: Group[];
    if (remainingIds === null) {
      toasted = [...target];
    } else {
      const idSet = new Set(remainingIds);
      toasted = target.filter((g) => idSet.has(g.id));
    }
    const ids = toasted.map((g) => g.id);

    if (ids.length === 1) {
      this.groupsStore.deleteGroup(ids[0]!);
      this.linksStore.removeGroup(ids[0]!);
      this.messages.add({
        severity: 'success',
        summary: this.translate.instant('groups.toasts.deleted_single', {
          name: toasted[0]!.name,
        }),
        life: 3000,
      });
    } else {
      this.groupsStore.deleteGroups(ids);
      for (const id of ids) this.linksStore.removeGroup(id);
      this.messages.add({
        severity: 'success',
        summary: this.translate.instant('groups.toasts.deleted_bulk', { count: ids.length }),
        life: 3000,
      });
    }

    this.deleteTarget.set(null);
    this.clearSelection();
  }

  protected cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  protected onContextMenu(event: MouseEvent, groupId: number): void {
    event.preventDefault();
    const { x, y } = clampToViewport(event.clientX, event.clientY);
    this.contextMenu.set({ x, y, groupId });
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
    void this.router.navigateByUrl(`/admin/grupos/editar/${ctx.groupId}`);
  }

  protected onContextDuplicate(): void {
    const ctx = this.contextMenu();
    if (!ctx) return;
    const group = this.groups().find((g) => g.id === ctx.groupId);
    this.contextMenu.set(null);
    if (group) this.onRowDuplicate(group);
  }

  protected onContextDelete(): void {
    const ctx = this.contextMenu();
    if (!ctx) return;
    const group = this.groups().find((g) => g.id === ctx.groupId);
    if (group) this.deleteTarget.set([group]);
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
      this.translate.instant('groups.export.code'),
      this.translate.instant('groups.export.name'),
      this.translate.instant('groups.export.phone'),
      this.translate.instant('groups.export.priority'),
      this.translate.instant('groups.export.strategy'),
      this.translate.instant('groups.export.channels'),
      this.translate.instant('groups.export.agent_count'),
    ];
    const rows = this.sorted().map((g) => [
      g.code,
      g.name,
      g.phone,
      this.translate.instant(this.priorityKeys[g.priority]),
      g.strategy,
      g.channels.map((c) => this.translate.instant(this.channelKeys[c])).join(', '),
      this.assignedCountForGroup(g.id),
    ]);
    this.xlsx.export({
      headers,
      rows,
      sheetName: this.translate.instant('groups.export.sheet'),
      filePrefix: 'grupos',
    });
  }
}
