import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideAngularModule, X } from 'lucide-angular';

import type { LabelColor } from '../../../features/admin/labels/data/labels-data';

export interface LabelChipModel {
  readonly name: string;
  readonly color: LabelColor;
}

/**
 * Small categorical chip used to render a label inline (table cell, agent
 * row, picker selection…). Optionally renders a × button for removal flows.
 */
@Component({
  selector: 'aed-label-chip',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './label-chip.component.html',
  styleUrl: './label-chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelChipComponent {
  readonly label = input.required<LabelChipModel>();
  readonly size = input<'sm' | 'xs'>('sm');
  readonly removable = input(false);

  readonly remove = output<void>();

  protected readonly closeIcon = X;

  protected readonly cssVars = computed(() => {
    const color = this.label().color;
    return {
      '--chip-bg': `var(--sc-label-${color}-bg)`,
      '--chip-text': `var(--sc-label-${color}-text)`,
      '--chip-border': `var(--sc-label-${color}-border)`,
      '--chip-dot': `var(--sc-label-${color}-dot)`,
    } as Record<string, string>;
  });

  protected onRemove(event: MouseEvent): void {
    event.stopPropagation();
    this.remove.emit();
  }
}
