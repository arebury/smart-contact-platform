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
  Info,
  Mail,
  Phone,
  PhoneCall,
  LucideAngularModule,
  ShieldCheck,
  Tag,
  SlidersHorizontal,
  Plug,
  Globe,
  Settings,
  ChevronDown,
  ChevronRight,
} from 'lucide-angular';
import { MessageService } from 'primeng/api';

import { DirtyAware } from '@core/guards';
import { CrossTabLockService } from '@core/services';
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
  randomOrder: boolean;
  maxChats: number;
  iframeUrl: string;
  links: readonly GroupAgentLink[];
  permissions: AgentPermissions;
  photo: string | null;
  languages: readonly string[];
  labelIds: ReadonlySet<number>;
}

@Component({
  selector: 'aed-agent-form-page',
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

  /** Open state of the Labels accordion inside "Configuración avanzada". */
  protected readonly labelsAccOpen = signal(true);

  protected toggleLabelsAcc(): void {
    this.labelsAccOpen.update((v) => !v);
  }

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
  protected readonly navSections: readonly FormNavSection[] = [
    { id: 'agent-section-identity', labelKey: 'agents.form.section.identification' },
    { id: 'agent-section-groups', labelKey: 'agents.form.section.groups' },
    { id: 'agent-section-permissions', labelKey: 'agents.form.section.permissions' },
    { id: 'agent-section-advanced', labelKey: 'agents.form.section.advanced' },
  ];

  /**
   * Matrix layout for the calls/transfers permissions, matching the
   * canonical `aed-agentes` defaults page. Rows are destination categories,
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
        randomOrder: agent.randomOrder ?? false,
        maxChats: agent.maxChats ?? 4,
        iframeUrl: agent.iframeUrl ?? '',
        links: this.linksStore.linksForAgent(agent.id),
        permissions: { ...agent.permissions },
        photo: agent.photo ?? null,
        languages: agent.languages ? [...agent.languages] : [],
        labelIds: new Set(agent.labels ?? []),
      });
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
        randomOrder: f.randomOrder,
        maxChats: f.maxChats,
        iframeUrl: f.iframeUrl.trim() || undefined,
        photo: f.photo ?? undefined,
        languages: f.languages.length > 0 ? f.languages : undefined,
        labels: f.labelIds.size > 0 ? Array.from(f.labelIds) : undefined,
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
      randomOrder: false,
      maxChats: 4,
      iframeUrl: '',
      links: [],
      permissions: { ...DEFAULT_AGENT_PERMISSIONS },
      photo: null,
      languages: [],
      labelIds: new Set(),
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
