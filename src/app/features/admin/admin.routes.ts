import { Routes } from '@angular/router';

const placeholder = () =>
  import('../../core/layout/placeholder-page/placeholder-page.component').then(
    (m) => m.PlaceholderPageComponent,
  );

/**
 * Admin routes — mirrors `/admin/*` URLs from the React prototype.
 * Phase 3 replaces each `loadComponent: placeholder` with the real page component.
 */
export const adminRoutes: Routes = [
  // Users
  { path: 'usuarios', loadComponent: placeholder },
  { path: 'usuarios/crear', loadComponent: placeholder },
  { path: 'usuarios/editar/:id', loadComponent: placeholder },

  // Groups
  { path: 'grupos', loadComponent: placeholder },
  { path: 'grupos/crear', loadComponent: placeholder },
  { path: 'grupos/editar/:id', loadComponent: placeholder },

  // Agents
  { path: 'agentes', loadComponent: placeholder },
  { path: 'agentes/crear', loadComponent: placeholder },
  { path: 'agentes/editar/:id', loadComponent: placeholder },

  // Repositories hub
  {
    path: 'repositorios',
    loadComponent: () =>
      import('./repositories/pages/hub/repositorios-hub-page.component').then(
        (m) => m.RepositoriosHubPageComponent,
      ),
  },

  // Repositories — instances
  {
    path: 'agendas',
    loadComponent: () => import('./repositories/instances/agendas').then((m) => m.AgendasPageComponent),
  },
  {
    path: 'horarios',
    loadComponent: () => import('./repositories/instances/horarios').then((m) => m.HorariosPageComponent),
  },
  {
    path: 'plantillas',
    loadComponent: () =>
      import('./templates/pages/templates/templates-page.component').then(
        (m) => m.TemplatesPageComponent,
      ),
  },
  {
    path: 'tipificaciones',
    loadComponent: () =>
      import('./repositories/instances/tipificaciones').then((m) => m.TipificacionesPageComponent),
  },
  {
    path: 'labels',
    loadComponent: () =>
      import('./labels/pages/labels/labels-page.component').then((m) => m.LabelsPageComponent),
  },
  {
    path: 'variables',
    loadComponent: () =>
      import('./repositories/instances/variables').then((m) => m.VariablesPageComponent),
  },
  {
    path: 'entidades',
    loadComponent: () =>
      import('./repositories/instances/entidades').then((m) => m.EntidadesPageComponent),
  },
  {
    path: 'intenciones',
    loadComponent: () =>
      import('./repositories/instances/intenciones').then((m) => m.IntencionesPageComponent),
  },
  {
    path: 'reglas-ia',
    loadComponent: () =>
      import('./repositories/instances/reglas-ia').then((m) => m.ReglasIAPageComponent),
  },
  {
    path: 'entidades-ia',
    loadComponent: () =>
      import('./repositories/instances/entidades-ia').then((m) => m.EntidadesIAPageComponent),
  },
  {
    path: 'clasificacion-ia',
    loadComponent: () =>
      import('./repositories/instances/clasificacion-ia').then((m) => m.ClasificacionIAPageComponent),
  },
];
