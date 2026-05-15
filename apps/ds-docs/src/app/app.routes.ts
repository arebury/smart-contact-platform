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
    path: 'components/datepicker',
    loadComponent: () =>
      import('./pages/datepicker/datepicker-gallery.component').then(
        (m) => m.DatepickerGalleryComponent,
      ),
  },
  {
    path: 'components/tabs',
    loadComponent: () =>
      import('./pages/tabs/tabs-gallery.component').then((m) => m.TabsGalleryComponent),
  },
  {
    path: 'components/tooltip',
    loadComponent: () =>
      import('./pages/tooltip/tooltip-gallery.component').then((m) => m.TooltipGalleryComponent),
  },
  {
    path: 'components/multi-select',
    loadComponent: () =>
      import('./pages/multi-select/multi-select-gallery.component').then(
        (m) => m.MultiSelectGalleryComponent,
      ),
  },
  {
    path: 'components/toast',
    loadComponent: () =>
      import('./pages/toast/toast-gallery.component').then((m) => m.ToastGalleryComponent),
  },
  {
    path: 'components/modal',
    loadComponent: () =>
      import('./pages/modal/modal-gallery.component').then((m) => m.ModalGalleryComponent),
  },
  {
    path: 'components/checkbox',
    loadComponent: () =>
      import('./pages/checkbox/checkbox-gallery.component').then((m) => m.CheckboxGalleryComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
