import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  withComponentInputBinding,
  withPreloading,
  withViewTransitions,
} from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpClient, provideHttpClient, withFetch } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import { ScPreset } from '@sc/tokens/sc-preset';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { appRoutes } from './app.routes';

export function httpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      appRoutes,
      withComponentInputBinding(),
      withViewTransitions(),
      // Preload every lazy-loaded chunk in the background once the app
      // shell is interactive. Initial paint stays fast (only the shell
      // is on the critical path), but every subsequent navigation is
      // instant — no per-route fetch + parse delay on click.
      withPreloading(PreloadAllModules),
    ),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    providePrimeNG({
      theme: {
        preset: ScPreset,
        options: {
          prefix: 'p',
          darkModeSelector: '.sc-dark',
          cssLayer: {
            name: 'primeng',
            // `reset` layer is declared in styles/_reset.scss and holds the
            // generic element resets; `primeng` follows so PrimeNG's
            // `.p-button` etc. win over `button { background: none }`. Custom
            // AED component CSS stays UNLAYERED → still beats both.
            order: 'reset, primeng',
          },
        },
      },
      ripple: true,
    }),
    MessageService,
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'es',
        loader: {
          provide: TranslateLoader,
          useFactory: httpLoaderFactory,
          deps: [HttpClient],
        },
      }),
    ),
  ],
};
