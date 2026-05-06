import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LucideAngularModule, Monitor, Moon, Settings, Sun } from 'lucide-angular';

import { BreadcrumbService, ThemeService, type ThemeMode } from '@core/services';

interface ThemeOption {
  readonly value: ThemeMode;
  readonly labelKey: string;
  readonly icon: typeof Sun;
}

/**
 * Sistema page (`/config/sistema`).
 *
 * Houses cross-cutting client-side preferences. Today: a 3-state theme
 * picker (Claro / Oscuro / Sistema) bound to {@link ThemeService}. The
 * service applies `.aed-dark` to `<html>`, which the §5 dark-mode block
 * in `sc-tokens.css` and PrimeNG's Aura `darkModeSelector` both target —
 * so the toggle alone flips the entire surface, no per-component wiring.
 */
@Component({
  selector: 'aed-sistema-page',
  standalone: true,
  imports: [LucideAngularModule, TranslateModule],
  templateUrl: './sistema-page.component.html',
  styleUrl: './sistema-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SistemaPageComponent implements OnInit, OnDestroy {
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly translate = inject(TranslateService);
  protected readonly theme = inject(ThemeService);

  protected readonly settingsIcon = Settings;

  protected readonly themeOptions: readonly ThemeOption[] = [
    { value: 'light', labelKey: 'config.sistema.appearance.theme_light', icon: Sun },
    { value: 'dark', labelKey: 'config.sistema.appearance.theme_dark', icon: Moon },
    { value: 'system', labelKey: 'config.sistema.appearance.theme_system', icon: Monitor },
  ];

  ngOnInit(): void {
    this.breadcrumbs.set([
      { label: this.translate.instant('sidebar.configuration') },
      { label: this.translate.instant('config.sistema.title') },
    ]);
  }

  ngOnDestroy(): void {
    this.breadcrumbs.clear();
  }

  protected select(mode: ThemeMode): void {
    this.theme.set(mode);
  }
}
