import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  DOCUMENT,
} from '@angular/core';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  Info,
  Key,
  Loader2,
  LucideAngularModule,
  Monitor,
  Moon,
  RotateCcw,
  Search,
  Settings,
  Shield,
  Sun,
  X,
} from 'lucide-angular';
import { MessageService } from 'primeng/api';

import { ConfirmHostService, ThemeService, type ThemeMode } from '@core/services';
import { ToggleSwitchComponent } from '@shared/components';
import { AgentsStore } from '@features/admin/agents/state/agents.store';

import { NumeracionEspecialSectionComponent } from '../sections/numeracion-especial-section.component';

interface ThemeOption {
  readonly value: ThemeMode;
  readonly labelKey: string;
  readonly icon: typeof Sun;
}

interface RegenerationResult {
  readonly count: number;
  readonly timestamp: string;
}

const CONFIRM_PHRASE = 'REGENERAR';

/* All app data lives under the `smartcontact_*` localStorage namespace
 * (see every store's `storageKey` / `versionKey`). Resetting wipes only
 * those keys — `sc_theme`, column visibility prefs, and any other UX
 * state stays intact. After clearing we reload so each store re-seeds
 * from its `defaults`. */
const APP_DATA_PREFIX = 'smartcontact_';

/**
 * Sistema page (`/config/sistema`).
 *
 * Single home for cross-cutting client-side preferences:
 *   1. **Apariencia** — three-state theme picker bound to {@link ThemeService}.
 *   2. **Datos** — factory-reset for the `smartcontact_*` localStorage stores.
 *      Prototype-only; gets removed when the real backend lands.
 *   3. **Políticas de contraseñas** — cosmetic policy panel migrated
 *      from the old Seguridad page. No backing storage yet.
 *   4. **Regeneración masiva** — gated bulk credential reset, also
 *      migrated from Seguridad. Behind a typed-confirmation gate
 *      ("REGENERAR") and a collapsed accordion so it isn't reachable
 *      by accident.
 *
 * Seguridad page (`/config/seguridad`) was emptied in this same change
 * — the route now hosts a minimal placeholder under the new settings
 * shell. See DD#44.
 */
