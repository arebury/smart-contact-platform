import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChevronDown, Info, LucideAngularModule, UsersRound } from 'lucide-angular';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

import { PageHeaderService } from '@core/services';
import {
  InputNumberComponent,
  SelectComponent,
  ToggleSwitchComponent,
} from '@shared/components';

interface FormState {
  capacidadTipo: 'fija' | 'variable';
  limiteCola: number;
  tiempoTransferencia: number;
  tiempoMaxEspera: number;
  tipoVoz: string;
  desbordarLlamadas: boolean;
  desbordarSesion: boolean;
  prioridad: string;
  estrategia: string;
  aperturaFicha: 'automatica' | 'manual' | 'ninguna';
}

const VOZ_OPTIONS = ['G.711 (alaw/ulaw)', 'G.722', 'G.729', 'OPUS'] as const;
const PRIORIDAD_OPTIONS = ['Baja', 'Media', 'Alta', 'Urgente'] as const;
const ESTRATEGIA_OPTIONS = [
  'Distribución equitativa',
  'Más tiempo libre',
  'Última asignación',
  'Round robin',
  'Aleatoria',
] as const;

const DEFAULT_FORM: FormState = {
  capacidadTipo: 'fija',
  limiteCola: 50,
  tiempoTransferencia: 30,
  tiempoMaxEspera: 120,
  tipoVoz: VOZ_OPTIONS[0],
  desbordarLlamadas: false,
  desbordarSesion: true,
  prioridad: PRIORIDAD_OPTIONS[1],
  estrategia: ESTRATEGIA_OPTIONS[0],
  aperturaFicha: 'automatica',
};

/**
 * Grupos defaults page — `/config/aed/grupos`. Figma node 224:9482.
 *
 * Single SettingsCard with five sub-sections separated by dividers:
 * Capacidad máxima · Tiempos de gestión · Voz y desbordamiento ·
 * Enrutamiento · Apertura de ficha. Card footer hosts the "Saber más"
 * link and the Guardar button (only enabled while dirty).
 */
@Component({
  selector: 'sc-aed-grupos-page',
  imports: [
    ButtonModule,
    LucideAngularModule,
    ToggleSwitchComponent,
    TranslateModule,
    InputNumberComponent,
    SelectComponent,
  ],
  templateUrl: './aed-grupos-page.component.html',
  styleUrl: './aed-defaults-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AedGruposPageComponent {
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly pageHeader = inject(PageHeaderService);

  constructor() {
    this.pageHeader.set({
      titleKey: 'config.aed.subpages.grupos.heading',
      subtitleKey: 'config.aed.subpages.grupos.subtitle',
      entityKey: 'config.sidebar.title',
      icon: UsersRound,
    });
  }

  protected readonly groupsIcon = UsersRound;
  protected readonly chevronIcon = ChevronDown;
  protected readonly infoIcon = Info;

  protected readonly vozOptions = VOZ_OPTIONS;
  protected readonly prioridadOptions = PRIORIDAD_OPTIONS;
  protected readonly estrategiaOptions = ESTRATEGIA_OPTIONS;

  protected readonly form = signal<FormState>({ ...DEFAULT_FORM });
  protected readonly dirty = signal(false);
  protected readonly saving = signal(false);

  protected readonly canSave = computed(() => this.dirty() && !this.saving());

  protected update<K extends keyof FormState>(key: K, value: FormState[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
    this.dirty.set(true);
  }

  protected onCapacidadChange(value: 'fija' | 'variable'): void {
    this.update('capacidadTipo', value);
  }

  protected onAperturaChange(value: 'automatica' | 'manual' | 'ninguna'): void {
    this.update('aperturaFicha', value);
  }

  /**
   * Adapter para `<sc-input-number>` que emite `number | null` directamente.
   * Si null → no actualizamos (mantener último valor válido).
   */
  protected onNumberValueChange<
    K extends 'limiteCola' | 'tiempoTransferencia' | 'tiempoMaxEspera',
  >(key: K, value: number | null): void {
    if (value !== null && Number.isFinite(value) && value >= 0) this.update(key, value);
  }

  /**
   * Adapter para `<sc-select>` que emite `unknown` (el wrapper tipa el value
   * genérico). Coerce a string para los campos de string-only del form.
   */
  protected onSelectValueChange<K extends 'tipoVoz' | 'prioridad' | 'estrategia'>(
    key: K,
    value: unknown,
  ): void {
    if (typeof value === 'string') this.update(key, value);
  }

  protected discard(): void {
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
        life: 3000,
      });
    }, 600);
  }
}
