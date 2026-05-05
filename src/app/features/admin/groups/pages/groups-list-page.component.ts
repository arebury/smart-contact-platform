import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  Copy,
  Download,
  LucideAngularModule,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-angular';
import { MessageService } from 'primeng/api';

import { ClickOutsideDirective } from '@core/directives';
import { BreadcrumbService, XlsxExportService } from '@core/services';
import {
  BulkActionBarComponent,
  DeleteEntityDialogComponent,
} from '@shared/components';
import {
  CHANNEL_LABEL_KEYS,
  Group,
  GroupChannel,
  PRIORITY_LABEL_KEYS,
} from '../data/groups-data';
import { GroupsStore } from '../state/groups.store';

type SortField = 'name' | 'code' | 'priority' | 'agents' | 'strategy';

interface ContextMenuPos {
  readonly x: number;
  readonly y: number;
  readonly groupId: number;
}

@Component({
  selector: 'aed-groups-list-page',
  standalone: true,
  imports: [
    BulkActionBarComponent,
    ClickOutsideDirective,
    DeleteEntityDialogComponent,
    LucideAngularModule,
    TranslateModule,
  ],
  templateUrl: './groups-list-page.component.html',
  styleUrl: './groups-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupsListPageComponent implements OnInit, OnDestroy {
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly groupsStore = inject(GroupsStore);
  private readonly xlsx = inject(XlsxExportService);
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);

  protected readonly plusIcon = Plus;
  protected readonly searchIcon = Search;
  protected readonly closeIcon = X;
  protected readonly downloadIcon = Download;
  protected readonly moreIcon = MoreHorizontal;
  protected readonly editIcon = Pencil;
  protected readonly trashIcon = Trash2;
  protected readonly copyIcon = Copy;
  protected readonly phoneIcon = Phone;
  protected readonly chatIcon = MessageSquare;
  protected readonly emailIcon = Mail;

  protected readonly priorityKeys = PRIORITY_LABEL_KEYS;
  protected readonly channelKeys = CHANNEL_LABEL_KEYS;
  protected readonly groups = this.groupsStore.groups;

  protected readonly searchQuery = signal('');
  protected readonly sortField = signal<SortField | null>(null);
  protected readonly sortDir = signal<'asc' | 'desc'>('asc');
  protected readonly selectedIds = signal<ReadonlySet<number>>(new Set());
  protected readonly contextMenu = signal<ContextMenuPos | null>(null);
  protected readonly openMenuId = signal<number | null>(null);
  protected readonly deleteTarget = signal<readonly Group[] | null>(null);

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
          cmp = a.assignedAgents.length - b.assignedAgents.length;
          break;
        case 'strategy':
          cmp = a.strategy.localeCompare(b.strategy);
          break;
      }
      return dir === 'asc' ? cmp : -cmp;
    });
    return list;
  });

  protected readonly allSelected = computed(() => {
    const len = this.sorted().length;
    return len > 0 && this.selectedIds().size === len;
  });

  protected readonly deleteItems = computed(() =>
    (this.deleteTarget() ?? []).map((g) => ({ id: g.id, name: g.name })),
  );

  protected readonly bulkEntity = {
    singular: 'grupo',
    plural: 'grupos',
    suffixSingular: 'seleccionado',
    suffixPlural: 'seleccionados',
  } as const;

  ngOnInit(): void {
    this.breadcrumbs.set([
      { label: this.translate.instant('sidebar.administration'), path: '/admin/usuarios' },
      { label: this.translate.instant('sidebar.groups') },
    ]);
  }

  ngOnDestroy(): void {
    this.breadcrumbs.clear();
  }

  protected channelIcon(channel: GroupChannel) {
    if (channel === 'phone') return this.phoneIcon;
    if (channel === 'chat') return this.chatIcon;
    return this.emailIcon;
  }

  protected toggleSort(field: SortField): void {
    if (this.sortField() === field) {
      this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortField.set(field);
      this.sortDir.set('asc');
    }
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
      return new Set(sorted.map((g) => g.id));
    });
  }

  protected clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  protected onCreateClick(): void {
    void this.router.navigateByUrl('/admin/grupos/crear');
  }

  protected onRowEdit(group: Group): void {
    this.openMenuId.set(null);
    void this.router.navigateByUrl(`/admin/grupos/editar/${group.id}`);
  }

  protected onRowDuplicate(group: Group): void {
    const draft = this.groupsStore.duplicate(group.id);
    this.openMenuId.set(null);
    if (!draft) return;
    this.messages.add({
      severity: 'success',
      summary: this.translate.instant('groups.toasts.duplicated', { name: draft.name }),
      life: 3000,
    });
  }

  protected onRowDelete(group: Group): void {
    this.deleteTarget.set([group]);
    this.openMenuId.set(null);
  }

  protected requestDeleteSelection(): void {
    const ids = this.selectedIds();
    const targets = this.groups().filter((g) => ids.has(g.id));
    if (targets.length > 0) this.deleteTarget.set(targets);
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
      this.messages.add({
        severity: 'success',
        summary: this.translate.instant('groups.toasts.deleted_single', {
          name: toasted[0]!.name,
        }),
        life: 3000,
      });
    } else {
      this.groupsStore.deleteGroups(ids);
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
    this.contextMenu.set({ x: event.clientX, y: event.clientY, groupId });
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
      g.assignedAgents.length,
    ]);
    this.xlsx.export({
      headers,
      rows,
      sheetName: this.translate.instant('groups.export.sheet'),
      filePrefix: 'grupos',
    });
  }
}
