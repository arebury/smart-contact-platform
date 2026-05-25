import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { SC_ICON_SIZE_DEFAULT } from '@shared/utils/icon-size';

/**
 * `<sc-icon>` — icono Material Symbols (Outlined) renderizado por ligadura.
 *
 * `name` es el nombre del símbolo Material (p.ej. `"settings"`, `"delete"`,
 * `"call"`). El font se carga en `index.html`. `size` mapea a font-size en px
 * (default `--sc-icon-size` = 14) y también al eje `opsz` para que el trazo
 * escale como diseñó Google. `fill` / `weight` exponen los ejes FILL y wght.
 *
 * Sustituye progresivamente a `<lucide-icon>` (migración S60+, ver
 * NEXT-SESSION-PLAN §iconos). **Iconos de marca** (GitHub, etc.) NO existen en
 * Material Symbols → ésos se quedan en Lucide, no se migran a `<sc-icon>`.
 */
@Component({
  selector: 'sc-icon',
  template: `{{ name() }}`,
  styleUrl: './icon.component.scss',
  host: {
    class: 'sc-icon material-symbols-outlined',
    'aria-hidden': 'true',
    '[style.font-size.px]': 'size()',
    '[style.font-variation-settings]': 'variation()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  /** Nombre del símbolo Material (snake_case, p.ej. `space_dashboard`). */
  readonly name = input.required<string>();
  /** Tamaño en px. Default `--sc-icon-size` (14). También alimenta `opsz`. */
  readonly size = input<number>(SC_ICON_SIZE_DEFAULT);
  /** Relleno del glifo (eje FILL 0→1). */
  readonly fill = input<boolean>(false);
  /** Grosor del trazo (eje wght 100→700). */
  readonly weight = input<number>(400);

  protected readonly variation = computed(
    () => `'FILL' ${this.fill() ? 1 : 0}, 'wght' ${this.weight()}, 'GRAD' 0, 'opsz' ${this.size()}`,
  );
}
