import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';

import { ScStickyFormHeaderComponent as StickyFormHeaderComponent } from '@smartcontact-hub/components';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-sticky-form-header-gallery',
  standalone: true,
  imports: [StickyFormHeaderComponent, ButtonModule, GalleryFooterComponent],
  templateUrl: './sticky-form-header-gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StickyFormHeaderGalleryComponent {
  protected readonly newName = signal('');
  protected readonly savedName = signal('Inés Ramírez');
  protected readonly saving = signal(false);
  protected readonly lastAction = signal<string | null>(null);

  protected onSave(label: string): void {
    this.lastAction.set(`${label} → save`);
  }

  protected onCancel(label: string): void {
    this.lastAction.set(`${label} → cancel`);
  }

  protected onRename(next: string): void {
    this.savedName.set(next);
    this.lastAction.set(`Rename → "${next}"`);
  }

  protected toggleSaving(): void {
    this.saving.update((v) => !v);
    setTimeout(() => this.saving.set(false), 1500);
  }
}
