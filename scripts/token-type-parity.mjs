#!/usr/bin/env node
/*
 * tokens:type-parity — comprobador SOLO-LECTURA de tipografía (font-size).
 * ============================================================================
 * Hermano de `tokens:parity` (escala/radio/color), enfocado a TIPO. Cruza los
 * `font-size` del código contra los tokens `--sc-font-size-*` (resueltos a px
 * por la escala base-14: `font-size-X → scale-{m} → m×14`). Reporta:
 *   - cobertura: tokenizado `var(--sc-font-size-*)` vs literal px/rem
 *   - mapa valor→token más cercano (Δpx)
 *   - olas: 1 (snap ≤0.5px, cambio invisible) / 2 (off-scale, requiere decisión)
 *
 * NO reescribe nada (filosofía DD-10: comprobador, no generador). Es el "mapa"
 * de la Fase 1 del blindaje tipográfico + futuro detector de drift en pre-commit.
 * Line-heights NO se cubren aquí (mueven layout → fase aparte con regresión visual).
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const PRIM = 'packages/design-system/tokens/layers/01-primitive.css';
const SNAP = 0.5; // ≤ esto = ola 1 (imperceptible)

// 1. Resolver --sc-font-size-* → px (font-size-X: var(--sc-scale-{m}); px = m×14)
const prim = readFileSync(join(ROOT, PRIM), 'utf8');
const tokenPx = {};
for (const m of prim.matchAll(/--sc-font-size-(\w+):\s*var\(--sc-scale-([\d-]+)\)/g)) {
  tokenPx[`font-size-${m[1]}`] = +(parseFloat(m[2].replace('-', '.')) * 14).toFixed(3);
}
const tokens = [...new Set(Object.values(tokenPx))].sort((a, b) => a - b);
const tokenFor = (px) => Object.keys(tokenPx).find((k) => tokenPx[k] === px);

// 2. Escanear SCSS de apps + packages
function walk(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    if (e === 'node_modules' || e === 'dist' || e.startsWith('.')) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (e.endsWith('.scss')) acc.push(p);
  }
  return acc;
}
const files = [...walk(join(ROOT, 'apps')), ...walk(join(ROOT, 'packages'))];

let tokenized = 0;
const literals = {};
for (const f of files) {
  const css = readFileSync(f, 'utf8');
  tokenized += (css.match(/font-size:\s*var\(--sc-font-size-/g) || []).length;
  for (const m of css.matchAll(/font-size:\s*([0-9.]+)(px|rem)\b/g)) {
    const px = +(parseFloat(m[1]) * (m[2] === 'rem' ? 16 : 1)).toFixed(3);
    literals[px] = (literals[px] || 0) + 1;
  }
}

// 3. Clasificar literales
const totalLit = Object.values(literals).reduce((a, b) => a + b, 0);
let ola1 = 0;
let ola2 = 0;
const rows = Object.entries(literals)
  .map(([pxStr, n]) => {
    const px = +pxStr;
    const near = tokens.reduce((a, b) => (Math.abs(b - px) < Math.abs(a - px) ? b : a));
    const d = +(px - near).toFixed(2);
    const wave = Math.abs(d) <= SNAP ? 1 : 2;
    if (wave === 1) ola1 += n;
    else ola2 += n;
    return { px, n, token: tokenFor(near), d, wave };
  })
  .sort((a, b) => b.n - a.n);

// 4. Reporte
console.log('=== tokens --sc-font-size-* (px, vía escala base-14) ===');
console.log('  ' + tokens.map((t) => `${t}=${tokenFor(t)}`).join('  '));
console.log('\n=== cobertura font-size en SCSS (apps + packages) ===');
const pct = ((tokenized / (tokenized + totalLit)) * 100).toFixed(0);
console.log(`  tokenizado var(--sc-font-size-*): ${tokenized}  (${pct}%)`);
console.log(`  literal px/rem: ${totalLit}  →  ola1 (snap ≤${SNAP}px): ${ola1} · ola2 (decidir): ${ola2}`);
console.log('\n=== literales font-size → token más cercano ===');
console.log('     px    ×   → token            Δpx   ola');
console.log('  ' + '─'.repeat(46));
for (const r of rows) {
  console.log(
    `  ${String(r.px).padStart(6)} ${String(r.n).padStart(4)}  → ${(r.token || '?').padEnd(15)} ${String(r.d).padStart(5)}  ${r.wave === 1 ? '1 (invisible)' : '2 (decidir)'}`,
  );
}
console.log('\n────────────────────────────────────────────────────────────');
console.log('Solo lectura. Ola 1 = snap directo (invisible). Ola 2 = decisión humana');
console.log('(p. ej. 13px → font-size-200/14 por legibilidad, no al nearest 12.25).');
console.log('Line-heights NO cubiertos aquí (fase aparte, con regresión visual).');
