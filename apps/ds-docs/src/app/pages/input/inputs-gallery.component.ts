import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { InputComponent } from '@sc/design-system/components/input/input.component';

@Component({
  selector: 'sc-ds-docs-inputs-gallery',
  standalone: true,
  imports: [InputComponent, FormsModule, ReactiveFormsModule, FloatLabelModule, InputTextModule],
  templateUrl: './inputs-gallery.component.html',
  styleUrl: './inputs-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputsGalleryComponent {
  protected readonly textValue = signal('');
  protected readonly emailValue = signal('rafa@smartcontact.io');
  protected readonly searchValue = signal('');
  protected readonly disabledValue = signal('Disabled value');
  protected readonly errorValue = signal('not-an-email');
  protected readonly ngModelValue = signal('Two-way via ngModel');

  protected floatOverValue = '';
  protected floatInValue = '';
  protected floatOnValue = '';

  protected readonly reactiveEmail = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });

  protected touchReactive(): void {
    this.reactiveEmail.markAsTouched();
  }
}
