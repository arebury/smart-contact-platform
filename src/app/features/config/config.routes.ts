import { Routes } from '@angular/router';

const placeholder = () =>
  import('@core/layout/placeholder-page/placeholder-page.component').then(
    (m) => m.PlaceholderPageComponent,
  );

/**
 * Config feature routes. Every child renders inside SettingsShell so
 * the inner sidebar (Figma node 224:9167) is shared across pages.
 */
export const configRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/settings-shell.component').then((m) => m.SettingsShellComponent),
    children: [
      {
        path: 'aed',
        data: { breadcrumb: { labelKey: 'config.aed.title' } },
        loadComponent: () => import('./pages/aed-page.component').then((m) => m.AedPageComponent),
      },
      {
        path: 'seguridad',
        data: { breadcrumb: { labelKey: 'config.seguridad.title' } },
        loadComponent: () =>
          import('./pages/seguridad-page.component').then((m) => m.SeguridadPageComponent),
      },
      { path: 'personalizacion', loadComponent: placeholder },
      { path: 'integraciones', loadComponent: placeholder },
      {
        path: 'sistema',
        data: { breadcrumb: { labelKey: 'config.sistema.title' } },
        loadComponent: () =>
          import('./pages/sistema-page.component').then((m) => m.SistemaPageComponent),
      },
    ],
  },
];
