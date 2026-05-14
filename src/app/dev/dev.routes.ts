import { Routes } from '@angular/router';

/**
 * Dev-only routes — not linked from the sidebar. Useful for visual
 * inspection of design-system pieces in isolation. Reach them by
 * typing the URL directly.
 */
export const devRoutes: Routes = [
  {
    path: 'buttons',
    loadComponent: () =>
      import('./buttons-gallery/buttons-gallery.component').then((m) => m.ButtonsGalleryComponent),
  },
];
