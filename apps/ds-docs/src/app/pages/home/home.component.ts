import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'sc-ds-docs-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  protected readonly components = [
    {
      slug: 'button',
      name: 'Button',
      status: 'ready' as const,
      summary: 'PrimeNG <p-button> rendered with the AED brand palette via sc-preset.',
    },
    {
      slug: 'input',
      name: 'Input',
      status: 'ready' as const,
      summary: 'Text input — wrapper sobre pInputText con label, helper, error e iconos.',
    },
  ];
}
