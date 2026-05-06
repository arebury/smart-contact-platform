import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

import { UndoStackService } from '@core/services';

@Component({
  selector: 'aed-root',
  standalone: true,
  imports: [ConfirmDialogModule, RouterOutlet, ToastModule, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  protected readonly undoStack = inject(UndoStackService);

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
}
