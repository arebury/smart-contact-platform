import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { InputComponent } from '@sc/design-system/components/input/input.component';
import { GalleryFooterComponent } from '../../shared/gallery-footer.component';

@Component({
  selector: 'sc-ds-docs-inputs-gallery',
  standalone: true,
  imports: [
    InputComponent,
    FormsModule,
    ReactiveFormsModule,
    FloatLabelModule,
    InputTextModule,
    GalleryFooterComponent,
  ],
  templateUrl: './inputs-gallery.component.html',
  styleUrl: './inputs-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputsGalleryComponent {
  protected readonly textValue = signal('');
  protected readonly emailValue = signal('rafa@smartcontact.io');
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

  protected readonly snippet = `import { InputComponent } from '@sc/design-system/components/input/input.component';

@Component({
  standalone: true,
  imports: [InputComponent],
  template: \`
    <sc-input
      label="Email"
      type="email"
      placeholder="tu@empresa.com"
      helperText="Lo usaremos para confirmar tu cuenta."
      [required]="true"
      [(value)]="email"
    />
  \`,
})
export class MyForm {
  email = signal('');
}`;

  protected touchReactive(): void {
    this.reactiveEmail.markAsTouched();
  }

  protected copySnippet(ev: MouseEvent): void {
    const btn = ev.currentTarget as HTMLButtonElement;
    const text = btn.dataset['snippet'] ?? this.snippet;
    navigator.clipboard?.writeText(text).then(() => {
      btn.classList.add('is-copied');
      btn.textContent = 'Copied';
      setTimeout(() => {
        btn.classList.remove('is-copied');
        btn.textContent = 'Copy';
      }, 1600);
    });
  }
}
