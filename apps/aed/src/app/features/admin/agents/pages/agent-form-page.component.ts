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
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  ChevronDown,
  ChevronRight,
  FileStack,
  Globe,
  IdCard,
  Info,
  Key,
  LogIn,
  LucideAngularModule,
  Mail,
  MessageSquare,
  Phone,
  PhoneCall,
  Plug,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Tag,
  Users as UsersIcon,
  X,
} from 'lucide-angular';
import { MessageService } from 'primeng/api';

import { DirtyAware } from '@core/guards';
import { ConfirmHostService, CrossTabLockService } from '@core/services';
import { EMAIL_RE, PIN_RE } from '@core/utils/validators';
import {
  DeleteEntityDialogComponent,
  FormDangerZoneComponent,
  FormSectionNavComponent,
  type FormNavSection,
  LabelChipComponent,
  PhotoUploadComponent,
  SectionCardComponent,
  StickyFormHeaderComponent,
  ToggleSwitchComponent,
  TriStateCheckboxComponent,
  type TriState,
} from '@shared/components';
import { LabelsStore } from '@features/admin/labels/state/labels.store';
import { GroupsStore } from '@features/admin/groups/state/groups.store';
import { GroupAgentLinksStore } from '@features/admin/services/group-agent-links.store';
import { GroupAgentLink } from '@features/admin/services/group-agent-links.types';
import { TemplatesStore } from '@features/admin/templates/state/templates.store';
import {
  Template,
  TemplateType,
  TEMPLATE_TYPES,
} from '@features/admin/templates/data/templates-data';
import { AgendasStore, Agenda } from '@features/admin/repositories/instances/agendas';
import {
  AGENT_TYPES,
  AGENT_TYPE_LABEL_KEYS,
  Agent,
  AgentPermissions,
  AgentType,
  AVAILABLE_EXTENSIONS,
  AVAILABLE_LANGUAGES,
  DEFAULT_AGENT_PERMISSIONS,
  ExtensionType,
  PRESENCE_LABEL_KEYS,
  PickupType,
  PresenceStatus,
} from '../data/agents-data';
import { AgentsStore } from '../state/agents.store';
import {
  AgentGroupAssignmentRef,
  GroupAssignmentTableComponent,
} from '../components/group-assignment-table/group-assignment-table.component';

type DestinoKey = 'fijos' | 'moviles' | 'internacionales' | 'especial';
type DestinoCol = 'llamada' | 'transferencia';

/**
 * Maps the (destino × call/transfer) matrix cells to the flat
 * `AgentPermissions` keys. Mirrors the destino taxonomy used by the
 * canonical `/admin/aed/agentes` defaults page so both forms share the
 * same mental model.
 */
const PERMISSION_MATRIX_KEYS: Readonly<
  Record<DestinoKey, Record<DestinoCol, keyof AgentPermissions>>
> = {
  fijos: { llamada: 'callsDestFixed', transferencia: 'transfersDestFixed' },
  moviles: { llamada: 'callsDestMobile', transferencia: 'transfersDestMobile' },
  internacionales: {
    llamada: 'callsDestInternational',
    transferencia: 'transfersDestInternational',
  },
  especial: { llamada: 'callsDestSpecial', transferencia: 'transfersDestSpecial' },
};

interface FormState {
  name: string;
  extension: string;
  agentType: AgentType;
  status: 'active' | 'inactive';
  presenceStatus: PresenceStatus;
  phone: string;
  email: string;
  pin: string;
  pickupType: PickupType;
  pickupTypeChat: PickupType;
  randomOrder: boolean;
  maxChats: number;
  iframeUrl: string;
  loginExtOverride: boolean;
  links: readonly GroupAgentLink[];
  permissions: AgentPermissions;
  photo: string | null;
  languages: readonly string[];
  labelIds: ReadonlySet<number>;
  scheduleIds: ReadonlySet<number>;
  templateIds: ReadonlySet<number>;
}

