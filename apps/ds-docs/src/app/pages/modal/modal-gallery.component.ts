import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { LucideAngularModule, Trash2, AlertTriangle, Pencil, Info } from 'lucide-angular';
import { ModalComponent } from '@sc/design-system/components/modal/modal.component';
import { InputComponent } from '@sc/design-system/components/input/input.component';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-modal-gallery',
  standalone: true,
  imports: [
    ModalComponent,
    InputComponent,
    ButtonModule,
    LucideAngularModule,
    FormsModule,
    GalleryFooterComponent,
  ],
  templateUrl: './modal-gallery.component.html',
  styleUrl: './modal-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalGalleryComponent {
  protected readonly icons = {
    trash: Trash2,
    warning: AlertTriangle,
    edit: Pencil,
    info: Info,
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
