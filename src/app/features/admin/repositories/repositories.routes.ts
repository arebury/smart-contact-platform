import { Routes } from '@angular/router';

/**
 * Repository routes — hub at `/admin/repositorios` plus 9 instance pages
 * each at `/admin/<instance>`. The instance pages live at the admin root
 * (not nested under `/repositorios/`) for backwards compatibility with the
 * URLs of the React prototype.
 */
export const REPOSITORIES_ROUTES: Routes = [
  {
    path: 'repositorios',
    loadComponent: () =>
      import('./pages/repositorios-hub-page.component').then(
        (m) => m.RepositoriosHubPageComponent,
      ),
  },
  {
    path: 'agendas',
    loadComponent: () => import('./instances/agendas').then((m) => m.AgendasPageComponent),
  },
  {
    path: 'horarios',
    loadComponent: () => import('./instances/horarios').then((m) => m.HorariosPageComponent),
  },
  {
    path: 'tipificaciones',
    loadComponent: () =>
      import('./instances/tipificaciones').then((m) => m.TipificacionesPageComponent),
  },
  {
    path: 'variables',
    loadComponent: () =>
      import('./instances/variables').then((m) => m.VariablesPageComponent),
  },
  {
    path: 'entidades',
    loadComponent: () =>
      import('./instances/entidades').then((m) => m.EntidadesPageComponent),
  },
  {
    path: 'intenciones',
    loadComponent: () =>
      import('./instances/intenciones').then((m) => m.IntencionesPageComponent),
  },
  {
    path: 'reglas-ia',
    loadComponent: () =>
      import('./instances/reglas-ia').then((m) => m.ReglasIAPageComponent),
  },
  {
    path: 'entidades-ia',
    loadComponent: () =>
      import('./instances/entidades-ia').then((m) => m.EntidadesIAPageComponent),
  },
  {
    path: 'clasificacion-ia',
    loadComponent: () =>
      import('./instances/clasificacion-ia').then((m) => m.ClasificacionIAPageComponent),
  },
];
