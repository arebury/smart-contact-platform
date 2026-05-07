import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule, Phone } from 'lucide-angular';

/** Lucide icon ref type — same approach as `aed-settings-sidebar`. */
type LucideIconRef = typeof Phone;

export interface FormNavSection {
  /** Stable id used to identify the section. Parent owns the active state. */
  readonly id: string;
  /** i18n key for the link label. */
  readonly labelKey: string;
  /** Lucide icon shown to the left of the label. Optional. */
  readonly icon?: LucideIconRef;
}

/**
 * In-form section nav — controlled. The parent owns `activeId` and the
 * nav simply emits `activeChange` when the user clicks an item. Used by
 * the Aircall-style shell where each form section is a switchable pane.
 */
@Component({
  selector: 'aed-form-section-nav',
  standalone: true,
  imports: [LucideAngularModule, TranslateModule],
  templateUrl: './form-section-nav.component.html',
  styleUrl: './form-section-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSectionNavComponent {
  readonly sections = input.required<readonly FormNavSection[]>();
  readonly activeId = input<string | null>(null);
  readonly labelKey = input<string>('common.form_nav.label');
  /** Drops the outer card chrome so the nav can be embedded inside another
   * container. */
  readonly compact = input<boolean>(false);

  readonly activeChange = output<string>();

  protected onJump(event: MouseEvent, id: string): void {
    event.preventDefault();
    this.activeChange.emit(id);
  }
}
