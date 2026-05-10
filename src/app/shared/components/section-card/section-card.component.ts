import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule, Plus } from 'lucide-angular';

type LucideIcon = typeof Plus;

/**
 * Bordered card with a tinted header strip used to group form fields.
 * Mirrors the prototype's `SectionCard` from `shared/FormComponents.tsx`.
 */
@Component({
  selector: 'aed-section-card',
  imports: [TranslateModule, LucideAngularModule],
  templateUrl: './section-card.component.html',
  styleUrl: './section-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionCardComponent {
  readonly titleKey = input.required<string>();
  readonly hintKey = input<string | null>(null);
  /** Anchor id used by `aed-form-section-nav` to scroll-spy / jump to this section. */
  readonly anchorId = input<string | null>(null);
  /** Optional leading icon for the title row. Pass any Lucide icon directly. */
  readonly icon = input<LucideIcon | null>(null);
}
