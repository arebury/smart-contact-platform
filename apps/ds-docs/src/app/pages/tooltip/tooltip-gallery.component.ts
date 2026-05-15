import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-tooltip-gallery',
  standalone: true,
  imports: [ButtonModule, TooltipModule, GalleryFooterComponent],
  templateUrl: './tooltip-gallery.component.html',
  styleUrl: './tooltip-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipGalleryComponent {}
