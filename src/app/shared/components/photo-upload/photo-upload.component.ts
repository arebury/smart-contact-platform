import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Camera, LucideAngularModule, UserCog } from 'lucide-angular';
import { MessageService } from 'primeng/api';

import { IllustratedAvatarComponent } from '../illustrated-avatar/illustrated-avatar.component';

const MAX_BYTES = 800 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

/**
 * Round avatar uploader. Mirrors the React prototype's photo button
 * (Agents + Users): hover overlay with camera icon, hidden file input,
 * "Eliminar foto" link below. Validates type + size locally and bubbles
 * up the data URL via `(photoChange)`.
 *
 * When the entity has no uploaded photo, the placeholder defers to one
 * of three states, in order of preference:
 *   1. `[name]` set — render the {@link IllustratedAvatarComponent}
 *      hashed from the name. Same portrait the lists show, so the form
 *      preview matches what the user sees in the table cell.
 *   2. No name — fall back to the generic `UserCog` lucide glyph
 *      (the original behaviour, kept for entity types that aren't
 *      person-shaped).
 */
@Component({
  selector: 'aed-photo-upload',
  imports: [IllustratedAvatarComponent, LucideAngularModule, TranslateModule],
  templateUrl: './photo-upload.component.html',
  styleUrl: './photo-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoUploadComponent {
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);

  readonly photo = input<string | null | undefined>(null);
  /** Optional entity name; when set, drives the illustrated-portrait
   *  fallback so the form preview matches the list cell. */
  readonly name = input<string | null | undefined>(null);
  /** Tooltip / aria-label override; defaults to a generic "Cambiar foto". */
  readonly ariaLabel = input<string>('Cambiar foto');

  readonly photoChange = output<string | null>();

  protected readonly cameraIcon = Camera;
  protected readonly placeholderIcon = UserCog;
  protected readonly hovering = signal(false);

  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  protected openPicker(): void {
    this.fileInput().nativeElement.click();
  }

  protected onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    // Reset the input so re-selecting the same file still fires `change`.
    input.value = '';
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      this.messages.add({
        severity: 'error',
        summary: this.translate.instant('common.photo.invalid_type'),
        life: 3500,
      });
      return;
    }
    if (file.size > MAX_BYTES) {
      this.messages.add({
        severity: 'error',
        summary: this.translate.instant('common.photo.too_large'),
        life: 3500,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') this.photoChange.emit(result);
    };
    reader.readAsDataURL(file);
  }

  protected onRemove(): void {
    this.photoChange.emit(null);
  }
}
