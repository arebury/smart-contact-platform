import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'components/button',
    loadComponent: () =>
      import('./pages/button/buttons-gallery.component').then((m) => m.ButtonsGalleryComponent),
  },
  {
    path: 'components/input',
    loadComponent: () =>
      import('./pages/input/inputs-gallery.component').then((m) => m.InputsGalleryComponent),
  },
  {
    path: 'components/input-number',
    loadComponent: () =>
      import('./pages/input-number/input-number-gallery.component').then(
        (m) => m.InputNumberGalleryComponent,
      ),
  },
  {
    path: 'components/select',
    loadComponent: () =>
      import('./pages/select/select-gallery.component').then((m) => m.SelectGalleryComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
