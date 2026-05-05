import { Routes } from '@angular/router';

const placeholder = () =>
  import('@core/layout/placeholder-page/placeholder-page.component').then(
    (m) => m.PlaceholderPageComponent,
  );

/**
 * Config feature routes. Personalización / Integraciones / Sistema remain
 * as placeholders (the React prototype never built them either).
 */
export const configRoutes: Routes = [
  {
    path: 'aed',
    loadComponent: () => import('./pages/aed-page.component').then((m) => m.AedPageComponent),
  },
  {
    path: 'seguridad',
    loadComponent: () =>
      import('./pages/seguridad-page.component').then((m) => m.SeguridadPageComponent),
  },
  { path: 'personalizacion', loadComponent: placeholder },
  { path: 'integraciones', loadComponent: placeholder },
  { path: 'sistema', loadComponent: placeholder },
];
