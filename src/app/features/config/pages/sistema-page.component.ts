import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LucideAngularModule, Monitor, Moon, RotateCcw, Settings, Sun } from 'lucide-angular';

import { ConfirmHostService, ThemeService, type ThemeMode } from '@core/services';

interface ThemeOption {
  readonly value: ThemeMode;
  readonly labelKey: string;
  readonly icon: typeof Sun;
}

/* All app data lives under the `smartcontact_*` localStorage namespace
 * (see every store's `storageKey` / `versionKey`). Resetting wipes only
 * those keys — `sc_theme`, column visibility prefs, and any other UX
 * state stays intact. After clearing we reload so each store re-seeds
 * from its `defaults`. */
const APP_DATA_PREFIX = 'smartcontact_';

/**
 * Sistema page (`/config/sistema`).
 *
 * Houses cross-cutting client-side preferences. Two sections today:
 *   1. **Apariencia** — three-state theme picker (Claro / Oscuro /
 *      Sistema) bound to {@link ThemeService}. The service applies
 *      `.aed-dark` to `<html>`, which the §5 dark-mode block in
 *      `sc-tokens.css` and PrimeNG's Aura `darkModeSelector` both
 *      target — so the toggle alone flips the entire surface.
 *   2. **Datos** — factory-reset for the `smartcontact_*` localStorage
 *      stores (agents, groups, users, labels, templates, repositorios).
 *      Useful while the app is a prototype: it's easy to delete entities
 *      and lose track of the original seed.
 */
@Component({
  selector: 'aed-sistema-page',
  standalone: true,
  imports: [LucideAngularModule, TranslateModule],
  templateUrl: './sistema-page.component.html',
  styleUrl: './sistema-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SistemaPageComponent {
  protected readonly theme = inject(ThemeService);
  private readonly confirm = inject(ConfirmHostService);
  private readonly translate = inject(TranslateService);
  private readonly doc = inject(DOCUMENT);

  protected readonly settingsIcon = Settings;
  protected readonly resetIcon = RotateCcw;

  protected readonly themeOptions: readonly ThemeOption[] = [
    { value: 'light', labelKey: 'config.sistema.appearance.theme_light', icon: Sun },
    { value: 'dark', labelKey: 'config.sistema.appearance.theme_dark', icon: Moon },
    { value: 'system', labelKey: 'config.sistema.appearance.theme_system', icon: Monitor },
  ];

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
}
