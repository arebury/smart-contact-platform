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

  // Repositories hub + instances
  { path: 'repositorios', loadComponent: placeholder },
  { path: 'agendas', loadComponent: placeholder },
  { path: 'horarios', loadComponent: placeholder },
  {
    path: 'plantillas',
    loadComponent: () =>
      import('./templates/pages/templates/templates-page.component').then(
        (m) => m.TemplatesPageComponent,
      ),
  },
  { path: 'tipificaciones', loadComponent: placeholder },
  {
    path: 'labels',
    loadComponent: () =>
      import('./labels/pages/labels/labels-page.component').then(
        (m) => m.LabelsPageComponent,
      ),
  },
  { path: 'variables', loadComponent: placeholder },
  { path: 'entidades', loadComponent: placeholder },
  { path: 'intenciones', loadComponent: placeholder },
  { path: 'reglas-ia', loadComponent: placeholder },
  { path: 'entidades-ia', loadComponent: placeholder },
  { path: 'clasificacion-ia', loadComponent: placeholder },
];
