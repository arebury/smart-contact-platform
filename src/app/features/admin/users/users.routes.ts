import { Routes } from '@angular/router';

const placeholder = () =>
  import('@core/layout/placeholder-page/placeholder-page.component').then(
    (m) => m.PlaceholderPageComponent,
  );

/** Users feature routes. List + create + edit are placeholders until 3.5. */
export const USERS_ROUTES: Routes = [
  { path: '', loadComponent: placeholder },
  { path: 'crear', loadComponent: placeholder },
  { path: 'editar/:id', loadComponent: placeholder },
];
