import { Routes } from '@angular/router';

const placeholder = () =>
  import('../../core/layout/placeholder-page/placeholder-page.component').then(
    (m) => m.PlaceholderPageComponent,
  );

/**
 * Config routes — mirrors `/config/*` URLs from the React prototype.
 * Phase 3 replaces each `loadComponent: placeholder` with the real page component.
 */
export const configRoutes: Routes = [
  { path: 'seguridad', loadComponent: placeholder },
  { path: 'personalizacion', loadComponent: placeholder },
  { path: 'aed', loadComponent: placeholder },
  { path: 'integraciones', loadComponent: placeholder },
  { path: 'sistema', loadComponent: placeholder },
];
