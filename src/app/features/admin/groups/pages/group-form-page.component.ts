import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LucideAngularModule, Phone } from 'lucide-angular';
import { MessageService } from 'primeng/api';

import { DirtyAware } from '@core/guards';
import { CrossTabLockService } from '@core/services';
import {
  DeleteEntityDialogComponent,
  FormDangerZoneComponent,
  FormSectionNavComponent,
  type FormNavSection,
  IllustratedAvatarComponent,
  SectionCardComponent,
  StickyFormHeaderComponent,
  ToggleSwitchComponent,
} from '@shared/components';
import {
  CHANNEL_LABEL_KEYS,
  CHAT_STRATEGIES,
  GROUP_CHANNELS,
  GROUP_PRIORITIES,
  Group,
  GroupChannel,
  GroupPriority,
  PHONE_STRATEGIES,
  PRIORITY_LABEL_KEYS,
} from '../data/groups-data';
import { GroupsStore } from '../state/groups.store';

import { AgentsStore } from '@features/admin/agents/state/agents.store';
import { GroupAgentLinksStore } from '@features/admin/services/group-agent-links.store';
import { GroupAgentLink } from '@features/admin/services/group-agent-links.types';

import {
  AgentChannelTableAgent,
  AgentChannelTableComponent,
} from '../components/agent-channel-table/agent-channel-table.component';

interface FormState {
  name: string;
  phone: string;
  priority: GroupPriority;
  typification: boolean;
  channels: ReadonlySet<GroupChannel>;
  strategy: string;
  chatStrategy: string;
  capacityValue: string;
  links: readonly GroupAgentLink[];
}

