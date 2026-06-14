import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ScMultiSelectComponent as MultiSelectComponent } from '@smartcontact-hub/components';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

interface ChannelOption {
  readonly label: string;
  readonly code: string;
}

@Component({
  selector: 'sc-ds-docs-multiselect-gallery',
  standalone: true,
  imports: [MultiSelectComponent, FormsModule, ReactiveFormsModule, GalleryFooterComponent],
  templateUrl: './multiselect-gallery.component.html',
  styleUrl: './multiselect-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiSelectGalleryComponent {
  protected readonly fruits = ['Manzana', 'Pera', 'Plátano', 'Naranja', 'Kiwi'] as const;
  protected readonly basicValue = signal<string[]>([]);

  protected readonly channels: readonly ChannelOption[] = [
    { label: 'Email', code: 'email' },
    { label: 'WhatsApp', code: 'whatsapp' },
    { label: 'Teléfono', code: 'phone' },
    { label: 'SMS', code: 'sms' },
    { label: 'Web chat', code: 'web' },
  ];
  protected readonly channelsValue = signal<string[]>(['email', 'whatsapp']);

  protected readonly chipsValue = signal<string[]>(['Pera', 'Naranja']);
  protected readonly clearableValue = signal<string[]>(['Manzana']);

  protected readonly reactiveChannels = new FormControl<string[]>([], {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(1)],
  });

  protected touchReactive(): void {
    this.reactiveChannels.markAsTouched();
  }
}
