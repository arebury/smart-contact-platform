import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowLeft, Download, LucideAngularModule, Sparkles } from 'lucide-angular';

@Component({
  selector: 'sc-ds-docs-whats-new-v2',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './whats-new-v2.component.html',
  styleUrl: './whats-new-v2.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhatsNewV2Component {
  protected readonly arrowLeftIcon = ArrowLeft;
  protected readonly sparklesIcon = Sparkles;
  protected readonly downloadIcon = Download;
}
