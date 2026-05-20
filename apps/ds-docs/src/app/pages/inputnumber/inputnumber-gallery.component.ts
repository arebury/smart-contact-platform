import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputNumberComponent } from '@sc/design-system/components/inputnumber/inputnumber.component';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-inputnumber-gallery',
  standalone: true,
  imports: [InputNumberComponent, FormsModule, ReactiveFormsModule, GalleryFooterComponent],
  templateUrl: './inputnumber-gallery.component.html',
  styleUrl: './inputnumber-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputNumberGalleryComponent {
  protected readonly counterValue = signal<number | null>(3);
  protected readonly capacityValue = signal<number | null>(null);
  protected readonly secondsValue = signal<number | null>(45);
  protected readonly percentValue = signal<number | null>(80);
  protected readonly disabledValue = signal<number | null>(10);
  protected readonly ngModelValue = signal<number | null>(7);

  protected readonly reactiveAgents = new FormControl<number | null>(null, {
    validators: [Validators.required, Validators.min(1), Validators.max(50)],
  });

  protected touchReactive(): void {
    this.reactiveAgents.markAsTouched();
  }
}
