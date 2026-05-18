import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Bell, ListChecks, Phone, Settings2, User } from 'lucide-angular';

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
    { id: 'profile', labelKey: 'Perfil', icon: User },
    { id: 'notifications', labelKey: 'Notificaciones', icon: Bell },
    { id: 'permissions', labelKey: 'Permisos', icon: ListChecks },
    { id: 'integrations', labelKey: 'Integraciones', icon: Phone },
    { id: 'advanced', labelKey: 'Avanzado', icon: Settings2 },
  ];

  protected readonly compactSections: readonly FormNavSection[] = [
    { id: 'basics', labelKey: 'Básicos' },
    { id: 'rules', labelKey: 'Reglas' },
    { id: 'audit', labelKey: 'Auditoría' },
  ];

  protected readonly activeFull = signal<string>('profile');
  protected readonly activeCompact = signal<string>('basics');
}
