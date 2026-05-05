import { Routes } from '@angular/router';

/** Groups feature routes — list + create + edit. */
export const GROUPS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/groups-list-page.component').then((m) => m.GroupsListPageComponent),
  },
  {
    path: 'crear',
    loadComponent: () =>
      import('./pages/group-form-page.component').then((m) => m.GroupFormPageComponent),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/group-form-page.component').then((m) => m.GroupFormPageComponent),
  },
];
