import { Routes } from '@angular/router';

/**
 * Memory feature routes — montadas bajo `/conversaciones` desde
 * supervision.routes.ts. Migración progresiva desde el prototipo React
 * `arebury/Memory/legacy-react/`. Ver `docs/memory-migration-inventory.md`.
 *
 * Mapeo de las 5 vistas top-level del prototipo:
 *   ''                       → ConversationsPage (vista principal)
 *   'repositorio'            → RepositoryHubPage (TBD)
 *   'repositorio/reglas'     → RulesPage (TBD)
 *   'repositorio/entidades'  → EntitiesPage (TBD)
 *   'repositorio/categorias' → CategoriesPage (TBD)
 */
export const memoryRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/conversations/conversations-page.component').then(
        (m) => m.ConversationsPageComponent,
      ),
  },
];
