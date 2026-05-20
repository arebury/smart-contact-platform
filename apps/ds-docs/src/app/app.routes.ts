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
    path: 'components/inputtext',
    loadComponent: () =>
      import('./pages/inputtext/inputtext-gallery.component').then(
        (m) => m.InputTextGalleryComponent,
      ),
  },
  {
    path: 'components/inputnumber',
    loadComponent: () =>
      import('./pages/inputnumber/inputnumber-gallery.component').then(
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
    path: 'components/multiselect',
    loadComponent: () =>
      import('./pages/multiselect/multiselect-gallery.component').then(
        (m) => m.MultiSelectGalleryComponent,
      ),
  },
  {
    path: 'components/search',
    loadComponent: () =>
      import('./pages/search/search-gallery.component').then((m) => m.SearchGalleryComponent),
  },
  {
    path: 'components/toast',
    loadComponent: () =>
      import('./pages/toast/toast-gallery.component').then((m) => m.ToastGalleryComponent),
  },
  {
    path: 'components/dialog',
    loadComponent: () =>
      import('./pages/dialog/dialog-gallery.component').then((m) => m.DialogGalleryComponent),
  },
  {
    path: 'components/checkbox',
    loadComponent: () =>
      import('./pages/checkbox/checkbox-gallery.component').then((m) => m.CheckboxGalleryComponent),
  },
  {
    path: 'components/toggleswitch',
    loadComponent: () =>
      import('./pages/toggleswitch/toggleswitch-gallery.component').then(
        (m) => m.ToggleSwitchGalleryComponent,
      ),
  },
  {
    path: 'components/section-card',
    loadComponent: () =>
      import('./pages/section-card/section-card-gallery.component').then(
        (m) => m.SectionCardGalleryComponent,
      ),
  },
  {
    path: 'components/page-header',
    loadComponent: () =>
      import('./pages/page-header/page-header-gallery.component').then(
        (m) => m.PageHeaderGalleryComponent,
      ),
  },
  {
    path: 'components/illustrated-avatar',
    loadComponent: () =>
      import('./pages/illustrated-avatar/illustrated-avatar-gallery.component').then(
        (m) => m.IllustratedAvatarGalleryComponent,
      ),
  },
  {
    path: 'components/delete-entity-dialog',
    loadComponent: () =>
      import('./pages/delete-entity-dialog/delete-entity-dialog-gallery.component').then(
        (m) => m.DeleteEntityDialogGalleryComponent,
      ),
  },
  {
    path: 'components/input-group',
    loadComponent: () =>
      import('./pages/input-group/input-group-gallery.component').then(
        (m) => m.InputGroupGalleryComponent,
      ),
  },
  {
    path: 'components/empty-state',
    loadComponent: () =>
      import('./pages/empty-state/empty-state-gallery.component').then(
        (m) => m.EmptyStateGalleryComponent,
      ),
  },
  {
    path: 'components/label-chip',
    loadComponent: () =>
      import('./pages/label-chip/label-chip-gallery.component').then(
        (m) => m.LabelChipGalleryComponent,
      ),
  },
  {
    path: 'components/color-dot-picker',
    loadComponent: () =>
      import('./pages/color-dot-picker/color-dot-picker-gallery.component').then(
        (m) => m.ColorDotPickerGalleryComponent,
      ),
  },
  {
    path: 'components/form-section-nav',
    loadComponent: () =>
      import('./pages/form-section-nav/form-section-nav-gallery.component').then(
        (m) => m.FormSectionNavGalleryComponent,
      ),
  },
  {
    path: 'components/form-danger-zone',
    loadComponent: () =>
      import('./pages/form-danger-zone/form-danger-zone-gallery.component').then(
        (m) => m.FormDangerZoneGalleryComponent,
      ),
  },
  {
    path: 'components/sticky-form-header',
    loadComponent: () =>
      import('./pages/sticky-form-header/sticky-form-header-gallery.component').then(
        (m) => m.StickyFormHeaderGalleryComponent,
      ),
  },
  {
    path: 'components/command-palette',
    loadComponent: () =>
      import('./pages/command-palette/command-palette-gallery.component').then(
        (m) => m.CommandPaletteGalleryComponent,
      ),
  },
  {
    path: 'components/keyboard-shortcuts',
    loadComponent: () =>
      import('./pages/keyboard-shortcuts/keyboard-shortcuts-gallery.component').then(
        (m) => m.KeyboardShortcutsGalleryComponent,
      ),
  },
  {
    path: 'components/confirm-host',
    loadComponent: () =>
      import('./pages/confirm-host/confirm-host-gallery.component').then(
        (m) => m.ConfirmHostGalleryComponent,
      ),
  },
  {
    path: 'components/photo-upload',
    loadComponent: () =>
      import('./pages/photo-upload/photo-upload-gallery.component').then(
        (m) => m.PhotoUploadGalleryComponent,
      ),
  },
  {
    path: 'components/bulk-action-bar',
    loadComponent: () =>
      import('./pages/bulk-action-bar/bulk-action-bar-gallery.component').then(
        (m) => m.BulkActionBarGalleryComponent,
      ),
  },
  {
    path: 'components/bulk-edit-menu',
    loadComponent: () =>
      import('./pages/bulk-edit-menu/bulk-edit-menu-gallery.component').then(
        (m) => m.BulkEditMenuGalleryComponent,
      ),
  },
  {
    path: 'components/impact-preview-dialog',
    loadComponent: () =>
      import('./pages/impact-preview-dialog/impact-preview-dialog-gallery.component').then(
        (m) => m.ImpactPreviewDialogGalleryComponent,
      ),
  },
  {
    path: 'components/column-selector',
    loadComponent: () =>
      import('./pages/column-selector/column-selector-gallery.component').then(
        (m) => m.ColumnSelectorGalleryComponent,
      ),
  },
  {
    path: 'components/inline-rename-cell',
    loadComponent: () =>
      import('./pages/inline-rename-cell/inline-rename-cell-gallery.component').then(
        (m) => m.InlineRenameCellGalleryComponent,
      ),
  },
  {
    path: 'components/group-popover',
    loadComponent: () =>
      import('./pages/group-popover/group-popover-gallery.component').then(
        (m) => m.GroupPopoverGalleryComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
