import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

import { BreadcrumbService } from '@core/services';
import {
  DeleteEntityDialogComponent,
  SectionCardComponent,
  StickyFormHeaderComponent,
} from '@shared/components';
import {
  AVAILABLE_SERVICES,
  DEFAULT_PERMISSIONS,
  DEFAULT_SECTIONS,
  PERMISSION_DEFS,
  SECTION_DEFS,
  USER_TYPES,
  USER_TYPE_LABEL_KEYS,
  User,
  UserPermissions,
  UserSections,
  UserType,
} from '../data/users-data';
import { UsersStore } from '../state/users.store';

interface FormState {
  name: string;
  email: string;
  identifier: string;
  type: UserType;
  status: 'active' | 'inactive';
  sections: UserSections;
  permissions: UserPermissions;
  groups: ReadonlySet<number>;
  services: ReadonlySet<string>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'aed-user-form-page',
  standalone: true,
  imports: [
    DeleteEntityDialogComponent,
    SectionCardComponent,
    StickyFormHeaderComponent,
    TranslateModule,
  ],
  templateUrl: './user-form-page.component.html',
  styleUrl: './user-form-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormPageComponent implements OnInit, OnDestroy {
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usersStore = inject(UsersStore);
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);

  protected readonly userTypes = USER_TYPES;
  protected readonly typeLabelKeys = USER_TYPE_LABEL_KEYS;
  protected readonly sectionDefs = SECTION_DEFS;
  protected readonly permissionDefs = PERMISSION_DEFS;
  protected readonly availableServices = AVAILABLE_SERVICES;

  protected readonly editingId = signal<number | null>(null);
  protected readonly initial = signal<User | null>(null);
  protected readonly form = signal<FormState>(this.emptyForm());
  protected readonly errors = signal<Readonly<Record<string, string>>>({});
  protected readonly saving = signal(false);
  protected readonly deleteVisible = signal(false);

  protected readonly mode = computed(() => (this.editingId() ? 'edit' : 'create'));

  protected readonly canSave = computed(() => {
    const f = this.form();
    return f.name.trim().length > 0 && EMAIL_RE.test(f.email.trim());
  });

  protected readonly deleteItems = computed(() => {
    const u = this.initial();
    return u ? [{ id: u.id, name: u.name }] : [];
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const user = this.usersStore.getUser(Number(idParam));
      if (!user) {
        void this.router.navigateByUrl('/admin/usuarios', { replaceUrl: true });
        return;
      }
      this.editingId.set(user.id);
      this.initial.set(user);
      this.form.set({
        name: user.name,
        email: user.email,
        identifier: user.identifier,
        type: user.type,
        status: user.status,
        sections: { ...user.sections },
        permissions: { ...user.permissions },
        groups: new Set(user.assignedGroups),
        services: new Set(user.assignedServices),
      });
    }

    this.breadcrumbs.set([
      { label: this.translate.instant('sidebar.administration'), path: '/admin/usuarios' },
      { label: this.translate.instant('sidebar.users'), path: '/admin/usuarios' },
      {
        label: this.translate.instant(
          this.editingId() ? 'users.form.edit_breadcrumb' : 'users.form.create_breadcrumb',
        ),
      },
    ]);
  }

  ngOnDestroy(): void {
    this.breadcrumbs.clear();
  }

  protected updateField<K extends keyof FormState>(key: K, value: FormState[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  protected onTextInput<K extends 'name' | 'email' | 'identifier'>(key: K, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.updateField(key, value);
  }

  protected onTypeChange(event: Event): void {
    this.updateField('type', (event.target as HTMLSelectElement).value as UserType);
  }

  protected onStatusToggle(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.updateField('status', checked ? 'active' : 'inactive');
  }

  protected toggleSection(key: keyof UserSections): void {
    this.form.update((f) => ({
      ...f,
      sections: { ...f.sections, [key]: !f.sections[key] },
    }));
  }

  protected togglePermission(key: keyof UserPermissions): void {
    this.form.update((f) => ({
      ...f,
      permissions: { ...f.permissions, [key]: !f.permissions[key] },
    }));
  }

  protected toggleGroup(id: number): void {
    this.form.update((f) => {
      const next = new Set(f.groups);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...f, groups: next };
    });
  }

  protected toggleService(name: string): void {
    this.form.update((f) => {
      const next = new Set(f.services);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return { ...f, services: next };
    });
  }

  protected hasService(name: string): boolean {
    return this.form().services.has(name);
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
        email: f.email.trim(),
        identifier: f.identifier.trim(),
        type: f.type,
        status: f.status,
        sections: f.sections,
        permissions: f.permissions,
        assignedGroups: Array.from(f.groups),
        assignedServices: Array.from(f.services),
      };

      const editingId = this.editingId();
      if (editingId) {
        this.usersStore.updateUser(editingId, { ...payload, isDraft: undefined });
        this.messages.add({
          severity: 'success',
          summary: this.translate.instant('users.toasts.updated', { name: payload.name }),
          life: 3000,
        });
      } else {
        const created = this.usersStore.addUser(payload);
        this.messages.add({
          severity: 'success',
          summary: this.translate.instant('users.toasts.created', { name: created.name }),
          life: 3000,
        });
      }

      this.saving.set(false);
      void this.router.navigateByUrl('/admin/usuarios');
    }, 400);
  }

  protected cancel(): void {
    void this.router.navigateByUrl('/admin/usuarios');
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
    const user = this.initial();
    this.usersStore.deleteUser(id);
    this.deleteVisible.set(false);
    this.messages.add({
      severity: 'success',
      summary: this.translate.instant('users.toasts.deleted_single', {
        name: user?.name ?? '',
      }),
      life: 3000,
    });
    void this.router.navigateByUrl('/admin/usuarios');
  }

  private emptyForm(): FormState {
    return {
      name: '',
      email: '',
      identifier: '',
      type: 'agent',
      status: 'active',
      sections: { ...DEFAULT_SECTIONS },
      permissions: { ...DEFAULT_PERMISSIONS },
      groups: new Set(),
      services: new Set(),
    };
  }

  private validate(): boolean {
    const f = this.form();
    const next: Record<string, string> = {};
    if (!f.name.trim()) next['name'] = 'users.errors.name_required';
    if (!EMAIL_RE.test(f.email.trim())) next['email'] = 'users.errors.email_invalid';
    this.errors.set(next);
    return Object.keys(next).length === 0;
  }
}
