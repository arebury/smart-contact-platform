import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Bordered card with a tinted header strip used to group form fields.
 * Mirrors the prototype's `SectionCard` from `shared/FormComponents.tsx`.
 */
@Component({
  selector: 'aed-section-card',
  imports: [TranslateModule],
  templateUrl: './section-card.component.html',
  styleUrl: './section-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionCardComponent {
  readonly titleKey = input.required<string>();
  readonly hintKey = input<string | null>(null);
  /** Anchor id used by `aed-form-section-nav` to scroll-spy / jump to this section. */
  readonly anchorId = input<string | null>(null);
}
