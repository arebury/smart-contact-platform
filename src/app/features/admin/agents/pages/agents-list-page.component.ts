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
  BulkEditCommit,
  BulkEditFieldOption,
  BulkEditMenuComponent,
  ColumnDef,
  ColumnSelectorComponent,
  DeleteEntityDialogComponent,
  ImpactBadge,
  ImpactItem,
  ImpactPreviewDialogComponent,
  InlineRenameCellComponent,
} from '@shared/components';
import {
  AGENT_TYPE_LABEL_KEYS,
  Agent,
  AgentChannel,
  AgentType,
  PRESENCE_LABEL_KEYS,
  PresenceStatus,
} from '../data/agents-data';
import { AgentBulkField, AgentsStore } from '../state/agents.store';

type SortField = 'name' | 'code' | 'extension' | 'type' | 'status';

interface ContextMenuPos {
  readonly x: number;
  readonly y: number;
  readonly agentId: number;
}

interface PendingBulkEdit {
  readonly field: AgentBulkField;
  readonly fieldLabel: string;
  readonly value: unknown;
  readonly valueLabel: string;
}

const COLUMN_PREF_KEY = 'sc_agents_columns_v1';
const AGENT_TYPES: readonly AgentType[] = ['normal', 'cuscare', 'cuscare_carrier', 'admin_cuscare'];
const PRESENCE_STATES: readonly PresenceStatus[] = [
  'disponible',
  'no_disponible',
  'bano',
  'comida',
  'formacion',
];

