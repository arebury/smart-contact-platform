import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Bordered card with a tinted header strip used to group form fields.
 * Mirrors the prototype's `SectionCard` from `shared/FormComponents.tsx`.
 */
@Component({
  selector: 'aed-section-card',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './section-card.component.html',
  styleUrl: './section-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionCardComponent {
  readonly titleKey = input.required<string>();
  readonly hintKey = input<string | null>(null);
}
