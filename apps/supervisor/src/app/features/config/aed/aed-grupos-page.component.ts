import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  TemplateRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

import { TopBarSlotService } from '@core/layout/top-bar/top-bar-slot.service';
import { TOAST_LIFE } from '@core/utils/toast-life';
import { IconComponent, SelectComponent, ToggleSwitchComponent } from '@shared/components';

interface FormState {
  estrategia: string;
  prioridad: string;
  voz: string;
  desbordar: boolean;
  tipoColaEspera: string;
  capacidadColaEspera: string;
  tiempoMaxEspera: string;
  tiempoTransferencia: string;
  aperturaTipo: string;
}

const ESTRATEGIA_OPTIONS = [
  'Distribución equitativa',
  'Más tiempo libre',
  'Última asignación',
  'Round robin',
  'Aleatoria',
] as const;
const PRIORIDAD_OPTIONS = ['Baja', 'Media', 'Alta', 'Urgente'] as const;
const VOZ_OPTIONS = ['G.711 (alaw/ulaw)', 'G.722', 'G.729', 'OPUS'] as const;
const TIPO_COLA_OPTIONS = [
  'Orden de llegada (FIFO)',
  'Por prioridad',
  'Último en entrar (LIFO)',
] as const;
const CAPACIDAD_COLA_OPTIONS = ['10', '25', '50', '100', 'Sin límite'] as const;
const TIEMPO_ESPERA_OPTIONS = ['30 segundos', '1 minuto', '2 minutos', '5 minutos'] as const;
const TIEMPO_TRANSFER_OPTIONS = [
  '15 segundos',
  '30 segundos',
  '45 segundos',
  '60 segundos',
] as const;
const APERTURA_OPTIONS = ['Automática', 'Manual', 'Ninguna'] as const;

const DEFAULT_FORM: FormState = {
  estrategia: '',
  prioridad: '',
  voz: '',
  desbordar: true,
  tipoColaEspera: '',
  capacidadColaEspera: '',
  tiempoMaxEspera: '',
  tiempoTransferencia: '',
  aperturaTipo: '',
};

/**
 * Grupos defaults page — `/config/aed/grupos`. Figma Supervisor `1:12676`.
 *
 * Card "Parámetros" con selects apilados (estrategia, prioridad, voz,
 * tipo/capacidad/tiempo de cola, tiempo de transferencia) + un toggle
 * "Desbordar conversaciones si no hay agentes disponibles", y una card
 * "Apertura de ficha" con un select de tipo. Guardado único en la TopBar.
 */
@Component({
  selector: 'sc-aed-grupos-page',
  imports: [ButtonModule, IconComponent, SelectComponent, ToggleSwitchComponent, TranslateModule],
  templateUrl: './aed-grupos-page.component.html',
  styleUrl: './aed-defaults-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AedGruposPageComponent implements OnDestroy {
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly topBarSlot = inject(TopBarSlotService);

  protected readonly pageIcon = 'groups';

  protected readonly estrategiaOptions = ESTRATEGIA_OPTIONS;
  protected readonly prioridadOptions = PRIORIDAD_OPTIONS;
  protected readonly vozOptions = VOZ_OPTIONS;
  protected readonly tipoColaOptions = TIPO_COLA_OPTIONS;
  protected readonly capacidadColaOptions = CAPACIDAD_COLA_OPTIONS;
  protected readonly tiempoEsperaOptions = TIEMPO_ESPERA_OPTIONS;
  protected readonly tiempoTransferOptions = TIEMPO_TRANSFER_OPTIONS;
  protected readonly aperturaOptions = APERTURA_OPTIONS;

  protected readonly form = signal<FormState>({ ...DEFAULT_FORM });
  protected readonly dirty = signal(false);
  protected readonly saving = signal(false);

  protected readonly canSave = computed(() => this.dirty() && !this.saving());

  private readonly topbarActions = viewChild<TemplateRef<unknown>>('topbarActions');

  constructor() {
    afterNextRender(() => {
      const tpl = this.topbarActions();
      if (tpl) this.topBarSlot.setActions(tpl);
    });
  }

  ngOnDestroy(): void {
    this.topBarSlot.clearActions();
  }

  protected update<K extends keyof FormState>(key: K, value: FormState[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
    this.dirty.set(true);
  }

  /** Adapter para `<sc-select>` (emite `unknown`). Coerce a string. */
  protected onSelect<K extends Exclude<keyof FormState, 'desbordar'>>(
    key: K,
    value: unknown,
  ): void {
    if (typeof value === 'string') this.update(key, value);
  }

  protected cancel(): void {
    this.form.set({ ...DEFAULT_FORM });
    this.dirty.set(false);
  }

  protected save(): void {
    if (!this.canSave()) return;
    this.saving.set(true);
    setTimeout(() => {
      this.saving.set(false);
      this.dirty.set(false);
      this.messages.add({
        severity: 'success',
        summary: this.translate.instant('config.aed.subpages.grupos.toast.saved'),
        life: TOAST_LIFE.success,
      });
    }, 600);
  }
}
