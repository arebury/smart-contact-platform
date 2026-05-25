import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogComponent } from '@sc/design-system/components/dialog/dialog.component';
import { InputTextComponent } from '@sc/design-system/components/inputtext/inputtext.component';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-dialog-gallery',
  standalone: true,
  imports: [DialogComponent, InputTextComponent, ButtonModule, FormsModule, GalleryFooterComponent],
  templateUrl: './dialog-gallery.component.html',
  styleUrl: './dialog-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogGalleryComponent {
  protected readonly icons = {
    trash: 'delete',
    warning: 'warning',
    edit: 'edit',
    info: 'info',
  };

  protected readonly basicOpen = signal(false);
  protected readonly confirmOpen = signal(false);
  protected readonly bodylessOpen = signal(false);
  protected readonly formOpen = signal(false);
  protected readonly scrollOpen = signal(false);

  // Form demo state
  protected readonly agentName = signal('María García');
  protected readonly agentEmail = signal('maria@empresa.com');

  protected onSave(): void {
    this.formOpen.set(false);
  }

  protected onDelete(): void {
    this.confirmOpen.set(false);
  }

  protected onDiscard(): void {
    this.bodylessOpen.set(false);
  }
}
