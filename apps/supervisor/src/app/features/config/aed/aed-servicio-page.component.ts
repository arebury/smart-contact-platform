import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { PageHeaderService } from '@core/services';
import {
  IconComponent,
  InputTextComponent,
  InputGroupComponent,
  InputNumberComponent,
  ToggleSwitchComponent,
} from '@shared/components';

interface VisibilidadEstados {
  postConversando: boolean;
  conversando: boolean;
  administrativo: boolean;
  noDisponible: boolean;
  desconectado: boolean;
}

interface EventosNotificacion {
  emision: boolean;
  llamadaEnCurso: boolean;
  llamadaNoAtendida: boolean;
  llamadaAtendida: boolean;
  llamadaFinalizada: boolean;
  llamadaRechazada: boolean;
}

interface FormState {
  estadosNoDisponibles: readonly string[];
  visibilidadEstados: VisibilidadEstados;
  filtrarEstados: boolean;
  trabajoAdministrativo: boolean;
  pausaStandard: number;
  pausaNavegador: number;
  tipoDescuelgue: string;
  alertingTipo: 'nombre' | 'telefono';
  callblendingUrl: string;
  callblendingTimeout: number;
  eventosNotificacion: EventosNotificacion;
}

const DESCUELGUE_OPTIONS = ['Manual', 'Automático', 'Automático con preview'] as const;

const DEFAULT_FORM: FormState = {
  estadosNoDisponibles: ['Baño', 'Comida', 'Formación', 'Otro'],
  visibilidadEstados: {
    postConversando: true,
    conversando: true,
    administrativo: true,
    noDisponible: true,
    desconectado: true,
  },
  filtrarEstados: true,
  trabajoAdministrativo: true,
  pausaStandard: 15,
  pausaNavegador: 3,
  tipoDescuelgue: DESCUELGUE_OPTIONS[0],
  alertingTipo: 'telefono',
  callblendingUrl: '',
  callblendingTimeout: 30,
  eventosNotificacion: {
    emision: true,
    llamadaEnCurso: true,
    llamadaNoAtendida: true,
    llamadaAtendida: true,
    llamadaFinalizada: true,
    llamadaRechazada: true,
  },
};

const VISIBILIDAD_LABELS: readonly { key: keyof VisibilidadEstados; tone: string }[] = [
  { key: 'postConversando', tone: 'cyan' },
  { key: 'conversando', tone: 'green' },
  { key: 'administrativo', tone: 'amber' },
  { key: 'noDisponible', tone: 'red' },
  { key: 'desconectado', tone: 'gray' },
];

const EVENTOS_LABELS: readonly (keyof EventosNotificacion)[] = [
  'emision',
  'llamadaEnCurso',
  'llamadaNoAtendida',
  'llamadaAtendida',
  'llamadaFinalizada',
  'llamadaRechazada',
];

/**
 * Servicio defaults page — `/config/aed/servicio`. Figma node 258:9396.
 *
 * Two SettingsCards stacked:
 *   1. **Estados** — custom unavailability tags, peer-state visibility,
 *      agent permissions (2 switches), idle pause defaults.
 *   2. **Conversaciones** — default pickup behaviour, alerting label
 *      preference, callblending webhook + event picker.
 *
 * Each card has its own dirty/save flow (per Figma — two footers,
 * two Guardar buttons). Discard reverts that card only.
 */
