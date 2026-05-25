import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import {
  FormSectionNavComponent,
  type FormNavSection,
} from '@sc/design-system/components/form-section-nav/form-section-nav.component';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-form-section-nav-gallery',
  standalone: true,
  imports: [FormSectionNavComponent, GalleryFooterComponent],
  templateUrl: './form-section-nav-gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSectionNavGalleryComponent {
  protected readonly fullSections: readonly FormNavSection[] = [
    { id: 'profile', labelKey: 'Perfil', icon: 'person' },
    { id: 'notifications', labelKey: 'Notificaciones', icon: 'notifications' },
    { id: 'permissions', labelKey: 'Permisos', icon: 'checklist' },
    { id: 'integrations', labelKey: 'Integraciones', icon: 'call' },
    { id: 'advanced', labelKey: 'Avanzado', icon: 'tune' },
  ];

  protected readonly compactSections: readonly FormNavSection[] = [
    { id: 'basics', labelKey: 'Básicos' },
    { id: 'rules', labelKey: 'Reglas' },
    { id: 'audit', labelKey: 'Auditoría' },
  ];

  protected readonly activeFull = signal<string>('profile');
  protected readonly activeCompact = signal<string>('basics');
}
