import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconComponent } from '@sc/design-system';

@Component({
  selector: 'sc-ds-docs-whats-new-v2',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './whats-new-v2.component.html',
  styleUrl: './whats-new-v2.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhatsNewV2Component {
  protected readonly arrowLeftIcon = 'arrow_back';
  protected readonly sparklesIcon = 'auto_awesome';
  protected readonly downloadIcon = 'download';
}
