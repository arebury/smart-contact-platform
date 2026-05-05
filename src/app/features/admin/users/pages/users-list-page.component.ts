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
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-angular';
import { MessageService } from 'primeng/api';

import { ClickOutsideDirective } from '@core/directives';
import { BreadcrumbService, XlsxExportService } from '@core/services';
import { BulkActionBarComponent, DeleteEntityDialogComponent } from '@shared/components';
import { USER_TYPE_LABEL_KEYS, User, UserType } from '../data/users-data';
import { UsersStore } from '../state/users.store';

type SortField = 'name' | 'email' | 'type' | 'identifier' | 'status';

interface ContextMenuPos {
  readonly x: number;
  readonly y: number;
  readonly userId: number;
}

@Component({
  selector: 'aed-users-list-page',
  standalone: true,
  imports: [
    BulkActionBarComponent,
    ClickOutsideDirective,
    DeleteEntityDialogComponent,
    LucideAngularModule,
    TranslateModule,
  ],
  templateUrl: './users-list-page.component.html',
  styleUrl: './users-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListPageComponent implements OnInit, OnDestroy {
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly usersStore = inject(UsersStore);
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

  protected readonly typeLabelKeys = USER_TYPE_LABEL_KEYS;
  protected readonly users = this.usersStore.users;

  protected readonly searchQuery = signal('');
  protected readonly sortField = signal<SortField | null>(null);
  protected readonly sortDir = signal<'asc' | 'desc'>('asc');
  protected readonly selectedIds = signal<ReadonlySet<number>>(new Set());
  protected readonly contextMenu = signal<ContextMenuPos | null>(null);
  protected readonly openMenuId = signal<number | null>(null);
  protected readonly deleteTarget = signal<readonly User[] | null>(null);

  protected readonly filtered = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const all = this.users();
    if (!q) return all;
    return all.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.identifier.toLowerCase().includes(q) ||
        this.translate.instant(this.typeLabelKeys[u.type]).toLowerCase().includes(q),
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
          cmp = this.translate
            .instant(this.typeLabelKeys[a.type])
            .localeCompare(this.translate.instant(this.typeLabelKeys[b.type]));
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

  protected readonly allSelected = computed(() => {
    const sortedLen = this.sorted().length;
    return sortedLen > 0 && this.selectedIds().size === sortedLen;
  });

  protected readonly deleteItems = computed(() =>
    (this.deleteTarget() ?? []).map((u) => ({ id: u.id, name: u.name })),
  );

  protected readonly bulkEntity = {
    singular: 'usuario',
    plural: 'usuarios',
    suffixSingular: 'seleccionado',
    suffixPlural: 'seleccionados',
  } as const;

  ngOnInit(): void {
    this.breadcrumbs.set([
      { label: this.translate.instant('sidebar.administration'), path: '/admin/usuarios' },
      { label: this.translate.instant('sidebar.users') },
    ]);
  }

  ngOnDestroy(): void {
    this.breadcrumbs.clear();
  }

  protected typeLabel(type: UserType): string {
    return this.translate.instant(this.typeLabelKeys[type]);
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
      return new Set(sorted.map((u) => u.id));
    });
  }

  protected clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  protected onCreateClick(): void {
    void this.router.navigateByUrl('/admin/usuarios/crear');
  }

  protected onRowEdit(user: User): void {
    this.openMenuId.set(null);
    void this.router.navigateByUrl(`/admin/usuarios/editar/${user.id}`);
  }

  protected onRowDuplicate(user: User): void {
    const draft = this.usersStore.duplicate(user.id);
    this.openMenuId.set(null);
    if (!draft) return;
    this.messages.add({
      severity: 'success',
      summary: this.translate.instant('users.toasts.duplicated', { name: draft.name }),
      life: 3000,
    });
  }

  protected onRowDelete(user: User): void {
    this.deleteTarget.set([user]);
    this.openMenuId.set(null);
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
    this.contextMenu.set({ x: event.clientX, y: event.clientY, userId });
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
