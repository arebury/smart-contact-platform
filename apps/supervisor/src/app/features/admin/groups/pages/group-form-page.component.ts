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
import {
  GitBranch,
  IdCard,
  LucideAngularModule,
  MessageSquare,
  Phone,
  Users as UsersIcon,
} from 'lucide-angular';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

import { DirtyAware } from '@core/guards';
import { CrossTabLockService } from '@core/services';
import {
  DeleteEntityDialogComponent,
  FormDangerZoneComponent,
  FormSectionNavComponent,
  type FormNavSection,
  IllustratedAvatarComponent,
  InputComponent,
  InputNumberComponent,
  ModalComponent,
  SectionCardComponent,
  SelectComponent,
  StickyFormHeaderComponent,
  ToggleSwitchComponent,
} from '@shared/components';
import { PrimeTemplate } from 'primeng/api';
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
  capacityValue: number | null;
  links: readonly GroupAgentLink[];
}

@Component({
  selector: 'sc-group-form-page',
  imports: [
    AgentChannelTableComponent,
    ButtonModule,
    DeleteEntityDialogComponent,
    FormDangerZoneComponent,
    FormSectionNavComponent,
    IllustratedAvatarComponent,
    InputComponent,
    InputNumberComponent,
    LucideAngularModule,
    ModalComponent,
    PrimeTemplate,
    SectionCardComponent,
    SelectComponent,
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
  /* Widening intencional a `Record<string, string>` para que el `let-p`
   * que llega desde `pTemplate` (tipo `any` por design de PrimeNG) pueda
   * indexar sin TS7053. Seguro: las keys vienen siempre de `priorities`
   * (GroupPriority union). Mismo patrón que agent-form-page. */
  protected readonly priorityKeys: Readonly<Record<string, string>> = PRIORITY_LABEL_KEYS;
  protected readonly channels = GROUP_CHANNELS;
  protected readonly channelKeys = CHANNEL_LABEL_KEYS;
  protected readonly phoneStrategies = PHONE_STRATEGIES;
  protected readonly chatStrategies = CHAT_STRATEGIES;

  /**
   * Section index for the form shell. In `edit` mode, Identity drops to
   * the end of the list — it's rarely touched once a group exists, so
   * the index leads with the sections the user actually iterates on.
   * Delete is *not* in the nav — it lives at the bottom of the Identity
   * tab (danger zone pattern, GitHub / Stripe).
   */
  protected readonly navSections = computed<readonly FormNavSection[]>(() => {
    const identity: FormNavSection = {
      id: 'group-section-identity',
      labelKey: 'groups.form.section.identity',
      icon: IdCard,
    };
    const channels: FormNavSection = {
      id: 'group-section-channels',
      labelKey: 'groups.form.section.channels',
      icon: MessageSquare,
    };
    const strategy: FormNavSection = {
      id: 'group-section-strategy',
      labelKey: 'groups.form.section.strategy',
      icon: GitBranch,
    };
    const agents: FormNavSection = {
      id: 'group-section-agents',
      labelKey: 'groups.form.section.agents',
      icon: UsersIcon,
    };
    if (this.mode() === 'edit') {
      return [channels, strategy, agents, identity];
    }
    return [identity, channels, strategy, agents];
  });

  protected readonly activeSection = signal<string>('group-section-identity');

  protected readonly activeIcon = computed(() => {
    const id = this.activeSection();
    return this.navSections().find((s) => s.id === id)?.icon ?? null;
  });

  protected readonly phoneIcon = Phone;

  protected readonly editingId = signal<number | null>(null);
  protected readonly initial = signal<Group | null>(null);
  protected readonly form = signal<FormState>(this.emptyForm());
  protected readonly errors = signal<Readonly<Record<string, string>>>({});
  protected readonly saving = signal(false);
  protected readonly deleteVisible = signal(false);

  /** Channels the group owned when the form was loaded — used to detect
   *  cascade impact when the user removes a channel before saving. */
  private readonly initialChannels = signal<ReadonlySet<GroupChannel>>(new Set());
  /** Links as they stood when the form was loaded — used to count how
   *  many agents had a removed channel enabled. */
  private readonly initialLinks = signal<readonly GroupAgentLink[]>([]);
  protected readonly cascadeConfirm = signal<{
    readonly removed: readonly GroupChannel[];
    readonly affected: number;
  } | null>(null);

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
      const seedLinks = this.linksStore.linksForGroup(group.id);
      this.form.set({
        name: group.name,
        phone: group.phone,
        priority: group.priority,
        typification: group.typification,
        channels: new Set(group.channels),
        strategy: group.strategy,
        chatStrategy: group.chatStrategy ?? CHAT_STRATEGIES[0]!,
        capacityValue: group.capacityValue ?? null,
        links: seedLinks,
      });
      this.initialChannels.set(new Set(group.channels));
      this.initialLinks.set(seedLinks);
      this.activeSection.set('group-section-channels');
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

  protected onPhoneValueChange(value: string): void {
    this.updateField('phone', value);
  }

  /**
   * Adapter para `<sc-input-number>` (capacityValue). Emite `number | null`;
   * un null → campo vacío, mantenemos el null en el form para que serialize
   * lo traduzca a `undefined`. Filtra valores negativos (defensa por si el
   * usuario teclea un signo: el min="0" del input ya lo bloquea normalmente).
   */
  protected onCapacityValueChange(value: number | null): void {
    if (value === null) {
      this.updateField('capacityValue', null);
      return;
    }
    if (Number.isFinite(value) && value >= 0) this.updateField('capacityValue', value);
  }

  protected onPriorityValueChange(value: unknown): void {
    if (typeof value === 'string') this.updateField('priority', value as GroupPriority);
  }

  protected onStrategyValueChange(value: unknown): void {
    if (typeof value === 'string') this.updateField('strategy', value);
  }

  protected onChatStrategyValueChange(value: unknown): void {
    if (typeof value === 'string') this.updateField('chatStrategy', value);
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

    // If the user removed any channel the group used to own, surface the
    // cascade impact before persisting. The dialog's "Continuar" handler
    // re-enters `save()` with `cascadeConfirm` already shown so this guard
    // only fires once per save.
    if (this.editingId() && !this.cascadeConfirm()) {
      const removed = [...this.initialChannels()].filter((c) => !this.form().channels.has(c));
      if (removed.length > 0) {
        const removedSet = new Set(removed);
        const affected = this.initialLinks().filter((l) =>
          l.channels.some((c) => removedSet.has(c)),
        ).length;
        if (affected > 0) {
          this.cascadeConfirm.set({ removed, affected });
          return;
        }
      }
    }

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
        capacityValue:
          f.channels.has('phone') && f.capacityValue !== null ? f.capacityValue : undefined,
        capacityType:
          f.channels.has('phone') && f.capacityValue !== null ? ('fixed' as const) : undefined,
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
        this.linksStore.replaceLinksForGroup(created.id, this.normalizeLinks(f.links, created.id));
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

  protected cancelCascade(): void {
    this.cascadeConfirm.set(null);
  }

  protected confirmCascade(): void {
    // Re-enter save() — the guard sees `cascadeConfirm` is set and skips the check.
    this.save();
    this.cascadeConfirm.set(null);
  }

  protected channelLabel(c: GroupChannel): string {
    return this.translate.instant(this.channelKeys[c]);
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
      capacityValue: null,
      links: [],
    };
  }

  /** Ensure every link points to the right groupId before persistence. */
  private normalizeLinks(
    links: readonly GroupAgentLink[],
    groupId: number,
  ): readonly GroupAgentLink[] {
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
