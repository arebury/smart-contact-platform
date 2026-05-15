import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectComponent } from '@sc/design-system/components/select/select.component';

interface CityOption {
  readonly label: string;
  readonly code: string;
  readonly region: string;
}

@Component({
  selector: 'sc-ds-docs-select-gallery',
  standalone: true,
  imports: [SelectComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './select-gallery.component.html',
  styleUrl: './select-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectGalleryComponent {
  // Plain string options (simplest case)
  protected readonly fruits = ['Manzana', 'Pera', 'Plátano', 'Naranja', 'Kiwi'] as const;
  protected readonly fruitValue = signal<string | undefined>(undefined);

  // Object options with label + value (typical for entities)
  protected readonly cities: readonly CityOption[] = [
    { label: 'Madrid', code: 'MAD', region: 'Comunidad de Madrid' },
    { label: 'Barcelona', code: 'BCN', region: 'Cataluña' },
    { label: 'Valencia', code: 'VAL', region: 'Comunidad Valenciana' },
    { label: 'Sevilla', code: 'SEV', region: 'Andalucía' },
    { label: 'Bilbao', code: 'BIO', region: 'País Vasco' },
    { label: 'Zaragoza', code: 'ZAZ', region: 'Aragón' },
    { label: 'Málaga', code: 'AGP', region: 'Andalucía' },
  ];
  protected readonly cityCode = signal<string | undefined>('MAD');
  protected readonly cityFull = signal<CityOption | undefined>(undefined);

  // Disabled + readonly demos
  protected readonly disabledValue = signal<string | undefined>('Plátano');
  protected readonly clearableValue = signal<string | undefined>('Pera');

  // ngModel demo
  protected readonly ngModelValue = signal<string | undefined>('Naranja');

  // Reactive Forms demo
  protected readonly reactiveCity = new FormControl<string | null>(null, {
    validators: [Validators.required],
  });

  protected touchReactive(): void {
    this.reactiveCity.markAsTouched();
  }
}
