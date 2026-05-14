import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule, Phone } from 'lucide-angular';

type LucideIconRef = typeof Phone;

/**
 * Static page header used by non-entity routes (`/config/*` and list
 * pages). Visually mirrors `sc-sticky-form-header` — same leading icon
 * (44×44), uppercase entity eyebrow, large title, subtle subtitle — so
 * the rest of the app reads as part of the same family.
 *
 * Unlike `sticky-form-header`, this header is static (no sticky), has no
 * actions block, and accepts a Lucide icon instead of a projected
 * photo/avatar component.
 */
@Component({
  selector: 'sc-page-header',
  imports: [LucideAngularModule, TranslateModule],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  /** i18n key for the small uppercase eyebrow above the title. Optional. */
  readonly entityKey = input<string | null>(null);
  /** i18n key for the main title. */
  readonly titleKey = input.required<string>();
  /** i18n key for the subtle subtitle line below the title. Optional. */
  readonly subtitleKey = input<string | null>(null);
  /** Leading Lucide icon (rendered in a 44×44 chip). Optional. */
  readonly icon = input<LucideIconRef | null>(null);
}
