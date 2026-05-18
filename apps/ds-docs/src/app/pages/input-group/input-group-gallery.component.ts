import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';

import { InputGroupComponent } from '@sc/design-system/components/input-group/input-group.component';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-input-group-gallery',
  standalone: true,
  imports: [
    InputGroupComponent,
    InputGroupAddonModule,
    InputTextModule,
    ButtonModule,
    GalleryFooterComponent,
  ],
  templateUrl: './input-group-gallery.component.html',
  styleUrl: './input-group-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputGroupGalleryComponent {
  protected readonly username = signal('');
  protected readonly price = signal('');
  protected readonly website = signal('');
  protected readonly multi = signal('');
  protected readonly button = signal('');
  protected readonly tag = signal('');
  protected readonly tags = signal<readonly string[]>(['Baño', 'Comida', 'Formación']);

  protected addTag(): void {
    const next = this.tag().trim();
    if (!next) return;
    if (this.tags().includes(next)) {
      this.tag.set('');
      return;
    }
    this.tags.update((arr) => [...arr, next]);
    this.tag.set('');
  }

  protected removeTag(t: string): void {
    this.tags.update((arr) => arr.filter((x) => x !== t));
  }

  protected onTagKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTag();
    }
  }
}
