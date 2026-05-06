import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Tiny footer shown under list tables: "{N} {entity_plural} encontrados".
 * Always rendered (text changes); the wrapper reserves vertical space so
 * the bulk action bar doesn't overlap it on selection (DD#8).
 *
 * `entityPlural` expects an already-translated literal — callers pipe
 * their i18n key through `| translate` at the call site. Keeps the
 * component dumb so the repo-list-page can pass a runtime entity name
 * that doesn't exist as a static i18n key.
 */
@Component({
  selector: 'aed-result-counter',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './result-counter.component.html',
  styleUrl: './result-counter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultCounterComponent {
  readonly count = input.required<number>();
  readonly entityPlural = input.required<string>();
}
