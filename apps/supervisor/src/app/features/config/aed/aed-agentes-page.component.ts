import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

import { PageHeaderService } from '@core/services';
import {
  IconComponent,
  InputTextComponent,
  ToggleSwitchComponent,
  CheckboxComponent,
  type TriState,
} from '@shared/components';

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
  selector: 'sc-aed-agentes-page',
  imports: [
    ButtonModule,
    IconComponent,
    InputTextComponent,
    ToggleSwitchComponent,
    TranslateModule,
    CheckboxComponent,
  ],
  templateUrl: './aed-agentes-page.component.html',
  styleUrls: ['./aed-defaults-page.component.scss', './aed-agentes-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AedAgentesPageComponent {
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly pageHeader = inject(PageHeaderService);

  constructor() {
    this.pageHeader.set({
      titleKey: 'config.aed.subpages.agentes.heading',
      subtitleKey: 'config.aed.subpages.agentes.subtitle',
      entityKey: 'config.sidebar.title',
      icon: 'person',
    });
  }

  protected readonly userIcon = 'person';
  protected readonly chevronDown = 'expand_more';
  protected readonly chevronUp = 'expand_less';

  protected readonly destinoKeys = DESTINO_KEYS;

  protected readonly form = signal<FormState>(this.cloneDefault());
  protected readonly dirty = signal(false);
  protected readonly saving = signal(false);

  protected readonly canSave = computed(() => this.dirty() && !this.saving());

  protected readonly columnState = computed<Record<DestinoCol, TriState>>(() => {
    const p = this.form().permisosLlamadas;
    const tally = (col: DestinoCol): TriState => {
      const checked = DESTINO_KEYS.filter((k) => p[k][col]).length;
      if (checked === 0) return 'none';
      if (checked === DESTINO_KEYS.length) return 'all';
      return 'some';
    };
    return { llamada: tally('llamada'), transferencias: tally('transferencias') };
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

  protected toggleColumnAll(col: DestinoCol, next: boolean): void {
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
