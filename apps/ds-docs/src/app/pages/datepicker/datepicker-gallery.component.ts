import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatepickerComponent } from '@sc/design-system/components/datepicker/datepicker.component';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-datepicker-gallery',
  standalone: true,
  imports: [DatepickerComponent, FormsModule, ReactiveFormsModule, GalleryFooterComponent],
  templateUrl: './datepicker-gallery.component.html',
  styleUrl: './datepicker-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerGalleryComponent {
  // Various binding modes
  protected readonly basicValue = signal<Date | null>(null);
  protected readonly today = new Date();
  protected readonly preselected = signal<Date | null>(new Date());
  protected readonly inlineValue = signal<Date | null>(new Date());
  protected readonly disabledValue = signal<Date | null>(new Date());
  protected readonly ngModelValue = signal<Date | null>(null);

  // Bounded range
  protected readonly minDate = new Date();
  protected readonly maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // +30 days
  protected readonly boundedValue = signal<Date | null>(null);

  // Month / Year only views
  protected readonly monthValue = signal<Date | null>(null);
  protected readonly yearValue = signal<Date | null>(null);

  // Reactive Forms
  protected readonly reactiveDate = new FormControl<Date | null>(null, {
    validators: [Validators.required],
  });

  protected touchReactive(): void {
    this.reactiveDate.markAsTouched();
  }

  protected formatDate(d: Date | null): string {
    return d ? d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '(sin fecha)';
  }
}