@Component({
  selector: 'aed-group-form-page',
  imports: [
    AgentChannelTableComponent,
    DeleteEntityDialogComponent,
    FormDangerZoneComponent,
    FormSectionNavComponent,
    IllustratedAvatarComponent,
    LucideAngularModule,
    SectionCardComponent,
    StickyFormHeaderComponent,
    ToggleSwitchComponent,
    TranslateModule,
  ],
  templateUrl: './group-form-page.component.html',
  styleUrl: './group-form-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupFormPageComponent implements DirtyAware, OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly groupsStore = inject(GroupsStore);
  private readonly agentsStore = inject(AgentsStore);
  private readonly linksStore = inject(GroupAgentLinksStore);
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly crossTab = inject(CrossTabLockService);

  protected readonly priorities = GROUP_PRIORITIES;
  protected readonly priorityKeys = PRIORITY_LABEL_KEYS;
  protected readonly channels = GROUP_CHANNELS;
  protected readonly channelKeys = CHANNEL_LABEL_KEYS;
  protected readonly phoneStrategies = PHONE_STRATEGIES;
  protected readonly chatStrategies = CHAT_STRATEGIES;

  protected readonly navSections: readonly FormNavSection[] = [
    { id: 'group-section-identity', labelKey: 'groups.form.section.identity' },
    { id: 'group-section-channels', labelKey: 'groups.form.section.channels' },
    { id: 'group-section-strategy', labelKey: 'groups.form.section.strategy' },
    { id: 'group-section-agents', labelKey: 'groups.form.section.agents' },
  ];

  protected readonly phoneIcon = Phone;

  protected readonly editingId = signal<number | null>(null);
  protected readonly initial = signal<Group | null>(null);
  protected readonly form = signal<FormState>(this.emptyForm());
  protected readonly errors = signal<Readonly<Record<string, string>>>({});
  protected readonly saving = signal(false);
  protected readonly deleteVisible = signal(false);

  readonly formDirty = signal(false);
  protected readonly conflictWarning = signal(false);
  private releaseLock: (() => void) | null = null;

  protected readonly mode = computed(() => (this.editingId() ? 'edit' : 'create'));

  protected readonly canSave = computed(() => {
    const f = this.form();
    return f.name.trim().length > 0 && f.channels.size > 0;
  });

  protected readonly hasChat = computed(() => this.form().channels.has('chat'));
  protected readonly hasFixedCapacity = computed(() => this.form().channels.has('phone'));

  /** Roster passed to the channel table — every agent in the system. */
  protected readonly availableAgents = computed<readonly AgentChannelTableAgent[]>(() =>
    this.agentsStore.agents().map((a) => ({
      id: a.id,
      name: a.name,
      photo: a.photo,
    })),
  );

  /** The form's group channels expressed as an array (for the table input). */
  protected readonly formGroupChannels = computed<readonly GroupChannel[]>(() =>
    GROUP_CHANNELS.filter((c) => this.form().channels.has(c)),
  );

  protected readonly deleteItems = computed(() => {
    const g = this.initial();
    return g ? [{ id: g.id, name: g.name }] : [];
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const group = this.groupsStore.getGroup(Number(idParam));
      if (!group) {
        void this.router.navigateByUrl('/admin/grupos', { replaceUrl: true });
        return;
      }
      this.editingId.set(group.id);
      this.initial.set(group);
      this.form.set({
        name: group.name,
        phone: group.phone,
        priority: group.priority,
        typification: group.typification,
        channels: new Set(group.channels),
        strategy: group.strategy,
        chatStrategy: group.chatStrategy ?? CHAT_STRATEGIES[0]!,
        capacityValue: group.capacityValue ?? '',
        links: this.linksStore.linksForGroup(group.id),
      });
      this.releaseLock = this.crossTab.acquire('group', group.id, () =>
        this.conflictWarning.set(true),
      );
    }
  }

  ngOnDestroy(): void {
    this.releaseLock?.();
    this.releaseLock = null;
  }

  @HostListener('window:beforeunload', ['$event'])
  protected onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.formDirty() && !this.saving()) event.preventDefault();
  }

  @HostListener('document:keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      if (this.canSave() && !this.saving()) this.save();
    }
  }

  protected updateField<K extends keyof FormState>(key: K, value: FormState[K]): void {
    this.formDirty.set(true);
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  protected onTextInput<K extends 'name' | 'phone' | 'capacityValue'>(key: K, event: Event): void {
    this.updateField(key, (event.target as HTMLInputElement).value);
  }

  protected onPriorityChange(event: Event): void {
    this.updateField('priority', (event.target as HTMLSelectElement).value as GroupPriority);
  }

  protected onStrategyChange(event: Event): void {
    this.updateField('strategy', (event.target as HTMLSelectElement).value);
  }

  protected onChatStrategyChange(event: Event): void {
    this.updateField('chatStrategy', (event.target as HTMLSelectElement).value);
  }

  protected onTypificationChange(checked: boolean): void {
    this.updateField('typification', checked);
  }

  protected toggleChannel(channel: GroupChannel): void {
    this.formDirty.set(true);
    this.form.update((f) => {
      const next = new Set(f.channels);
      if (next.has(channel)) next.delete(channel);
      else next.add(channel);
      // Clamp every link's channels to the new group offering.
      const allowed = next;
      const clampedLinks = f.links.map((l) => {
        const filtered = l.channels.filter((c) => allowed.has(c));
        return filtered.length === l.channels.length ? l : { ...l, channels: filtered };
      });
      return { ...f, channels: next, links: clampedLinks };
    });
  }

  protected hasChannel(channel: GroupChannel): boolean {
    return this.form().channels.has(channel);
  }

  protected onLinksChange(links: readonly GroupAgentLink[]): void {
    this.formDirty.set(true);
    this.form.update((f) => ({ ...f, links }));
  }

  protected onNameRename(name: string): void {
    this.updateField('name', name);
  }

  protected save(): void {
    if (!this.canSave() || this.saving()) return;
    if (!this.validate()) return;

    this.saving.set(true);
    setTimeout(() => {
      const f = this.form();
      const payload = {
        name: f.name.trim(),
        phone: f.phone.trim(),
        priority: f.priority,
        typification: f.typification,
        channels: Array.from(f.channels),
        strategy: f.strategy,
        chatStrategy: f.channels.has('chat') ? f.chatStrategy : undefined,
        capacityValue: f.channels.has('phone') ? f.capacityValue.trim() || undefined : undefined,
        capacityType:
          f.channels.has('phone') && f.capacityValue.trim() ? ('fixed' as const) : undefined,
      };

      const editingId = this.editingId();
      if (editingId) {
        this.groupsStore.updateGroup(editingId, { ...payload, isDraft: undefined });
        this.linksStore.replaceLinksForGroup(editingId, this.normalizeLinks(f.links, editingId));
        this.messages.add({
          severity: 'success',
          summary: this.translate.instant('groups.toasts.updated', { name: payload.name }),
          life: 3000,
        });
      } else {
        const created = this.groupsStore.addGroup(payload);
        this.linksStore.replaceLinksForGroup(
          created.id,
          this.normalizeLinks(f.links, created.id),
        );
        this.messages.add({
          severity: 'success',
          summary: this.translate.instant('groups.toasts.created', { name: created.name }),
          life: 3000,
        });
      }
      this.saving.set(false);
      this.formDirty.set(false);
      void this.router.navigateByUrl('/admin/grupos');
    }, 400);
  }

  protected cancel(): void {
    void this.router.navigateByUrl('/admin/grupos');
  }

  protected requestDelete(): void {
    if (this.editingId()) this.deleteVisible.set(true);
  }

  protected cancelDelete(): void {
    this.deleteVisible.set(false);
  }

  protected confirmDelete(): void {
    const id = this.editingId();
    if (!id) return;
    const group = this.initial();
    this.groupsStore.deleteGroup(id);
    this.linksStore.removeGroup(id);
    this.deleteVisible.set(false);
    this.formDirty.set(false);
    this.messages.add({
      severity: 'success',
      summary: this.translate.instant('groups.toasts.deleted_single', {
        name: group?.name ?? '',
      }),
      life: 3000,
    });
    void this.router.navigateByUrl('/admin/grupos');
  }

  private emptyForm(): FormState {
    return {
      name: '',
      phone: '',
      priority: 'Baja',
      typification: false,
      channels: new Set<GroupChannel>(['phone']),
      strategy: PHONE_STRATEGIES[0]!,
      chatStrategy: CHAT_STRATEGIES[0]!,
      capacityValue: '',
      links: [],
    };
  }

  /** Ensure every link points to the right groupId before persistence. */
  private normalizeLinks(links: readonly GroupAgentLink[], groupId: number): readonly GroupAgentLink[] {
    return links.map((l) => (l.groupId === groupId ? l : { ...l, groupId }));
  }

  private validate(): boolean {
    const f = this.form();
    const next: Record<string, string> = {};
    if (!f.name.trim()) next['name'] = 'groups.errors.name_required';
    if (f.channels.size === 0) next['channels'] = 'groups.errors.channels_required';
    this.errors.set(next);
    return Object.keys(next).length === 0;
  }
}
