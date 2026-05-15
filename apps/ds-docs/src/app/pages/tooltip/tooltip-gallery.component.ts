import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'sc-ds-docs-tooltip-gallery',
  standalone: true,
  imports: [ButtonModule, TooltipModule],
  templateUrl: './tooltip-gallery.component.html',
  styleUrl: './tooltip-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipGalleryComponent {}
