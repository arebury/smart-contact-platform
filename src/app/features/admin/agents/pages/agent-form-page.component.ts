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
import { MessageService } from 'primeng/api';

import { DirtyAware } from '@core/guards';
import { BreadcrumbService, CrossTabLockService } from '@core/services';
import {
  DeleteEntityDialogComponent,
  LabelChipComponent,
  PhotoUploadComponent,
  SectionCardComponent,
  StickyFormHeaderComponent,
} from '@shared/components';
import { LabelsStore } from '@features/admin/labels/state/labels.store';
import {
  AGENT_CHANNELS,
  AGENT_TYPES,
  AGENT_TYPE_LABEL_KEYS,
  Agent,
  AgentChannel,
  AgentGroupRef,
  AgentPermissions,
  AgentType,
  AVAILABLE_EXTENSIONS,
  AVAILABLE_GROUPS_REF,
  AVAILABLE_LANGUAGES,
  CALL_PERMISSIONS,
  DEFAULT_AGENT_PERMISSIONS,
  DEVICE_PERMISSIONS,
  ExtensionType,
  PRESENCE_LABEL_KEYS,
  PickupType,
  PresenceStatus,
  TRANSFER_PERMISSIONS,
} from '../data/agents-data';
import { AgentsStore } from '../state/agents.store';

interface FormState {
  name: string;
  extension: string;
  agentType: AgentType;
  channels: ReadonlySet<AgentChannel>;
  status: 'active' | 'inactive';
  presenceStatus: PresenceStatus;
  phone: string;
  email: string;
  pin: string;
  pickupType: PickupType;
  groupIds: ReadonlySet<number>;
  permissions: AgentPermissions;
  photo: string | null;
  languages: readonly string[];
  labelIds: ReadonlySet<number>;
}

