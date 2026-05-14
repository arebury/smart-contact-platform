import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule, Phone } from 'lucide-angular';

type LucideIconRef = typeof Phone;

export interface FormNavSection {
  /** Stable id used by the parent to identify the active section. */
  readonly id: string;
  /** i18n key for the link label. */
  readonly labelKey: string;
  /** Optional i18n key for a short hint shown inline next to the label. */
  readonly hintKey?: string;
  /** Lucide icon shown to the left of the label. Optional. */
  readonly icon?: LucideIconRef;
}

/**
 * Controlled in-form section nav. Each item is a tab — the parent owns
 * `activeId` and the nav emits `activeChange` when the user clicks. Used
 * by the form shells (agents / groups / users) where each section is a
 * switchable pane instead of a scrolled block.
 */
@Component({
  selector: 'aed-form-section-nav',
  imports: [LucideAngularModule, TranslateModule],
  templateUrl: './form-section-nav.component.html',
  styleUrl: './form-section-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSectionNavComponent {
  readonly sections = input.required<readonly FormNavSection[]>();
  readonly activeId = input<string | null>(null);
  readonly labelKey = input<string>('common.form_nav.label');
  /** Drops the outer card chrome so the nav can be embedded inside another container. */
  readonly compact = input<boolean>(false);

  readonly activeChange = output<string>();

  protected onJump(event: MouseEvent, id: string): void {
    event.preventDefault();
    this.activeChange.emit(id);
  }
}
