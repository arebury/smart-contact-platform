import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import {
  ColorDotPickerComponent,
  type ColorDotOption,
} from '@sc/design-system/components/color-dot-picker/color-dot-picker.component';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-color-dot-picker-gallery',
  standalone: true,
  imports: [ColorDotPickerComponent, GalleryFooterComponent],
  templateUrl: './color-dot-picker-gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorDotPickerGalleryComponent {
  /** Paleta real `--sc-label-<color>-dot` — 8 valores. */
  protected readonly labelColors: readonly ColorDotOption[] = [
    { value: 'gray', label: 'Gris', color: 'var(--sc-label-gray-dot)' },
    { value: 'red', label: 'Rojo', color: 'var(--sc-label-red-dot)' },
    { value: 'orange', label: 'Naranja', color: 'var(--sc-label-orange-dot)' },
    { value: 'amber', label: 'Ámbar', color: 'var(--sc-label-amber-dot)' },
    { value: 'green', label: 'Verde', color: 'var(--sc-label-green-dot)' },
    { value: 'teal', label: 'Verde azulado', color: 'var(--sc-label-teal-dot)' },
    { value: 'blue', label: 'Azul', color: 'var(--sc-label-blue-dot)' },
    { value: 'purple', label: 'Violeta', color: 'var(--sc-label-purple-dot)' },
  ];

  /** Paleta corta de "tone" libre — para mostrar que options es genérico. */
  protected readonly toneColors: readonly ColorDotOption[] = [
    { value: 'sky', label: 'Sky', color: '#0ea5e9' },
    { value: 'lime', label: 'Lime', color: '#84cc16' },
    { value: 'fuchsia', label: 'Fuchsia', color: '#d946ef' },
  ];

  protected readonly labelValue = signal<string>('green');
  protected readonly toneValue = signal<string>('sky');
}