@Component({
  selector: 'aed-sistema-page',
  imports: [
    LucideAngularModule,
    NumeracionEspecialSectionComponent,
    ToggleSwitchComponent,
    TranslateModule,
  ],
  templateUrl: './sistema-page.component.html',
  styleUrl: './sistema-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SistemaPageComponent {
  protected readonly theme = inject(ThemeService);
  private readonly confirm = inject(ConfirmHostService);
  private readonly translate = inject(TranslateService);
  private readonly doc = inject(DOCUMENT);
  private readonly messages = inject(MessageService);
  private readonly agentsStore = inject(AgentsStore);

  protected readonly settingsIcon = Settings;
  protected readonly resetIcon = RotateCcw;
  protected readonly shieldIcon = Shield;
  protected readonly keyIcon = Key;
  protected readonly searchIcon = Search;
  protected readonly closeIcon = X;
  protected readonly alertIcon = AlertTriangle;
  protected readonly infoIcon = Info;
  protected readonly chevronDown = ChevronDown;
  protected readonly chevronRight = ChevronRight;
  protected readonly downloadIcon = Download;
  protected readonly checkIcon = Check;
  protected readonly loaderIcon = Loader2;

  protected readonly themeOptions: readonly ThemeOption[] = [
    { value: 'light', labelKey: 'config.sistema.appearance.theme_light', icon: Sun },
    { value: 'dark', labelKey: 'config.sistema.appearance.theme_dark', icon: Moon },
    { value: 'system', labelKey: 'config.sistema.appearance.theme_system', icon: Monitor },
  ];

  protected readonly confirmPhraseToken = CONFIRM_PHRASE;

  protected readonly regenOpen = signal(false);
  protected readonly searchQuery = signal('');
  protected readonly selectedIds = signal<ReadonlySet<number>>(new Set());
  protected readonly confirmText = signal('');
  protected readonly processing = signal(false);
  protected readonly result = signal<RegenerationResult | null>(null);

  protected readonly activeAgents = computed(() =>
    this.agentsStore.agents().filter((a) => a.status === 'active'),
  );

  protected readonly filteredAgents = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const all = this.activeAgents();
    if (!query) return all;
    return all.filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        a.code.toLowerCase().includes(query) ||
        a.extension.includes(query) ||
        (a.email?.toLowerCase().includes(query) ?? false),
    );
  });

  protected readonly allFilteredSelected = computed(() => {
    const filtered = this.filteredAgents();
    if (filtered.length === 0) return false;
    const selected = this.selectedIds();
    return filtered.every((a) => selected.has(a.id));
  });

  protected readonly canExecute = computed(
    () =>
      this.selectedIds().size > 0 && this.confirmText() === CONFIRM_PHRASE && !this.processing(),
  );

  protected select(mode: ThemeMode): void {
    this.theme.set(mode);
  }

  protected async resetData(): Promise<void> {
    const accepted = await this.confirm.request({
      title: this.translate.instant('config.sistema.data.confirm_title'),
      body: this.translate.instant('config.sistema.data.confirm_body'),
      acceptLabel: this.translate.instant('config.sistema.data.reset_button'),
      rejectLabel: this.translate.instant('common.cancel'),
      acceptTone: 'danger',
    });
    if (!accepted) return;

    const storage = this.doc.defaultView?.localStorage;
    if (!storage) return;

    const toRemove: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(APP_DATA_PREFIX)) toRemove.push(key);
    }
    for (const key of toRemove) storage.removeItem(key);

    /* Force a fresh boot so every store reads its defaults. A signal
     * reset on the in-memory store wouldn't repopulate the defaults
     * already replaced by the user — the seed lives in the factory. */
    this.doc.defaultView?.location.reload();
  }

  protected toggleAccordion(): void {
    this.regenOpen.update((v) => !v);
  }

  protected toggleAll(): void {
    const filtered = this.filteredAgents();
    const allSelected = this.allFilteredSelected();
    this.selectedIds.update((current) => {
      const next = new Set(current);
      for (const agent of filtered) {
        if (allSelected) next.delete(agent.id);
        else next.add(agent.id);
      }
      return next;
    });
  }

  protected toggleOne(id: number): void {
    this.selectedIds.update((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  protected onConfirmInput(value: string): void {
    this.confirmText.set(value.toUpperCase());
  }

  protected onSearchKey(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    if (this.searchQuery()) {
      this.searchQuery.set('');
    } else {
      (event.target as HTMLInputElement).blur();
    }
  }

  protected regenerate(): void {
    if (!this.canExecute()) return;
    this.processing.set(true);
    const count = this.selectedIds().size;

    setTimeout(() => {
      this.result.set({
        count,
        timestamp: this.formatTimestamp(new Date()),
      });
      this.processing.set(false);
      this.selectedIds.set(new Set());
      this.confirmText.set('');
      this.messages.add({
        severity: 'success',
        summary: this.translate.instant(
          count === 1
            ? 'config.seguridad.toast.regenerated_one'
            : 'config.seguridad.toast.regenerated_many',
          { count },
        ),
        life: 4000,
      });
    }, 1500);
  }

  protected downloadCsv(): void {
    const result = this.result();
    if (!result) return;

    const header = ['Código', 'Nombre', 'Email', 'Contraseña temporal'].join(',');
    const sample = this.agentsStore.agents().slice(0, result.count);
    const rows = sample.map((a) => {
      const tempPwd = `tmp_${Math.random().toString(36).slice(2, 10)}`;
      return [a.code, JSON.stringify(a.name), a.email ?? '', tempPwd].join(',');
    });
    const csv = [header, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `credenciales_temporales_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    this.messages.add({
      severity: 'success',
      summary: this.translate.instant('config.seguridad.toast.csv_downloaded'),
      life: 3000,
    });
  }

  private formatTimestamp(date: Date): string {
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
