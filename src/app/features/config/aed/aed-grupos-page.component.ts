import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChevronDown, Info, LucideAngularModule, UsersRound } from 'lucide-angular';
import { MessageService } from 'primeng/api';

import { ToggleSwitchComponent } from '@shared/components';

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
    selector: 'aed-aed-grupos-page',
    imports: [LucideAngularModule, ToggleSwitchComponent, TranslateModule],
    templateUrl: './aed-grupos-page.component.html',
    styleUrl: './aed-defaults-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AedGruposPageComponent {
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);

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

  protected onNumberInput<K extends 'limiteCola' | 'tiempoTransferencia' | 'tiempoMaxEspera'>(
    key: K,
    event: Event,
  ): void {
    const raw = (event.target as HTMLInputElement).value;
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed >= 0) this.update(key, parsed);
  }

  protected onSelectChange<K extends 'tipoVoz' | 'prioridad' | 'estrategia'>(
    key: K,
    event: Event,
  ): void {
    this.update(key, (event.target as HTMLSelectElement).value);
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
