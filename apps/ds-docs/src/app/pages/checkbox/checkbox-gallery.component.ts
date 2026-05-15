import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  TriStateCheckboxComponent,
  type TriState,
} from '@sc/design-system/components/tri-state-checkbox/tri-state-checkbox.component';

@Component({
  selector: 'sc-ds-docs-checkbox-gallery',
  standalone: true,
  imports: [TriStateCheckboxComponent],
  templateUrl: './checkbox-gallery.component.html',
  styleUrl: './checkbox-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxGalleryComponent {
  // Binary checkboxes (state 'none' or 'all')
  protected readonly basic = signal<TriState>('none');
  protected readonly preChecked = signal<TriState>('all');
  protected readonly smValue = signal<TriState>('none');
  protected readonly mdValue = signal<TriState>('all');
  protected readonly lgValue = signal<TriState>('none');
  protected readonly filledValue = signal<TriState>('all');

  // Tri-state demo: header controls 3 children
  protected readonly child1 = signal<TriState>('all');
  protected readonly child2 = signal<TriState>('all');
  protected readonly child3 = signal<TriState>('none');

  protected readonly headerState = signal<TriState>('some');

  constructor() {
    // Recompute header whenever a child changes
    this.recomputeHeader();
  }

  protected onBinaryToggle(sig: ReturnType<typeof signal<TriState>>, next: boolean): void {
    sig.set(next ? 'all' : 'none');
  }

  protected onChildToggle(idx: 1 | 2 | 3, next: boolean): void {
    const sig = idx === 1 ? this.child1 : idx === 2 ? this.child2 : this.child3;
    sig.set(next ? 'all' : 'none');
    this.recomputeHeader();
  }

  protected onHeaderToggle(next: boolean): void {
    const s: TriState = next ? 'all' : 'none';
    this.child1.set(s);
    this.child2.set(s);
    this.child3.set(s);
    this.recomputeHeader();
  }

  private recomputeHeader(): void {
    const states = [this.child1(), this.child2(), this.child3()];
    const allOn = states.every((s) => s === 'all');
    const allOff = states.every((s) => s === 'none');
    this.headerState.set(allOn ? 'all' : allOff ? 'none' : 'some');
  }
}
