import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { provideSmartContactUi } from '@smartcontact-hub/components';

import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    // Misma frontera de tema que supervisor: preset publicado vía
    // provideSmartContactUi (opciones verbatim respecto al providePrimeNG previo).
    provideSmartContactUi({
      ripple: true,
      theme: {
        prefix: 'p',
        darkModeSelector: '.sc-dark',
        cssLayer: { name: 'primeng', order: 'reset, primeng' },
      },
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
