import { Routes } from '@angular/router';

const placeholder = () =>
  import('@core/layout/placeholder-page/placeholder-page.component').then(
    (m) => m.PlaceholderPageComponent,
  );

/** Agents feature routes. List + create + edit are placeholders until 3.7. */
export const AGENTS_ROUTES: Routes = [
  { path: '', loadComponent: placeholder },
  { path: 'crear', loadComponent: placeholder },
  { path: 'editar/:id', loadComponent: placeholder },
];
