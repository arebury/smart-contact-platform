import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { ScPhotoUploadComponent as PhotoUploadComponent } from '@smartcontact-hub/components';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-photo-upload-gallery',
  standalone: true,
  imports: [PhotoUploadComponent, ToastModule, GalleryFooterComponent],
  providers: [MessageService],
  templateUrl: './photo-upload-gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoUploadGalleryComponent {
  protected readonly fresh = signal<string | null>(null);
  protected readonly withPhoto = signal<string | null>(
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%231b273d"/><text x="100" y="115" font-size="60" text-anchor="middle" fill="white" font-family="sans-serif">M</text></svg>',
  );
  protected readonly compact = signal<string | null>(null);
}
