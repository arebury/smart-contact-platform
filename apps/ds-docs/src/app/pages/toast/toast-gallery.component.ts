import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { IconComponent } from '@sc/design-system';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-toast-gallery',
  standalone: true,
  imports: [ButtonModule, ToastModule, IconComponent, GalleryFooterComponent],
  templateUrl: './toast-gallery.component.html',
  styleUrl: './toast-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
})
export class ToastGalleryComponent {
  private readonly messages = inject(MessageService);

  protected readonly icons = {
    success: 'check_circle',
    info: 'info',
    warn: 'error',
    error: 'cancel',
    draft: 'description',
    close: 'close',
  };

  protected iconFor(severity: string) {
    switch (severity) {
      case 'success':
        return this.icons.success;
      case 'warn':
        return this.icons.warn;
      case 'error':
        return this.icons.error;
      case 'secondary':
        return this.icons.draft;
      default:
        return this.icons.info;
    }
  }

  protected fireSuccess(): void {
    this.messages.add({
      severity: 'success',
      summary: 'Guardado',
      detail: 'Cambios aplicados.',
      life: 3000,
    });
  }
  protected fireInfo(): void {
    this.messages.add({
      severity: 'info',
      summary: 'Nuevo agente conectado',
      detail: 'Una persona acaba de iniciar sesión.',
      life: 3000,
    });
  }
  protected fireWarn(): void {
    this.messages.add({
      severity: 'warn',
      summary: 'Quota próxima al límite',
      detail: 'Has usado el 87% de tu cuota mensual.',
      life: 4000,
    });
  }
  protected fireError(): void {
    this.messages.add({
      severity: 'error',
      summary: 'No se pudo guardar',
      detail: 'Comprueba la conexión e inténtalo de nuevo.',
      life: 5000,
    });
  }
  protected fireSecondary(): void {
    this.messages.add({
      severity: 'secondary',
      summary: 'Borrador creado',
      detail: 'Puedes seguir editando.',
      life: 3000,
    });
  }
  protected fireUndo(): void {
    this.messages.add({
      severity: 'success',
      summary: 'Agente eliminado',
      detail: '"María García" se borró correctamente.',
      life: 6000,
      data: { undoEntryId: 'demo-undo-' + Date.now() },
    });
  }
  protected fireSticky(): void {
    this.messages.add({
      severity: 'info',
      summary: 'Sincronización en curso',
      detail: 'Esperando confirmación del backend. No se cierra solo.',
      sticky: true,
    });
  }
  protected fireLong(): void {
    this.messages.add({
      severity: 'warn',
      summary: 'Aviso de migración',
      detail:
        'Tu plan caduca en 30 días. Te recomendamos renovar antes para mantener el acceso a las funcionalidades premium sin interrupciones.',
      life: 6000,
    });
  }

  protected clearAll(): void {
    this.messages.clear();
  }

  protected onUndoClick(_undoId: string): void {
    this.messages.clear();
  }
  protected onClose(): void {
    this.messages.clear();
  }
}
