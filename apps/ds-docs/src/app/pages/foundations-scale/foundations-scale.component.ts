import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { IconComponent } from '@sc/design-system';
import { ScSelectComponent as SelectComponent } from '@smartcontact-hub/components';

/** Una fila de la escala: un step y todo lo que deriva de él. */
interface ScaleRow {
  scale: string; // --sc-scale-2
  px: number; // 28
  mult: string; // "2 × 14"
  spacing: string | null; // --sc-spacing-2
  fontSizes: string[]; // --sc-font-size-600 …
  lineHeights: string[]; // --sc-line-height-400 …
}

type Dtcg = {
  $value: string | number;
  $type?: string;
  $extensions?: { sc?: { alias?: string; custom?: boolean } };
};
type Group = Record<string, Dtcg>;

const toPx = (v: string | number): number =>
  typeof v === 'number' ? v : parseFloat(String(v).replace('px', '')) || 0;

/** Extrae el nombre del token de un alias DTCG: "…(--sc-scale-2)" → "--sc-scale-2". */
const aliasName = (t: Dtcg): string | null => {
  const a = t.$extensions?.sc?.alias;
  const m = a?.match(/\((--sc-[a-z0-9-]+)\)/i);
  return m ? m[1] : null;
};

const short = (token: string): string => token.replace('--sc-', '');

/**
 * Foundations → Escala & Espaciado.
 *
 * Objetivo: que cualquiera (producto/diseño) se entere de la escala rápido.
 * Patrón: un combobox (nuestro `sc-select` con filtro) para elegir/escribir un
 * valor → tarjeta de detalle. Lista completa colapsada (progressive disclosure).
 *
 * Solo px ↔ token (base-14). NO rem (otra base; ni lo usamos) para no confundir.
 * Datos de `sc-tokens.json` (lo regenera `tokens:export` en cada build).
 */
@Component({
  selector: 'sc-ds-docs-foundations-scale',
  standalone: true,
  imports: [RouterLink, IconComponent, SelectComponent, FormsModule],
  templateUrl: './foundations-scale.component.html',
  styleUrl: './foundations-scale.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoundationsScaleComponent {
  protected readonly arrowLeftIcon = 'arrow_back';
  protected readonly rulerIcon = 'straighten';
  protected readonly short = short;

  private readonly tokens = signal<Record<string, Group> | null>(null);
  protected readonly loaded = computed(() => this.tokens() !== null);

  /** Escala completa: una fila por step, con todo lo que deriva. */
  protected readonly scaleRows = computed<ScaleRow[]>(() => {
    const j = this.tokens();
    if (!j) return [];
    const scale = j['scale'] ?? {};
    const rev = (g: Group, prefix: string): Map<string, string[]> => {
      const m = new Map<string, string[]>();
      for (const [k, t] of Object.entries(g ?? {})) {
        const a = aliasName(t);
        if (!a) continue;
        (m.get(a) ?? m.set(a, []).get(a)!).push(`--${prefix}-${k}`);
      }
      return m;
    };
    const spacingRev = rev(j['spacing'] ?? {}, 'sc-spacing');
    const fsRev = rev(j['font-size'] ?? {}, 'sc-font-size');
    const lhRev = rev(j['line-height'] ?? {}, 'sc-line-height');

    return Object.entries(scale)
      .map(([k, t]) => {
        const name = `--sc-scale-${k}`;
        const px = toPx(t.$value);
        return {
          scale: name,
          px,
          mult: `${+(px / 14).toFixed(4)} × 14`,
          spacing: spacingRev.get(name)?.[0] ?? null,
          fontSizes: fsRev.get(name) ?? [],
          lineHeights: lhRev.get(name) ?? [],
        };
      })
      .sort((a, b) => a.px - b.px); // incluye negativos (offsets) — Rafa los lee en scale
  });

  /** Opciones del combobox: "28px · spacing-2". value = nombre de scale. */
  protected readonly options = computed(() =>
    this.scaleRows().map((r) => ({
      label: `${short(r.scale)} · ${r.px}px`, // lidera el nombre scale (lo que se lee), luego px
      value: r.scale,
    })),
  );

  /** Selección del combobox (nombre de scale) + su fila. */
  protected readonly selected = signal<string>('--sc-scale-2');
  protected readonly selectedRow = computed<ScaleRow | undefined>(() =>
    this.scaleRows().find((r) => r.scale === this.selected()),
  );

  protected onSelect(v: unknown): void {
    if (typeof v === 'string') this.selected.set(v);
  }

  constructor() {
    void fetch('/sc-tokens.json')
      .then((r) => r.json())
      .then((j) => this.tokens.set(j))
      .catch(() => this.tokens.set({}));
  }
}
