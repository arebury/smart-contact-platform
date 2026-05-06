import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule, Trash2 } from 'lucide-angular';

/**
 * End-of-form section that hosts irreversible / sensitive actions
 * (delete, transfer, archive). Lives at the bottom of edit pages so the
 * destructive button is intentionally out of the primary scan path.
 *
 * Pairs with the page's existing impact-preview / confirmation dialog —
 * this component is just the visual frame and the trigger.
 */
@Component({
  selector: 'aed-form-danger-zone',
  standalone: true,
  imports: [LucideAngularModule, TranslateModule],
  templateUrl: './form-danger-zone.component.html',
  styleUrl: './form-danger-zone.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormDangerZoneComponent {
  readonly titleKey = input<string>('common.danger_zone.title');
  readonly descriptionKey = input.required<string>();
  readonly actionKey = input<string>('common.delete');
  readonly disabled = input<boolean>(false);

  readonly action = output<void>();

  protected readonly trashIcon = Trash2;
}
