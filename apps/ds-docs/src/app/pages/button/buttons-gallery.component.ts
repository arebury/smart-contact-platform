import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';

/**
 * Live gallery of the PrimeNG button component as themed by AED's
 * `sc-preset.ts`. Renders every severity × variant combination so a
 * designer or dev can see at a glance what's available without
 * crawling PrimeOne's Figma.
 *
 * This is dev-only. Not linked from the sidebar; reach it at
 * `/dev/buttons`. Kept simple — no fancy chrome, just the buttons.
 *
 * If you find a variant whose color doesn't match AED brand, the fix
 * goes in `src/app/core/tokens/sc-preset.ts` (the bridge), not here.
 */
@Component({
  selector: 'sc-buttons-gallery',
  imports: [ButtonModule, TitleCasePipe],
  templateUrl: './buttons-gallery.component.html',
  styleUrl: './buttons-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonsGalleryComponent {
  protected readonly severities = [
    'primary',
    'secondary',
    'success',
    'info',
    'warn',
    'help',
    'danger',
    'contrast',
  ] as const;

  protected readonly sizes = ['small', undefined, 'large'] as const;

  protected readonly loading = signal(false);

  protected toggleLoading(): void {
    this.loading.update((v) => !v);
  }
}
