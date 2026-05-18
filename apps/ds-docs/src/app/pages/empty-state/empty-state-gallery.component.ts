import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Inbox, Search, Users } from 'lucide-angular';

import { EmptyStateComponent } from '@sc/design-system/components/empty-state/empty-state.component';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-empty-state-gallery',
  standalone: true,
  imports: [EmptyStateComponent, GalleryFooterComponent],
  templateUrl: './empty-state-gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateGalleryComponent {
  protected readonly inboxIcon = Inbox;
  protected readonly searchIcon = Search;
  protected readonly usersIcon = Users;

  protected readonly lastCta = signal<string | null>(null);

  protected onCta(label: string): void {
    this.lastCta.set(label);
  }
}
