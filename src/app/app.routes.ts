import { Routes } from '@angular/router';

/**
 * Top-level route table.
 *
 * Layout shell (sidebar + topbar + outlet) lives at `''` and wraps every
 * feature route. Feature route tables are lazy-loaded.
 */
export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/app-shell/app-shell.component').then((m) => m.AppShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./core/layout/placeholder-page/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.routes').then((m) => m.adminRoutes),
      },
      {
        path: 'config',
        loadChildren: () => import('./features/config/config.routes').then((m) => m.configRoutes),
      },
      {
        // Dev-only galleries — not in the sidebar, reach by URL.
        path: 'dev',
        loadChildren: () => import('./dev/dev.routes').then((m) => m.devRoutes),
      },
      {
        path: '',
        loadChildren: () =>
          import('./features/supervision/supervision.routes').then((m) => m.supervisionRoutes),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./core/layout/placeholder-page/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
    ],
  },
];
