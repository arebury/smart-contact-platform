import { Routes } from '@angular/router';

const placeholder = () =>
  import('@core/layout/placeholder-page/placeholder-page.component').then(
    (m) => m.PlaceholderPageComponent,
  );

/**
 * Config feature routes.
 *
 * `/config/aed/*` lives inside SettingsShell — three placeholder
 * sub-pages today (Servicio / Agentes / Grupos) backed by the Figma
 * 224:9167 family. The hub redirects to `/aed/servicio` so the rail
 * always has a selected item on first visit.
 *
 * Other config children render as plain pages (no inner shell, like
 * before): Seguridad (placeholder), Personalización / Integraciones
 * (still unbuilt), and Sistema (now also home to "Numeración
 * especial" — see DD#45).
 */
export const configRoutes: Routes = [
  {
    path: 'aed',
    // El hub aporta su contexto al breadcrumb ("Configuración AED / Agentes").
    // `link: false`: /config/aed solo redirige a servicio, no es un destino propio.
    data: { breadcrumb: { labelKey: 'config.sidebar.title', link: false } },
    loadComponent: () =>
      import('./layout/settings-shell.component').then((m) => m.SettingsShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'servicio' },
      {
        path: 'servicio',
        data: { breadcrumb: { labelKey: 'config.aed.subpages.servicio.heading' } },
        loadComponent: () =>
          import('./aed/aed-servicio-page.component').then((m) => m.AedServicioPageComponent),
      },
      {
        path: 'agentes',
        data: { breadcrumb: { labelKey: 'config.aed.subpages.agentes.heading' } },
        loadComponent: () =>
          import('./aed/aed-agentes-page.component').then((m) => m.AedAgentesPageComponent),
      },
      {
        path: 'grupos',
        data: { breadcrumb: { labelKey: 'config.aed.subpages.grupos.heading' } },
        loadComponent: () =>
          import('./aed/aed-grupos-page.component').then((m) => m.AedGruposPageComponent),
      },
    ],
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
];