const PIN_RE = /^\d{3,6}$/;
/** RFC-permissive email — accepts `user+tag@domain.tld` (delegate addresses). */
const EMAIL_RE = /^[^\s@]+(\+[^\s@]+)?@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'aed-agent-form-page',
  standalone: true,
  imports: [
    DeleteEntityDialogComponent,
    LabelChipComponent,
    PhotoUploadComponent,
    SectionCardComponent,
    StickyFormHeaderComponent,
    TranslateModule,
  ],
  templateUrl: './agent-form-page.component.html',
  styleUrl: './agent-form-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgentFormPageComponent implements DirtyAware, OnInit, OnDestroy {
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly agentsStore = inject(AgentsStore);
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly crossTab = inject(CrossTabLockService);
  private readonly labelsStore = inject(LabelsStore);

  protected readonly agentTypes = AGENT_TYPES;
  protected readonly typeLabelKeys = AGENT_TYPE_LABEL_KEYS;
  protected readonly presenceKeys = PRESENCE_LABEL_KEYS;
  protected readonly channels = AGENT_CHANNELS;
  protected readonly availableExtensions = AVAILABLE_EXTENSIONS;
  protected readonly availableGroups = AVAILABLE_GROUPS_REF;
  protected readonly availableLanguages = AVAILABLE_LANGUAGES;
  protected readonly availableLabels = this.labelsStore.labels;

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
  protected readonly devicePermissions = DEVICE_PERMISSIONS;
  protected readonly callPermissions = CALL_PERMISSIONS;
  protected readonly transferPermissions = TRANSFER_PERMISSIONS;
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
    if (!f.name.trim() || !f.extension || f.channels.size === 0) return false;
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
        channels: new Set(agent.channels),
        status: agent.status,
        presenceStatus: agent.presenceStatus ?? 'disponible',
        phone: agent.phone ?? '',
        email: agent.email ?? '',
        pin: agent.pin ?? '',
        pickupType: agent.pickupType ?? 'auto',
        groupIds: new Set(agent.groups.map((g) => g.id)),
        permissions: { ...agent.permissions },
        photo: agent.photo ?? null,
        languages: agent.languages ? [...agent.languages] : [],
        labelIds: new Set(agent.labels ?? []),
      });
      this.releaseLock = this.crossTab.acquire('agent', agent.id, () =>
        this.conflictWarning.set(true),
      );
    }

    this.breadcrumbs.set([
      { label: this.translate.instant('sidebar.administration'), path: '/admin/usuarios' },
      { label: this.translate.instant('sidebar.agents'), path: '/admin/agentes' },
      {
        label: this.translate.instant(
          this.editingId() ? 'agents.form.edit_breadcrumb' : 'agents.form.create_breadcrumb',
        ),
      },
    ]);
  }

  ngOnDestroy(): void {
    this.breadcrumbs.clear();
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

  protected onExtensionChange(event: Event): void {
    this.updateField('extension', (event.target as HTMLSelectElement).value);
  }

  protected getExtensionType(extension: string): ExtensionType | null {
    return this.availableExtensions.find((e) => e.number === extension)?.type ?? null;
  }

  protected onStatusToggle(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.updateField('status', checked ? 'active' : 'inactive');
  }

  protected toggleChannel(channel: AgentChannel): void {
    this.formDirty.set(true);
    this.form.update((f) => {
      const next = new Set(f.channels);
      if (next.has(channel)) next.delete(channel);
      else next.add(channel);
      return { ...f, channels: next };
    });
  }

  protected hasChannel(channel: AgentChannel): boolean {
    return this.form().channels.has(channel);
  }

  protected toggleGroup(id: number): void {
    this.formDirty.set(true);
    this.form.update((f) => {
      const next = new Set(f.groupIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...f, groupIds: next };
    });
  }

  protected hasGroup(id: number): boolean {
    return this.form().groupIds.has(id);
  }

  protected togglePermission(key: keyof AgentPermissions): void {
    this.formDirty.set(true);
    this.form.update((f) => ({
      ...f,
      permissions: { ...f.permissions, [key]: !f.permissions[key] },
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
      const groups: AgentGroupRef[] = this.availableGroups
        .filter((g) => f.groupIds.has(g.id))
        .map((g) => ({ ...g }));

      const payload: Omit<Agent, 'id' | 'code'> = {
        name: f.name.trim(),
        extension: f.extension,
        extensionType: this.getExtensionType(f.extension) ?? 'webrtc',
        agentType: f.agentType,
        channels: Array.from(f.channels),
        status: f.status,
        presenceStatus: f.presenceStatus,
        phone: f.phone.trim() || undefined,
        email: f.email.trim() || undefined,
        pin: f.pin.trim() || undefined,
        groups,
        permissions: f.permissions,
        pickupType: f.pickupType,
        photo: f.photo ?? undefined,
        languages: f.languages.length > 0 ? f.languages : undefined,
        labels: f.labelIds.size > 0 ? Array.from(f.labelIds) : undefined,
      };

      const editingId = this.editingId();
      if (editingId) {
        this.agentsStore.updateAgent(editingId, { ...payload, isDraft: undefined });
        this.messages.add({
          severity: 'success',
          summary: this.translate.instant('agents.toasts.updated', { name: payload.name }),
          life: 3000,
        });
      } else {
        const created = this.agentsStore.addAgent(payload);
        this.messages.add({
          severity: 'success',
          summary: this.translate.instant('agents.toasts.created', { name: created.name }),
          life: 3000,
        });
      }
      this.saving.set(false);
      this.formDirty.set(false);
      void this.router.navigateByUrl('/admin/agentes');
    }, 400);
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
      channels: new Set<AgentChannel>(['phone']),
      status: 'active',
      presenceStatus: 'disponible',
      phone: '',
      email: '',
      pin: '',
      pickupType: 'auto',
      groupIds: new Set(),
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
    if (f.channels.size === 0) next['channels'] = 'agents.errors.channels_required';
    const email = f.email.trim();
    if (email && !EMAIL_RE.test(email)) next['email'] = 'agents.errors.email_invalid';
    const pin = f.pin.trim();
    if (pin && !PIN_RE.test(pin)) next['pin'] = 'agents.errors.pin_invalid';
    this.errors.set(next);
    return Object.keys(next).length === 0;
  }
}
