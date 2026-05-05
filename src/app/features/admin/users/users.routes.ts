import { Routes } from '@angular/router';

/** Users feature routes — list + create + edit. */
export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/users-list-page.component').then((m) => m.UsersListPageComponent),
  },
  {
    path: 'crear',
    loadComponent: () =>
      import('./pages/user-form-page.component').then((m) => m.UserFormPageComponent),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/user-form-page.component').then((m) => m.UserFormPageComponent),
  },
];
