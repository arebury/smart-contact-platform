import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { ScPreset } from '@sc/tokens/sc-preset';

import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    providePrimeNG({
      theme: {
        preset: ScPreset,
        options: {
          prefix: 'p',
          darkModeSelector: '.sc-dark',
          cssLayer: { name: 'primeng', order: 'reset, primeng' },
        },
      },
      ripple: true,
    }),
    /* TranslateModule con TranslateNoOpLoader (v17; reemplaza al retirado
     * TranslateFakeLoader): devuelve la key raw como fallback. Permite usar
     * componentes SCDS que aceptan `xxxKey: string` con `| translate` en sus
     * templates internos sin necesidad de un archivo i18n real en ds-docs (que
     * es vehicle de documentación, no app i18n-aware). Las galleries pasan
     * strings legibles como keys. */
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader },
        fallbackLang: 'es',
      }),
    ),
  ],
};