@Component({
  selector: 'aed-agents-list-page',
  standalone: true,
  imports: [
    BulkActionBarComponent,
    BulkEditMenuComponent,
    ClickOutsideDirective,
    ColumnSelectorComponent,
    DeleteEntityDialogComponent,
    ImpactPreviewDialogComponent,
    InlineRenameCellComponent,
    LucideAngularModule,
    TranslateModule,
  ],
  templateUrl: './agents-list-page.component.html',
  styleUrl: './agents-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgentsListPageComponent implements OnInit, OnDestroy {
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly agentsStore = inject(AgentsStore);
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

  protected readonly typeKeys = AGENT_TYPE_LABEL_KEYS;
  protected readonly presenceKeys = PRESENCE_LABEL_KEYS;
  protected readonly presenceStates = PRESENCE_STATES;
  protected readonly agents = this.agentsStore.agents;

  protected readonly searchQuery = signal('');
  protected readonly sortField = signal<SortField | null>(null);
  protected readonly sortDir = signal<'asc' | 'desc'>('asc');
  protected readonly selectedIds = signal<ReadonlySet<number>>(new Set());
  protected readonly contextMenu = signal<ContextMenuPos | null>(null);
  protected readonly openMenuId = signal<number | null>(null);
  protected readonly deleteTarget = signal<readonly Agent[] | null>(null);
  protected readonly renamingId = signal<number | null>(null);
  protected readonly pendingBulkEdit = signal<PendingBulkEdit | null>(null);
  protected readonly columnPrefKey = COLUMN_PREF_KEY;
  protected readonly visibleColumns = signal<ReadonlySet<string>>(new Set());

  protected readonly columnDefs = computed<readonly ColumnDef[]>(() => [
    { key: 'code', label: this.translate.instant('agents.table.code') },
    { key: 'name', label: this.translate.instant('agents.table.name'), locked: true },
    { key: 'extension', label: this.translate.instant('agents.table.extension') },
    { key: 'channels', label: this.translate.instant('agents.table.channels') },
    { key: 'type', label: this.translate.instant('agents.table.type') },
    { key: 'presence', label: this.translate.instant('agents.table.presence') },
    { key: 'status', label: this.translate.instant('agents.table.status') },
    { key: 'groups', label: this.translate.instant('agents.table.groups') },
  ]);

  protected readonly bulkEditFields = computed<readonly BulkEditFieldOption[]>(() => [
    {
      key: 'status',
      label: this.translate.instant('agents.table.status'),
      values: [
        { value: 'active', label: this.translate.instant('agents.status.active') },
        { value: 'inactive', label: this.translate.instant('agents.status.inactive') },
      ],
    },
    {
      key: 'presenceStatus',
      label: this.translate.instant('agents.table.presence'),
      values: PRESENCE_STATES.map((p) => ({
        value: p,
        label: this.translate.instant(this.presenceKeys[p]),
      })),
    },
    {
      key: 'agentType',
      label: this.translate.instant('agents.table.type'),
      values: AGENT_TYPES.map((t) => ({
        value: t,
        label: this.translate.instant(this.typeKeys[t]),
      })),
    },
    {
      key: 'recording',
      label: this.translate.instant('agents.permission.recording'),
      values: [
        { value: 'true', label: this.translate.instant('common.yes') },
        { value: 'false', label: this.translate.instant('common.no') },
      ],
    },
  ]);

  protected readonly filtered = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const all = this.agents();
    if (!q) return all;
    return all.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.code.includes(q) ||
        a.extension.includes(q) ||
        (a.email?.toLowerCase().includes(q) ?? false),
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
        case 'extension':
          cmp = a.extension.localeCompare(b.extension);
          break;
        case 'type':
          cmp = a.agentType.localeCompare(b.agentType);
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
    const len = this.sorted().length;
    return len > 0 && this.selectedIds().size === len;
  });

  protected readonly deleteItems = computed(() =>
    (this.deleteTarget() ?? []).map((a) => ({ id: a.id, name: a.name })),
  );

  protected readonly bulkEntity = {
    singular: 'agente',
    plural: 'agentes',
    suffixSingular: 'seleccionado',
    suffixPlural: 'seleccionados',
  } as const;

  protected readonly impactItems = computed<readonly ImpactItem[]>(() => {
    const ids = this.selectedIds();
    return this.agents()
      .filter((a) => ids.has(a.id))
      .map((a) => ({ id: a.id, name: a.name, hint: `(ext. ${a.extension || '—'})` }));
  });

  protected readonly impactBadge = computed<ImpactBadge | null>(() => {
    const op = this.pendingBulkEdit();
    if (!op) return null;
    return { fieldLabel: op.fieldLabel, newValueLabel: op.valueLabel };
  });

  ngOnInit(): void {
    this.breadcrumbs.set([
      { label: this.translate.instant('sidebar.administration'), path: '/admin/usuarios' },
      { label: this.translate.instant('sidebar.agents') },
    ]);
  }

  ngOnDestroy(): void {
    this.breadcrumbs.clear();
  }

  protected channelIcon(channel: AgentChannel) {
    if (channel === 'phone') return this.phoneIcon;
    if (channel === 'chat') return this.chatIcon;
    return this.emailIcon;
  }

  protected isColVisible(key: string): boolean {
    const set = this.visibleColumns();
    // Until the ColumnSelector emits its first value the set is empty —
    // render every column so the table never appears collapsed.
    if (set.size === 0) return true;
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
      return new Set(sorted.map((a) => a.id));
    });
  }

  protected clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  protected onCreateClick(): void {
    void this.router.navigateByUrl('/admin/agentes/crear');
  }

  /** Row-body click → enter edit. Ignored if user is renaming this row. */
  protected onRowClick(agent: Agent): void {
    if (this.renamingId() === agent.id) return;
    void this.router.navigateByUrl(`/admin/agentes/editar/${agent.id}`);
  }

  protected onRowEdit(agent: Agent): void {
    this.openMenuId.set(null);
    void this.router.navigateByUrl(`/admin/agentes/editar/${agent.id}`);
  }

  protected onRowDuplicate(agent: Agent): void {
    const draft = this.agentsStore.duplicate(agent.id);
    this.openMenuId.set(null);
    if (!draft) return;
    // Enter inline-rename mode immediately so the user can refine the name
    // without a router round-trip.
    this.renamingId.set(draft.id);
  }

  protected onRowDelete(agent: Agent): void {
    this.deleteTarget.set([agent]);
    this.openMenuId.set(null);
  }

  protected onRenameCommit(id: number, value: string): void {
    this.agentsStore.updateAgent(id, { name: value });
    this.renamingId.set(null);
    this.messages.add({
      severity: 'success',
      summary: this.translate.instant('agents.toasts.duplicated', { name: value }),
      life: 3000,
    });
  }

  /** Cancel the inline rename — also drops the just-created draft so the user
   * doesn't end up with a stray "Copia de …" they didn't want. */
  protected onRenameCancel(id: number): void {
    const target = this.agentsStore.getAgent(id);
    this.renamingId.set(null);
    if (target?.isDraft) this.agentsStore.deleteAgent(id);
  }

  protected onPresenceChange(agent: Agent, event: Event): void {
    const value = (event.target as HTMLSelectElement).value as PresenceStatus;
    this.agentsStore.updatePresence(agent.id, value);
  }

  protected requestDeleteSelection(): void {
    const ids = this.selectedIds();
    const targets = this.agents().filter((a) => ids.has(a.id));
    if (targets.length > 0) this.deleteTarget.set(targets);
  }

  protected onBulkEditCommit(commit: BulkEditCommit): void {
    const field = commit.fieldKey as AgentBulkField;
    const value: unknown = field === 'recording' ? commit.value === 'true' : commit.value;
    this.pendingBulkEdit.set({
      field,
      fieldLabel: commit.fieldLabel,
      value,
      valueLabel: commit.valueLabel,
    });
  }

  protected onBulkPreviewConfirm(remainingIds: readonly number[]): void {
    const op = this.pendingBulkEdit();
    if (!op) return;
    this.agentsStore.bulkUpdate(remainingIds, op.field, op.value);
    this.pendingBulkEdit.set(null);
    this.clearSelection();
    this.messages.add({
      severity: 'success',
      summary: this.translate.instant('common.bulk_updated', { count: remainingIds.length }),
      life: 3000,
    });
  }

  protected onBulkPreviewCancel(): void {
    this.pendingBulkEdit.set(null);
  }

  protected confirmDelete(remainingIds: readonly number[] | null): void {
    const target = this.deleteTarget();
    if (!target) return;

    let toasted: Agent[];
    if (remainingIds === null) {
      toasted = [...target];
    } else {
      const idSet = new Set(remainingIds);
      toasted = target.filter((a) => idSet.has(a.id));
    }
    const ids = toasted.map((a) => a.id);

    if (ids.length === 1) {
      this.agentsStore.deleteAgent(ids[0]!);
      this.messages.add({
        severity: 'success',
        summary: this.translate.instant('agents.toasts.deleted_single', {
          name: toasted[0]!.name,
        }),
        life: 3000,
      });
    } else {
      this.agentsStore.deleteAgents(ids);
      this.messages.add({
        severity: 'success',
        summary: this.translate.instant('agents.toasts.deleted_bulk', { count: ids.length }),
        life: 3000,
      });
    }

    this.deleteTarget.set(null);
    this.clearSelection();
  }

  protected cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  protected onContextMenu(event: MouseEvent, agentId: number): void {
    event.preventDefault();
    this.contextMenu.set({ x: event.clientX, y: event.clientY, agentId });
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
    void this.router.navigateByUrl(`/admin/agentes/editar/${ctx.agentId}`);
  }

  protected onContextDuplicate(): void {
    const ctx = this.contextMenu();
    if (!ctx) return;
    const agent = this.agents().find((a) => a.id === ctx.agentId);
    this.contextMenu.set(null);
    if (agent) this.onRowDuplicate(agent);
  }

  protected onContextDelete(): void {
    const ctx = this.contextMenu();
    if (!ctx) return;
    const agent = this.agents().find((a) => a.id === ctx.agentId);
    if (agent) this.deleteTarget.set([agent]);
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
      this.translate.instant('agents.export.code'),
      this.translate.instant('agents.export.name'),
      this.translate.instant('agents.export.extension'),
      this.translate.instant('agents.export.type'),
      this.translate.instant('agents.export.email'),
      this.translate.instant('agents.export.status'),
      this.translate.instant('agents.export.groups'),
    ];
    const rows = this.sorted().map((a) => [
      a.code,
      a.name,
      a.extension,
      this.translate.instant(this.typeKeys[a.agentType]),
      a.email ?? '',
      this.translate.instant(`agents.status.${a.status}`),
      a.groups.map((g) => g.name).join(', '),
    ]);
    this.xlsx.export({
      headers,
      rows,
      sheetName: this.translate.instant('agents.export.sheet'),
      filePrefix: 'agentes',
    });
  }
}
