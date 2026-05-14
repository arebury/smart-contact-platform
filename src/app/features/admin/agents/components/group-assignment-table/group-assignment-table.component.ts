import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Check, LucideAngularModule, Plus, Search, Trash2, Users2, X } from 'lucide-angular';

import { IllustratedAvatarComponent, ToggleSwitchComponent } from '@shared/components';

import { CHANNEL_LABEL_KEYS, GroupChannel } from '@features/admin/groups/data/groups-data';
import { Channel, GroupAgentLink } from '@features/admin/services/group-agent-links.types';

/** Lightweight group reference accepted by this table. */
export interface AgentGroupAssignmentRef {
  readonly id: number;
  readonly name: string;
  readonly channels: readonly GroupChannel[];
}

interface VisibleRow {
  readonly link: GroupAgentLink;
  readonly group: AgentGroupAssignmentRef;
}

/**
 * Per-(agent, group) permission editor for the agent form — the
 * symmetric counterpart of `AedAgentChannelTableComponent`.
 *
 * Layout (DD#54 §2.2):
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │ [picker: search + add group]   N grupos                      │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │ Grupo     │ Canales │ Sus canales aquí          │ Activo │ │
 *   │ Soporte L1│ ☎ 💬 ✉ │ [☑ Tel][☑ Chat][☐ Email] │  ●━○  │⋮│
 *   │ Ventas    │ ☎     │ [☑ Tel]                    │  ●━○  │⋮│
 *   └──────────────────────────────────────────────────────────────┘
 *
 * Heterogeneous rows: each group exposes its own channel offering, so
 * the cluster of chips per row varies in width. The "Canales del grupo"
 * column is read-only — it answers "why doesn't this row show Email?"
 * without leaving the form.
 *
 * Owns no persistence — the parent (agent form) holds the canonical
 * `links` array and writes to `GroupAgentLinksStore` on save.
 */
@Component({
  selector: 'aed-group-assignment-table',
  standalone: true,
  imports: [
    IllustratedAvatarComponent,
    LucideAngularModule,
    ToggleSwitchComponent,
    TranslateModule,
  ],
  templateUrl: './group-assignment-table.component.html',
  styleUrl: './group-assignment-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupAssignmentTableComponent {
  readonly links = input.required<readonly GroupAgentLink[]>();
  readonly availableGroups = input.required<readonly AgentGroupAssignmentRef[]>();
  readonly agentId = input.required<number>();

  readonly linksChange = output<readonly GroupAgentLink[]>();

  protected readonly searchIcon = Search;
  protected readonly closeIcon = X;
  protected readonly trashIcon = Trash2;
  protected readonly checkIcon = Check;
  protected readonly plusIcon = Plus;
  protected readonly emptyIcon = Users2;
  protected readonly channelKeys = CHANNEL_LABEL_KEYS;

  protected readonly pickerQuery = signal('');
  protected readonly pickerOpen = signal(false);

  /** Map groupId → AgentGroupAssignmentRef for fast row hydration. */
  private readonly groupById = computed(() => {
    const map = new Map<number, AgentGroupAssignmentRef>();
    for (const g of this.availableGroups()) map.set(g.id, g);
    return map;
  });

  protected readonly assignedRows = computed<readonly VisibleRow[]>(() => {
    const map = this.groupById();
    return this.links()
      .map((link) => {
        const group = map.get(link.groupId);
        return group ? { link, group } : null;
      })
      .filter((r): r is VisibleRow => r !== null);
  });

  /** Roster minus already-assigned, optionally filtered by the picker query. */
  protected readonly pickerCandidates = computed<readonly AgentGroupAssignmentRef[]>(() => {
    const used = new Set(this.links().map((l) => l.groupId));
    const q = this.pickerQuery().trim().toLowerCase();
    return this.availableGroups()
      .filter((g) => !used.has(g.id))
      .filter((g) => (q ? g.name.toLowerCase().includes(q) : true));
  });

  protected hasChannel(link: GroupAgentLink, channel: Channel): boolean {
    return link.channels.includes(channel);
  }

  // -- mutations --

  protected addGroup(group: AgentGroupAssignmentRef): void {
    if (this.links().some((l) => l.groupId === group.id)) return;
    const link: GroupAgentLink = {
      agentId: this.agentId(),
      groupId: group.id,
      // Default: every channel the group offers is on for new assignments.
      channels: [...group.channels],
      active: true,
    };
    this.linksChange.emit([...this.links(), link]);
    this.pickerQuery.set('');
  }

  protected removeRow(groupId: number): void {
    this.linksChange.emit(this.links().filter((l) => l.groupId !== groupId));
  }

  protected toggleChannel(groupId: number, channel: Channel): void {
    this.linksChange.emit(
      this.links().map((l) => {
        if (l.groupId !== groupId) return l;
        const has = l.channels.includes(channel);
        const channels = has
          ? l.channels.filter((c) => c !== channel)
          : this.canonicalize([...l.channels, channel]);
        return { ...l, channels };
      }),
    );
  }

  protected toggleActive(groupId: number, active: boolean): void {
    this.linksChange.emit(this.links().map((l) => (l.groupId === groupId ? { ...l, active } : l)));
  }

  // -- picker --

  protected openPicker(): void {
    this.pickerOpen.set(true);
  }

  protected closePicker(): void {
    this.pickerOpen.set(false);
    this.pickerQuery.set('');
  }

  protected onPickerInput(event: Event): void {
    this.pickerQuery.set((event.target as HTMLInputElement).value);
    this.pickerOpen.set(true);
  }

  protected onPickerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      const candidate = this.pickerCandidates()[0];
      if (candidate) this.addGroup(candidate);
    } else if (event.key === 'Escape') {
      this.closePicker();
    }
  }

  // -- helpers --

  private canonicalize(channels: readonly Channel[]): readonly Channel[] {
    const set = new Set(channels);
    const order: readonly Channel[] = ['phone', 'chat', 'email'];
    return order.filter((c) => set.has(c));
  }
}
