import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ScSearchComponent as SearchComponent } from '@smartcontact-hub/components';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-search-gallery',
  standalone: true,
  imports: [
    SearchComponent,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    GalleryFooterComponent,
  ],
  templateUrl: './search-gallery.component.html',
  styleUrl: './search-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchGalleryComponent {
  // Signal binding — the canonical SCDS pattern.
  protected readonly basicQuery = signal('');
  protected readonly withHintQuery = signal('');
  protected readonly pickerQuery = signal('');
  protected readonly filledQuery = signal('');
  protected readonly prefilledQuery = signal('Marketing');

  // Reactive Forms binding.
  protected readonly searchCtrl = new FormControl('');

  // Public focus API demo.
  protected readonly demoSearch = viewChild<SearchComponent>('demoSearch');

  protected focusDemoSearch(): void {
    this.demoSearch()?.focus();
  }

  protected readonly lastKey = signal<string | null>(null);

  protected onKeydown(event: KeyboardEvent): void {
    this.lastKey.set(event.key);
  }
}
