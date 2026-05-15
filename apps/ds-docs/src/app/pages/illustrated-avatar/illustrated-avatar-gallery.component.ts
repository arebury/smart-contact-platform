import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IllustratedAvatarComponent } from '@sc/design-system/components/illustrated-avatar/illustrated-avatar.component';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-illustrated-avatar-gallery',
  standalone: true,
  imports: [IllustratedAvatarComponent, GalleryFooterComponent],
  templateUrl: './illustrated-avatar-gallery.component.html',
  styleUrl: './illustrated-avatar-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IllustratedAvatarGalleryComponent {
  /** Nombres de muestra para el pool illustrated (personas). */
  protected readonly personNames: readonly string[] = [
    'María García',
    'Carlos Ruiz',
    'Ana Soto',
    'Pedro Sánchez',
    'Laura Fernández',
    'Diego Martín',
    'Sofía López',
    'Javier Romero',
  ];

  /** Nombres de muestra para el pool abstract (grupos / entidades). */
  protected readonly groupNames: readonly string[] = [
    'Ventas Nacional',
    'Cobros',
    'VIP',
    'Soporte técnico',
    'Reclamaciones',
  ];

  /** Data URL de placeholder para mostrar foto subida (ejemplo). */
  protected readonly samplePhoto =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMzQ0YTcwIi8+PHRleHQgeD0iMzIiIHk9IjQwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkpQPC90ZXh0Pjwvc3ZnPg==';
}
