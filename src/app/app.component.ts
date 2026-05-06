import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  LucideAngularModule,
  X,
} from 'lucide-angular';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { UndoStackService } from '@core/services';
import {
  CommandPaletteComponent,
  ConfirmHostComponent,
  KeyboardShortcutsComponent,
} from '@shared/components';

type ToastSeverity = 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast';

@Component({
  selector: 'aed-root',
  standalone: true,
  imports: [
    CommandPaletteComponent,
    ConfirmHostComponent,
    KeyboardShortcutsComponent,
    LucideAngularModule,
    RouterOutlet,
    ToastModule,
    TranslateModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly messages = inject(MessageService);
  protected readonly undoStack = inject(UndoStackService);

  protected readonly closeIcon = X;

  /**
   * Global Ctrl/Cmd+Z — run the most recent undoable action. Skip when the
   * focus is in a text field so we don't shadow the browser's native input
   * undo (DD#2680).
   */
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'z') return;
    if (event.shiftKey) return; // leave Ctrl+Shift+Z (redo) for the browser
    const target = event.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable)
    ) {
      return;
    }
    if (!this.undoStack.hasUndo()) return;
    event.preventDefault();
    this.undoStack.popLatest();
  }

  protected onUndoClick(entryId: string): void {
    this.undoStack.runById(entryId);
  }

  /**
   * Map a PrimeNG severity to a Lucide icon. Falls back to Info so an
   * unrecognised severity still renders an icon square. The `secondary`
   * severity is the indigo "neutral notice" variant — same Info glyph as
   * `info`, the colour palette is what distinguishes them.
   */
  protected iconFor(severity: ToastSeverity | undefined) {
    switch (severity) {
      case 'success':
        return CheckCircle2;
      case 'warn':
        return AlertTriangle;
      case 'error':
        return AlertCircle;
      case 'info':
      case 'secondary':
      default:
        return Info;
    }
  }

  /**
   * Manual dismiss on the toast's close X. PrimeNG `MessageService.clear()`
   * with no key clears every active toast — acceptable here because the
   * app rarely shows two simultaneous toasts.
   */
  protected onClose(): void {
    this.messages.clear();
  }
}
