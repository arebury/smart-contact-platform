import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
  computed,
} from '@angular/core';
import { InputGroupModule } from 'primeng/inputgroup';

export type ScInputGroupSize = 'sm' | 'md' | 'lg';

/**
 * Smart Contact input group — wrapper Extended sobre `<p-inputgroup>` para
 * componer un input con addons left/right (texto, icono, botón, checkbox o
 * radio). PrimeNG ya hace el border-merge entre el input y los addons; el
 * wrapper aquí solo añade:
 *   - selector brand-prefijado `sc-input-group` (consistencia DS).
 *   - prop `size` que matchea `sc-input` (sm/md/lg) para combinar alturas
 *     cuando el input-group convive con otros campos.
 *
 * Patrón de uso (content projection):
 * ```html
 * <sc-input-group>
 *   <p-inputgroup-addon>$</p-inputgroup-addon>
 *   <input pInputText placeholder="Price" />
 *   <p-inputgroup-addon>.00</p-inputgroup-addon>
 * </sc-input-group>
 * ```
 *
 * El consumer importa `InputGroupAddonModule` y `InputTextModule` de PrimeNG
 * para usar los slots — el wrapper SC no los re-empaqueta para mantener la
 * superficie del componente mínima (memoria minimal-customization).
 *
 * Figma SC reference: `❖ InputGroup` node 6738:22644.
 */
@Component({
  selector: 'sc-input-group',
  standalone: true,
  imports: [InputGroupModule],
  templateUrl: './input-group.component.html',
  styleUrl: './input-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'sc-input-group',
    '[class.sc-input-group--sm]': "size() === 'sm'",
    '[class.sc-input-group--lg]': "size() === 'lg'",
  },
})
export class InputGroupComponent {
  readonly size = input<ScInputGroupSize>('md');
  /** Fluid mode — el grupo ocupa todo el ancho disponible (default true). */
  readonly fluid = input<boolean>(true);

  protected readonly innerClass = computed(() =>
    this.fluid() ? 'sc-input-group__inner sc-input-group__inner--fluid' : 'sc-input-group__inner',
  );
}