@Component({
  selector: 'sc-aed-servicio-page',
  imports: [
    ButtonModule,
    IconComponent,
    InputTextComponent,
    InputGroupComponent,
    InputNumberComponent,
    InputTextModule,
    ToggleSwitchComponent,
    TranslateModule,
  ],
  templateUrl: './aed-servicio-page.component.html',
  styleUrls: ['./aed-defaults-page.component.scss', './aed-servicio-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AedServicioPageComponent {
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly pageHeader = inject(PageHeaderService);

  constructor() {
    this.pageHeader.set({
      titleKey: 'config.aed.subpages.servicio.heading',
      subtitleKey: 'config.aed.subpages.servicio.subtitle',
      entityKey: 'config.sidebar.title',
      icon: 'call',
    });
  }

  protected readonly serviceIcon = 'call';
  protected readonly addIcon = 'add_circle';
  protected readonly closeIcon = 'close';
  protected readonly infoIcon = 'info';

  protected readonly descuelgueOptions = DESCUELGUE_OPTIONS;
  protected readonly visibilidadLabels = VISIBILIDAD_LABELS;
  protected readonly eventosLabels = EVENTOS_LABELS;

  protected readonly form = signal<FormState>(this.cloneDefault());

  protected readonly tagInput = signal('');
  protected readonly estadosDirty = signal(false);
  protected readonly estadosSaving = signal(false);
  protected readonly conversacionesDirty = signal(false);
  protected readonly conversacionesSaving = signal(false);

  protected readonly canSaveEstados = computed(() => this.estadosDirty() && !this.estadosSaving());
  protected readonly canSaveConversaciones = computed(
    () => this.conversacionesDirty() && !this.conversacionesSaving(),
  );

  /* ---------- Estados card actions ---------- */

  protected addTag(): void {
    const next = this.tagInput().trim();
    if (!next) return;
    if (this.form().estadosNoDisponibles.includes(next)) {
      this.tagInput.set('');
      return;
    }
    this.form.update((f) => ({
      ...f,
      estadosNoDisponibles: [...f.estadosNoDisponibles, next],
    }));
    this.tagInput.set('');
    this.estadosDirty.set(true);
  }

  protected removeTag(tag: string): void {
    this.form.update((f) => ({
      ...f,
      estadosNoDisponibles: f.estadosNoDisponibles.filter((t) => t !== tag),
    }));
    this.estadosDirty.set(true);
  }

  protected onTagKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTag();
    }
  }

  protected toggleVisibilidad(key: keyof VisibilidadEstados): void {
    this.form.update((f) => ({
      ...f,
      visibilidadEstados: {
        ...f.visibilidadEstados,
        [key]: !f.visibilidadEstados[key],
      },
    }));
    this.estadosDirty.set(true);
  }

  protected updateEstados<K extends 'filtrarEstados' | 'trabajoAdministrativo'>(
    key: K,
    value: FormState[K],
  ): void {
    this.form.update((f) => ({ ...f, [key]: value }));
    this.estadosDirty.set(true);
  }

  protected onPausaValueChange<K extends 'pausaStandard' | 'pausaNavegador'>(
    key: K,
    value: number | null,
  ): void {
    if (value !== null && Number.isFinite(value) && value >= 0) {
      this.form.update((f) => ({ ...f, [key]: value }));
      this.estadosDirty.set(true);
    }
  }

  protected discardEstados(): void {
    const def = this.cloneDefault();
    this.form.update((f) => ({
      ...f,
      estadosNoDisponibles: def.estadosNoDisponibles,
      visibilidadEstados: def.visibilidadEstados,
      filtrarEstados: def.filtrarEstados,
      trabajoAdministrativo: def.trabajoAdministrativo,
      pausaStandard: def.pausaStandard,
      pausaNavegador: def.pausaNavegador,
    }));
    this.estadosDirty.set(false);
  }

  protected saveEstados(): void {
    if (!this.canSaveEstados()) return;
    this.estadosSaving.set(true);
    setTimeout(() => {
      this.estadosSaving.set(false);
      this.estadosDirty.set(false);
      this.messages.add({
        severity: 'success',
        summary: this.translate.instant('config.aed.subpages.servicio.toast.estados_saved'),
        life: 3000,
      });
    }, 600);
  }

  /* ---------- Conversaciones card actions ---------- */

  protected onDescuelgueChange(event: Event): void {
    this.form.update((f) => ({
      ...f,
      tipoDescuelgue: (event.target as HTMLSelectElement).value,
    }));
    this.conversacionesDirty.set(true);
  }

  protected onAlertingChange(value: 'nombre' | 'telefono'): void {
    this.form.update((f) => ({ ...f, alertingTipo: value }));
    this.conversacionesDirty.set(true);
  }

  /** Adapter para `<sc-inputtext>` (emite `string`). */
  protected onCallblendingUrlValue(value: string): void {
    this.form.update((f) => ({ ...f, callblendingUrl: value }));
    this.conversacionesDirty.set(true);
  }

  protected onCallblendingTimeoutValueChange(value: number | null): void {
    if (value !== null && Number.isFinite(value) && value >= 0) {
      this.form.update((f) => ({ ...f, callblendingTimeout: value }));
      this.conversacionesDirty.set(true);
    }
  }

  protected toggleEvento(key: keyof EventosNotificacion): void {
    this.form.update((f) => ({
      ...f,
      eventosNotificacion: {
        ...f.eventosNotificacion,
        [key]: !f.eventosNotificacion[key],
      },
    }));
    this.conversacionesDirty.set(true);
  }

  protected discardConversaciones(): void {
    const def = this.cloneDefault();
    this.form.update((f) => ({
      ...f,
      tipoDescuelgue: def.tipoDescuelgue,
      alertingTipo: def.alertingTipo,
      callblendingUrl: def.callblendingUrl,
      callblendingTimeout: def.callblendingTimeout,
      eventosNotificacion: def.eventosNotificacion,
    }));
    this.conversacionesDirty.set(false);
  }

  protected saveConversaciones(): void {
    if (!this.canSaveConversaciones()) return;
    this.conversacionesSaving.set(true);
    setTimeout(() => {
      this.conversacionesSaving.set(false);
      this.conversacionesDirty.set(false);
      this.messages.add({
        severity: 'success',
        summary: this.translate.instant('config.aed.subpages.servicio.toast.conversaciones_saved'),
        life: 3000,
      });
    }, 600);
  }

  private cloneDefault(): FormState {
    return {
      ...DEFAULT_FORM,
      estadosNoDisponibles: [...DEFAULT_FORM.estadosNoDisponibles],
      visibilidadEstados: { ...DEFAULT_FORM.visibilidadEstados },
      eventosNotificacion: { ...DEFAULT_FORM.eventosNotificacion },
    };
  }
}