@Component({
  selector: 'sc-agent-form-page',
  imports: [
    DeleteEntityDialogComponent,
    FormDangerZoneComponent,
    FormSectionNavComponent,
    GroupAssignmentTableComponent,
    LabelChipComponent,
    LucideAngularModule,
    PhotoUploadComponent,
    SectionCardComponent,
    StickyFormHeaderComponent,
    ToggleSwitchComponent,
    TranslateModule,
    TriStateCheckboxComponent,
  ],
  templateUrl: './agent-form-page.component.html',
  styleUrl: './agent-form-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgentFormPageComponent implements DirtyAware, OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly agentsStore = inject(AgentsStore);
  private readonly groupsStore = inject(GroupsStore);
  private readonly linksStore = inject(GroupAgentLinksStore);
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly crossTab = inject(CrossTabLockService);
  private readonly labelsStore = inject(LabelsStore);
  private readonly templatesStore = inject(TemplatesStore);
  private readonly agendasStore = inject(AgendasStore);
  private readonly confirmHost = inject(ConfirmHostService);

  protected readonly mailIcon = Mail;
  protected readonly phoneIcon = Phone;
  protected readonly phoneCallIcon = PhoneCall;
  protected readonly shieldIcon = ShieldCheck;
  protected readonly infoIcon = Info;
  protected readonly tagIcon = Tag;
  protected readonly slidersIcon = SlidersHorizontal;
  protected readonly plugIcon = Plug;
  protected readonly globeIcon = Globe;
  protected readonly settingsIcon = Settings;
  protected readonly chevronDownIcon = ChevronDown;
  protected readonly chevronRightIcon = ChevronRight;
  protected readonly searchIcon = Search;
  protected readonly xIcon = X;
  protected readonly fileStackIcon = FileStack;
  protected readonly chatIcon = MessageSquare;
  protected readonly logInIcon = LogIn;
  protected readonly keyIcon = Key;

  /** Open state of each accordion sub-section inside "Configuración avanzada".
   * All start collapsed so the section reads as a quiet summary (count
   * badges) until the user drills in — DD#57. */
  protected readonly labelsAccOpen = signal(false);
  protected readonly agendasAccOpen = signal(false);
  protected readonly templatesAccOpen = signal(false);

  protected toggleLabelsAcc(): void {
    this.labelsAccOpen.update((v) => !v);
  }
  protected toggleAgendasAcc(): void {
    this.agendasAccOpen.update((v) => !v);
  }
  protected toggleTemplatesAcc(): void {
    this.templatesAccOpen.update((v) => !v);
  }

  /** Filter inputs for the in-sub-section search boxes. */
  protected readonly scheduleSearch = signal('');
  protected readonly templateSearch = signal('');
  protected readonly templateTab = signal<TemplateType>('chat');

  protected onScheduleSearchInput(event: Event): void {
    this.scheduleSearch.set((event.target as HTMLInputElement).value);
  }
  protected clearScheduleSearch(): void {
    this.scheduleSearch.set('');
  }
  protected onTemplateSearchInput(event: Event): void {
    this.templateSearch.set((event.target as HTMLInputElement).value);
  }
  protected clearTemplateSearch(): void {
    this.templateSearch.set('');
  }
  protected setTemplateTab(tab: TemplateType): void {
    this.templateTab.set(tab);
    this.templateSearch.set('');
  }

  protected readonly templateTypes = TEMPLATE_TYPES;

  /** Choices for the "Chats simultáneos" select inside Comportamiento. */
  protected readonly maxChatsOptions: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  protected readonly agentTypes = AGENT_TYPES;
  protected readonly typeLabelKeys = AGENT_TYPE_LABEL_KEYS;
  protected readonly presenceKeys = PRESENCE_LABEL_KEYS;
  protected readonly availableExtensions = AVAILABLE_EXTENSIONS;
  protected readonly availableLanguages = AVAILABLE_LANGUAGES;
  protected readonly availableLabels = this.labelsStore.labels;

  /** Roster of every group in the system, with channels — fed to the
   * group-assignment table so it can render the correct chip cluster
   * per row and the picker dropdown of joinable groups. */
  protected readonly availableGroups = computed<readonly AgentGroupAssignmentRef[]>(() =>
    this.groupsStore.groups().map((g) => ({
      id: g.id,
      name: g.name,
      channels: g.channels,
    })),
  );

  /** Selected labels resolved to {id, name, color} for chip rendering. */
  protected readonly selectedLabelChips = computed(() => {
    const ids = this.form().labelIds;
    return this.labelsStore
      .labels()
      .filter((label) => ids.has(label.id))
      .map((label) => ({ id: label.id, name: label.name, color: label.color }));
  });

  /** Labels still available to add — current store minus already-selected. */
  protected readonly addableLabels = computed(() => {
    const ids = this.form().labelIds;
    return this.labelsStore.labels().filter((label) => !ids.has(label.id));
  });

  /** All agendas from the repository store. Source of truth lives in
   * `Repositorios > Agendas`; this form just reads + assigns. */
  protected readonly availableSchedules = this.agendasStore.items;

  /** Agendas filtered by the in-sub-section search box. */
  protected readonly filteredSchedules = computed<readonly Agenda[]>(() => {
    const q = this.scheduleSearch().trim().toLowerCase();
    const all = this.availableSchedules();
    if (!q) return all;
    return all.filter(
      (a) => a.name.toLowerCase().includes(q) || a.numbers.toLowerCase().includes(q),
    );
  });

  protected readonly assignedSchedules = computed<readonly Agenda[]>(() => {
    const ids = this.form().scheduleIds;
    return this.availableSchedules().filter((a) => ids.has(a.id));
  });

  protected toggleSchedule(id: number): void {
    this.formDirty.set(true);
    this.form.update((f) => {
      const next = new Set(f.scheduleIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...f, scheduleIds: next };
    });
  }

  protected removeSchedule(id: number): void {
    this.formDirty.set(true);
    this.form.update((f) => {
      const next = new Set(f.scheduleIds);
      next.delete(id);
      return { ...f, scheduleIds: next };
    });
  }

  /** All templates from the templates store. */
  protected readonly availableTemplates = this.templatesStore.templates;

  /** Templates filtered by current tab + search. */
  protected readonly filteredTemplates = computed<readonly Template[]>(() => {
    const tab = this.templateTab();
    const q = this.templateSearch().trim().toLowerCase();
    return this.availableTemplates().filter(
      (t) =>
        t.type === tab &&
        (q === '' || t.title.toLowerCase().includes(q) || t.body.toLowerCase().includes(q)),
    );
  });

  /** Per-tab counts for the chat/email tab headers — "n/total". */
  protected readonly templateTabCounts = computed(() => {
    const ids = this.form().templateIds;
    const all = this.availableTemplates();
    const tally = (tab: TemplateType) => {
      const inTab = all.filter((t) => t.type === tab);
      const assigned = inTab.filter((t) => ids.has(t.id)).length;
      return { total: inTab.length, assigned };
    };
    return { chat: tally('chat'), email: tally('email') };
  });

  /** Tri-state for the table header select-all checkbox over the
   * currently-visible (filtered) templates. */
  protected readonly filteredTemplatesState = computed<TriState>(() => {
    const visible = this.filteredTemplates();
    if (visible.length === 0) return 'none';
    const ids = this.form().templateIds;
    const selected = visible.filter((t) => ids.has(t.id)).length;
    if (selected === 0) return 'none';
    if (selected === visible.length) return 'all';
    return 'some';
  });

  protected toggleTemplate(id: number): void {
    this.formDirty.set(true);
    this.form.update((f) => {
      const next = new Set(f.templateIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...f, templateIds: next };
    });
  }

  protected toggleAllFilteredTemplates(next: boolean): void {
    const visible = this.filteredTemplates();
    if (visible.length === 0) return;
    this.formDirty.set(true);
    this.form.update((f) => {
      const updated = new Set(f.templateIds);
      for (const t of visible) {
        if (next) updated.add(t.id);
        else updated.delete(t.id);
      }
      return { ...f, templateIds: updated };
    });
  }
  /**
   * Section index for the form shell. In `edit` mode, Identity drops to
   * the end of the list — once the agent exists, you rarely re-edit
   * identity fields, so the index leads with what gets iterated on.
   * Delete is *not* in the nav — it lives at the bottom of the Identity
   * tab (danger zone pattern, GitHub / Stripe).
   */
  protected readonly navSections = computed<readonly FormNavSection[]>(() => {
    const identity: FormNavSection = {
      id: 'agent-section-identity',
      labelKey: 'agents.form.section.identification',
      icon: IdCard,
    };
    const groups: FormNavSection = {
      id: 'agent-section-groups',
      labelKey: 'agents.form.section.groups',
      icon: UsersIcon,
    };
    const permissions: FormNavSection = {
      id: 'agent-section-permissions',
      labelKey: 'agents.form.section.permissions',
      icon: ShieldCheck,
    };
    const advanced: FormNavSection = {
      id: 'agent-section-advanced',
      labelKey: 'agents.form.section.advanced',
      icon: SlidersHorizontal,
    };
    if (this.mode() === 'edit') {
      return [groups, permissions, advanced, identity];
    }
    return [identity, groups, permissions, advanced];
  });

  protected readonly activeSection = signal<string>('agent-section-identity');

  protected readonly activeIcon = computed(() => {
    const id = this.activeSection();
    return this.navSections().find((s) => s.id === id)?.icon ?? null;
  });

  /**
   * Matrix layout for the calls/transfers permissions, matching the
   * canonical `sc-agentes` defaults page. Rows are destination categories,
   * columns are llamada/transferencia. Each (row, col) maps to one flat
   * `AgentPermissions` key.
   */
  protected readonly destinoKeys: readonly DestinoKey[] = [
    'fijos',
    'moviles',
    'internacionales',
    'especial',
  ];

  protected readonly columnState = computed<Record<DestinoCol, TriState>>(() => {
    const p = this.form().permissions;
    const tally = (col: DestinoCol): TriState => {
      const checked = this.destinoKeys.filter((k) => p[PERMISSION_MATRIX_KEYS[k][col]]).length;
      if (checked === 0) return 'none';
      if (checked === this.destinoKeys.length) return 'all';
      return 'some';
    };
    return { llamada: tally('llamada'), transferencia: tally('transferencia') };
  });

  protected matrixValue(row: DestinoKey, col: DestinoCol): boolean {
    return this.form().permissions[PERMISSION_MATRIX_KEYS[row][col]];
  }

  protected toggleMatrix(row: DestinoKey, col: DestinoCol): void {
    this.togglePermission(PERMISSION_MATRIX_KEYS[row][col]);
  }

  protected toggleColumnAll(col: DestinoCol, next: boolean): void {
    this.formDirty.set(true);
    this.form.update((f) => {
      const permissions = { ...f.permissions };
      for (const row of this.destinoKeys) {
        permissions[PERMISSION_MATRIX_KEYS[row][col]] = next;
      }
      return { ...f, permissions };
    });
  }
  protected readonly presenceStates: readonly PresenceStatus[] = [
    'disponible',
    'no_disponible',
    'bano',
    'comida',
    'formacion',
  ];

  protected readonly editingId = signal<number | null>(null);
  protected readonly initial = signal<Agent | null>(null);
  protected readonly form = signal<FormState>(this.emptyForm());
  protected readonly errors = signal<Readonly<Record<string, string>>>({});
  protected readonly saving = signal(false);
  protected readonly deleteVisible = signal(false);

  /** Set on the first user-triggered field change; cleared after save / delete. */
  readonly formDirty = signal(false);
  /** True while another tab also holds the edit lock (DD#169). */
  protected readonly conflictWarning = signal(false);
  private releaseLock: (() => void) | null = null;

  protected readonly mode = computed(() => (this.editingId() ? 'edit' : 'create'));

  protected readonly canSave = computed(() => {
    const f = this.form();
    if (!f.name.trim() || !f.extension) return false;
    if (f.email && !EMAIL_RE.test(f.email.trim())) return false;
    if (f.pin && !PIN_RE.test(f.pin.trim())) return false;
    return true;
  });

  protected readonly deleteItems = computed(() => {
    const a = this.initial();
    return a ? [{ id: a.id, name: a.name }] : [];
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const agent = this.agentsStore.getAgent(Number(idParam));
      if (!agent) {
        void this.router.navigateByUrl('/admin/agentes', { replaceUrl: true });
        return;
      }
      this.editingId.set(agent.id);
      this.initial.set(agent);
      this.form.set({
        name: agent.name,
        extension: agent.extension,
        agentType: agent.agentType,
        status: agent.status,
        presenceStatus: agent.presenceStatus ?? 'disponible',
        phone: agent.phone ?? '',
        email: agent.email ?? '',
        pin: agent.pin ?? '',
        pickupType: agent.pickupType ?? 'auto',
        pickupTypeChat: agent.pickupTypeChat ?? 'auto',
        randomOrder: agent.randomOrder ?? false,
        maxChats: agent.maxChats ?? 4,
        iframeUrl: agent.iframeUrl ?? '',
        loginExtOverride: agent.loginExtOverride ?? false,
        links: this.linksStore.linksForAgent(agent.id),
        permissions: { ...agent.permissions },
        photo: agent.photo ?? null,
        languages: agent.languages ? [...agent.languages] : [],
        labelIds: new Set(agent.labels ?? []),
        scheduleIds: new Set(agent.schedules ?? []),
        templateIds: new Set(agent.templates ?? []),
      });
      this.activeSection.set('agent-section-groups');
      this.releaseLock = this.crossTab.acquire('agent', agent.id, () =>
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

  protected onTextInput<K extends 'name' | 'phone' | 'email' | 'pin'>(key: K, event: Event): void {
    this.updateField(key, (event.target as HTMLInputElement).value);
  }

  protected onAgentTypeChange(event: Event): void {
    this.updateField('agentType', (event.target as HTMLSelectElement).value as AgentType);
  }

  protected onPresenceChange(event: Event): void {
    this.updateField('presenceStatus', (event.target as HTMLSelectElement).value as PresenceStatus);
  }

  protected onPickupChange(event: Event): void {
    this.updateField('pickupType', (event.target as HTMLSelectElement).value as PickupType);
  }

  protected onPickupChatChange(event: Event): void {
    this.updateField('pickupTypeChat', (event.target as HTMLSelectElement).value as PickupType);
  }

  protected onLoginExtOverrideChange(checked: boolean): void {
    this.updateField('loginExtOverride', checked);
  }

  protected async requestExpirePassword(): Promise<void> {
    const name = this.form().name || this.translate.instant('agents.entity_singular');
    const ok = await this.confirmHost.request({
      title: this.translate.instant('agents.form.advanced.sesion.expire_title'),
      body: this.translate.instant('agents.form.advanced.sesion.expire_body', { name }),
      acceptLabel: this.translate.instant('agents.form.advanced.sesion.expire_accept'),
      rejectLabel: this.translate.instant('common.cancel'),
      acceptTone: 'danger',
    });
    if (!ok) return;
    this.messages.add({
      severity: 'success',
      summary: this.translate.instant('agents.form.advanced.sesion.expire_toast', { name }),
      life: 3000,
    });
  }

  protected onRandomOrderChange(checked: boolean): void {
    this.updateField('randomOrder', checked);
  }

  protected onMaxChatsChange(event: Event): void {
    this.updateField('maxChats', Number((event.target as HTMLSelectElement).value));
  }

  protected onIframeUrlInput(event: Event): void {
    this.updateField('iframeUrl', (event.target as HTMLInputElement).value);
  }

  protected onExtensionChange(event: Event): void {
    this.updateField('extension', (event.target as HTMLSelectElement).value);
  }

  protected getExtensionType(extension: string): ExtensionType | null {
    return this.availableExtensions.find((e) => e.number === extension)?.type ?? null;
  }

  protected onStatusChange(checked: boolean): void {
    this.updateField('status', checked ? 'active' : 'inactive');
  }

  protected onLinksChange(links: readonly GroupAgentLink[]): void {
    this.formDirty.set(true);
    this.form.update((f) => ({ ...f, links }));
  }

  protected togglePermission(key: keyof AgentPermissions): void {
    this.formDirty.set(true);
    this.form.update((f) => ({
      ...f,
      permissions: { ...f.permissions, [key]: !f.permissions[key] },
    }));
  }

  protected onRecordingChange(checked: boolean): void {
    this.formDirty.set(true);
    this.form.update((f) => ({
      ...f,
      permissions: { ...f.permissions, recording: checked },
    }));
  }

  protected onPhotoChange(photo: string | null): void {
    this.formDirty.set(true);
    this.form.update((f) => ({ ...f, photo }));
  }

  protected onLanguageAdd(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const lang = select.value;
    select.value = '';
    if (!lang) return;
    this.form.update((f) =>
      f.languages.includes(lang) ? f : { ...f, languages: [...f.languages, lang] },
    );
    this.formDirty.set(true);
  }

  protected onLanguageRemove(lang: string): void {
    this.formDirty.set(true);
    this.form.update((f) => ({ ...f, languages: f.languages.filter((l) => l !== lang) }));
  }

  protected onLabelAdd(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const id = Number(select.value);
    select.value = '';
    if (!id) return;
    this.form.update((f) => {
      if (f.labelIds.has(id)) return f;
      const next = new Set(f.labelIds);
      next.add(id);
      return { ...f, labelIds: next };
    });
    this.formDirty.set(true);
  }

  protected onLabelRemove(id: number): void {
    this.formDirty.set(true);
    this.form.update((f) => {
      const next = new Set(f.labelIds);
      next.delete(id);
      return { ...f, labelIds: next };
    });
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

      const payload: Omit<Agent, 'id' | 'code'> = {
        name: f.name.trim(),
        extension: f.extension,
        extensionType: this.getExtensionType(f.extension) ?? 'webrtc',
        agentType: f.agentType,
        status: f.status,
        presenceStatus: f.presenceStatus,
        phone: f.phone.trim() || undefined,
        email: f.email.trim() || undefined,
        pin: f.pin.trim() || undefined,
        permissions: f.permissions,
        pickupType: f.pickupType,
        pickupTypeChat: f.pickupTypeChat,
        randomOrder: f.randomOrder,
        maxChats: f.maxChats,
        iframeUrl: f.iframeUrl.trim() || undefined,
        loginExtOverride: f.loginExtOverride,
        photo: f.photo ?? undefined,
        languages: f.languages.length > 0 ? f.languages : undefined,
        labels: f.labelIds.size > 0 ? Array.from(f.labelIds) : undefined,
        schedules: f.scheduleIds.size > 0 ? Array.from(f.scheduleIds) : undefined,
        templates: f.templateIds.size > 0 ? Array.from(f.templateIds) : undefined,
      };

      const editingId = this.editingId();
      if (editingId) {
        this.agentsStore.updateAgent(editingId, { ...payload, isDraft: undefined });
        this.linksStore.replaceLinksForAgent(editingId, this.normalizeLinks(f.links, editingId));
        const refreshed = this.agentsStore.getAgent(editingId);
        if (refreshed) this.initial.set(refreshed);
        this.messages.add({
          severity: 'success',
          summary: this.translate.instant('agents.toasts.updated', { name: payload.name }),
          life: 3000,
        });
      } else {
        const created = this.agentsStore.addAgent(payload);
        this.linksStore.replaceLinksForAgent(created.id, this.normalizeLinks(f.links, created.id));
        this.editingId.set(created.id);
        this.initial.set(created);
        this.location.replaceState(`/admin/agentes/editar/${created.id}`);
        this.releaseLock?.();
        this.releaseLock = this.crossTab.acquire('agent', created.id, () =>
          this.conflictWarning.set(true),
        );
        this.messages.add({
          severity: 'success',
          summary: this.translate.instant('agents.toasts.created', { name: created.name }),
          life: 3000,
        });
      }
      this.saving.set(false);
      this.formDirty.set(false);
    }, 400);
  }

  /** Ensure every link points at the right agentId before persistence. */
  private normalizeLinks(
    links: readonly GroupAgentLink[],
    agentId: number,
  ): readonly GroupAgentLink[] {
    return links.map((l) => (l.agentId === agentId ? l : { ...l, agentId }));
  }

  protected cancel(): void {
    void this.router.navigateByUrl('/admin/agentes');
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
    const agent = this.initial();
    this.agentsStore.deleteAgent(id);
    this.linksStore.removeAgent(id);
    this.deleteVisible.set(false);
    this.formDirty.set(false);
    this.messages.add({
      severity: 'success',
      summary: this.translate.instant('agents.toasts.deleted_single', {
        name: agent?.name ?? '',
      }),
      life: 3000,
    });
    void this.router.navigateByUrl('/admin/agentes');
  }

  private emptyForm(): FormState {
    return {
      name: '',
      extension: '',
      agentType: 'normal',
      status: 'active',
      presenceStatus: 'disponible',
      phone: '',
      email: '',
      pin: '',
      pickupType: 'auto',
      pickupTypeChat: 'auto',
      randomOrder: false,
      maxChats: 4,
      iframeUrl: '',
      loginExtOverride: false,
      links: [],
      permissions: { ...DEFAULT_AGENT_PERMISSIONS },
      photo: null,
      languages: [],
      labelIds: new Set(),
      scheduleIds: new Set(),
      templateIds: new Set(),
    };
  }

  private validate(): boolean {
    const f = this.form();
    const next: Record<string, string> = {};
    if (!f.name.trim()) next['name'] = 'agents.errors.name_required';
    if (!f.extension) next['extension'] = 'agents.errors.extension_required';
    const email = f.email.trim();
    if (email && !EMAIL_RE.test(email)) next['email'] = 'agents.errors.email_invalid';
    const pin = f.pin.trim();
    if (pin && !PIN_RE.test(pin)) next['pin'] = 'agents.errors.pin_invalid';
    this.errors.set(next);
    return Object.keys(next).length === 0;
  }
}
