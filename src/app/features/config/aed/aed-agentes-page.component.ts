import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChevronDown, ChevronUp, LucideAngularModule, UserRound } from 'lucide-angular';
import { MessageService } from 'primeng/api';

import { ToggleSwitchComponent } from '@shared/components';

type DestinoKey = 'fijos' | 'moviles' | 'internacionales' | 'especial';
type DestinoCol = 'llamada' | 'transferencias';

interface PermisosLlamadas {
  fijos: { llamada: boolean; transferencias: boolean };
  moviles: { llamada: boolean; transferencias: boolean };
  internacionales: { llamada: boolean; transferencias: boolean };
  especial: { llamada: boolean; transferencias: boolean };
}

interface FormState {
  llamadasOpen: boolean;
  permisosLlamadas: PermisosLlamadas;
  gestionDispositivos: boolean;
  activacionGrupo: boolean;
  dispositivosExternos: boolean;
  ordenAleatorio: boolean;
  iframeActivo: boolean;
  iframeUrl: string;
  iframeTitulo: string;
}

const DESTINO_KEYS: readonly DestinoKey[] = ['fijos', 'moviles', 'internacionales', 'especial'];

const DEFAULT_FORM: FormState = {
  llamadasOpen: true,
  permisosLlamadas: {
    fijos: { llamada: false, transferencias: true },
    moviles: { llamada: false, transferencias: true },
    internacionales: { llamada: false, transferencias: true },
    especial: { llamada: false, transferencias: true },
  },
  gestionDispositivos: true,
  activacionGrupo: true,
  dispositivosExternos: true,
  ordenAleatorio: false,
  iframeActivo: true,
  iframeUrl: '',
  iframeTitulo: '',
};

/**
 * Agentes defaults page — `/config/aed/agentes`. Figma node 224:9167.
 *
 * One SettingsCard with a "Llamadas" accordion (collapsible table of
 * destino × LLAMADA × TRANSFERENCIAS checkboxes), then three
 * sub-sections separated by dividers: Permisos de dispositivos
 * (3 switches), Visualización (1 switch), and Iframe configurable
 * (switch + URL/Título inputs that only render when the switch is on).
 *
 * Per the UX brief, the destino table is a real `<table>` (semantic,
 * keyboard-accessible) with column headers that double as
 * "select-all-in-column" toggles.
 */
@Component({
    selector: 'aed-aed-agentes-page',
    imports: [LucideAngularModule, ToggleSwitchComponent, TranslateModule],
    templateUrl: './aed-agentes-page.component.html',
    styleUrls: ['./aed-defaults-page.component.scss', './aed-agentes-page.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AedAgentesPageComponent {
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);

  protected readonly userIcon = UserRound;
  protected readonly chevronDown = ChevronDown;
  protected readonly chevronUp = ChevronUp;

  protected readonly destinoKeys = DESTINO_KEYS;

  protected readonly form = signal<FormState>(this.cloneDefault());
  protected readonly dirty = signal(false);
  protected readonly saving = signal(false);

  protected readonly canSave = computed(() => this.dirty() && !this.saving());

  protected readonly columnAllSelected = computed(() => {
    const p = this.form().permisosLlamadas;
    return {
      llamada: DESTINO_KEYS.every((k) => p[k].llamada),
      transferencias: DESTINO_KEYS.every((k) => p[k].transferencias),
    };
  });

  protected toggleLlamadasOpen(): void {
    this.form.update((f) => ({ ...f, llamadasOpen: !f.llamadasOpen }));
  }

  protected togglePermiso(row: DestinoKey, col: DestinoCol): void {
    this.form.update((f) => ({
      ...f,
      permisosLlamadas: {
        ...f.permisosLlamadas,
        [row]: { ...f.permisosLlamadas[row], [col]: !f.permisosLlamadas[row][col] },
      },
    }));
    this.dirty.set(true);
  }

  protected toggleColumnAll(col: DestinoCol): void {
    const next = !this.columnAllSelected()[col];
    this.form.update((f) => {
      const updated = { ...f.permisosLlamadas } as PermisosLlamadas;
      for (const k of DESTINO_KEYS) {
        updated[k] = { ...updated[k], [col]: next };
      }
      return { ...f, permisosLlamadas: updated };
    });
    this.dirty.set(true);
  }

  protected update<K extends Exclude<keyof FormState, 'permisosLlamadas' | 'llamadasOpen'>>(
    key: K,
    value: FormState[K],
  ): void {
    this.form.update((f) => ({ ...f, [key]: value }));
    this.dirty.set(true);
  }

  protected onTextInput<K extends 'iframeUrl' | 'iframeTitulo'>(key: K, event: Event): void {
    this.update(key, (event.target as HTMLInputElement).value);
  }

  protected discard(): void {
    this.form.set(this.cloneDefault());
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
        summary: this.translate.instant('config.aed.subpages.agentes.toast.saved'),
        life: 3000,
      });
    }, 600);
  }

  private cloneDefault(): FormState {
    return {
      ...DEFAULT_FORM,
      permisosLlamadas: {
        fijos: { ...DEFAULT_FORM.permisosLlamadas.fijos },
        moviles: { ...DEFAULT_FORM.permisosLlamadas.moviles },
        internacionales: { ...DEFAULT_FORM.permisosLlamadas.internacionales },
        especial: { ...DEFAULT_FORM.permisosLlamadas.especial },
      },
    };
  }
}
