import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconComponent } from '@sc/design-system';

/** Una fila de la tabla de escala: un step y todo lo que deriva de él. */
interface ScaleRow {
  scale: string; // --sc-scale-2
  px: number; // 28
  mult: string; // "2 × 14"
  spacing: string | null; // --sc-spacing-2
  fontSizes: string[]; // --sc-font-size-600 …
  lineHeights: string[]; // --sc-line-height-400 …
}

interface RadiusRow {
  radius: string; // --sc-radius-md
  px: number;
  aliases: string[]; // --sc-radius-200 …
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
  const m = a?.match(/var\((--sc-[a-z0-9-]+)\)/i);
  return m ? m[1] : null;
};

/**
 * Foundations → Escala & Espaciado.
 *
 * Página para el equipo de diseño: explica POR QUÉ la escala es base-14 (paridad
 * 1:1 con las Variables del Kit Pro en Figma) y muestra la tabla de conversión
 * scale ↔ spacing ↔ font-size ↔ line-height ↔ radius ↔ px.
 *
 * La tabla se genera leyendo `sc-tokens.json` (export DTCG que `npm run tokens:export`
 * regenera en cada build) → NUNCA se desincroniza, sin script ni tabla a mano.
 */
@Component({
  selector: 'sc-ds-docs-foundations-scale',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './foundations-scale.component.html',
  styleUrl: './foundations-scale.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoundationsScaleComponent {
  protected readonly arrowLeftIcon = 'arrow_back';
  protected readonly rulerIcon = 'straighten';

  private readonly tokens = signal<Record<string, Group> | null>(null);
  protected readonly loaded = computed(() => this.tokens() !== null);

  /** Tabla principal: una fila por step de escala, con todo lo que deriva. */
  protected readonly scaleRows = computed<ScaleRow[]>(() => {
    const j = this.tokens();
    if (!j) return [];
    const scale = j['scale'] ?? {};
    const spacing = j['spacing'] ?? {};
    const fontSize = j['font-size'] ?? {};
    const lineHeight = j['line-height'] ?? {};

    // índice inverso: nombre de scale → tokens (del grupo `prefix`) que lo aliasan
    const rev = (g: Group, prefix: string): Map<string, string[]> => {
      const m = new Map<string, string[]>();
      for (const [k, t] of Object.entries(g)) {
        const a = aliasName(t);
        if (!a) continue;
        const arr = m.get(a) ?? m.set(a, []).get(a)!;
        arr.push(`--${prefix}-${k}`);
      }
      return m;
    };
    const spacingRev = rev(spacing, 'sc-spacing');
    const fsRev = rev(fontSize, 'sc-font-size');
    const lhRev = rev(lineHeight, 'sc-line-height');

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
      .filter((r) => r.px >= 0)
      .sort((a, b) => a.px - b.px);
  });

  // ─── Calculadora px → token (reusa scaleRows, sin datos nuevos) ───────────
  protected readonly calcInput = signal('');
  protected readonly calcResult = computed(() => {
    const raw = parseFloat(
      this.calcInput()
        .replace(/px|rem/gi, '')
        .trim(),
    );
    if (!isFinite(raw)) return null;
    const rows = this.scaleRows();
    if (rows.length === 0) return null;
    const exact = rows.find((r) => Math.abs(r.px - raw) < 0.001);
    if (exact) {
      return { exact: true, query: raw, ...exact };
    }
    // Sin token exacto → step más cercano (enseña el snapping a token existente).
    const near = rows.reduce((a, b) => (Math.abs(b.px - raw) < Math.abs(a.px - raw) ? b : a));
    return { exact: false, query: raw, ...near };
  });

  /** Tabla aparte: radios (escala dedicada del Kit Pro). */
  protected readonly radiusRows = computed<RadiusRow[]>(() => {
    const j = this.tokens();
    if (!j) return [];
    const radius = j['radius'] ?? {};
    // Los radios "nombrados" (none/xs/sm/md/lg/xl) son el canon; los numéricos
    // (50/100/…) son alias legacy que apuntan a ellos.
    const named: RadiusRow[] = [];
    const aliasesOf = new Map<string, string[]>();
    for (const [k, t] of Object.entries(radius)) {
      const a = aliasName(t);
      if (a) (aliasesOf.get(a) ?? aliasesOf.set(a, []).get(a)!).push(`--sc-radius-${k}`);
    }
    for (const [k, t] of Object.entries(radius)) {
      if (/^(none|xs|sm|md|lg|xl|2xl|full)$/.test(k)) {
        named.push({
          radius: `--sc-radius-${k}`,
          px: toPx(t.$value),
          aliases: aliasesOf.get(`--sc-radius-${k}`) ?? [],
        });
      }
    }
    return named.sort((a, b) => a.px - b.px);
  });

  constructor() {
    void fetch('/sc-tokens.json')
      .then((r) => r.json())
      .then((j) => this.tokens.set(j))
      .catch(() => this.tokens.set({}));
  }

  protected leaf(token: string): string {
    return token.replace(/^--sc-(scale|spacing|font-size|line-height|radius)-/, '');
  }
}
