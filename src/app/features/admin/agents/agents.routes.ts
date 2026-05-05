import { Routes } from '@angular/router';

/** Agents feature routes — list + create + edit. */
export const AGENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/agents-list-page.component').then((m) => m.AgentsListPageComponent),
  },
  {
    path: 'crear',
    loadComponent: () =>
      import('./pages/agent-form-page.component').then((m) => m.AgentFormPageComponent),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/agent-form-page.component').then((m) => m.AgentFormPageComponent),
  },
];
