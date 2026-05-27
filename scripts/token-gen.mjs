#!/usr/bin/env node
/**
 * Generador / verificador de los PRIMITIVOS métricos — Kit Pro (Figma) → código.
 * Cubre la ESCALA (`--sc-scale-*`) y los RADIOS (`--sc-radius-*`), ambos en
 * `01-primitive.css`. Es el "puente Figma→código": el valor llega del export
 * (`tokensprime.json`) al token sin teclearlo, y desde ahí la cascada (spacing /
 * font-size / line-height + componentes + `sc-preset.ts`, que REFERENCIA estos
 * tokens en vez de px a pelo) propaga a todo. Por eso no hace falta un generador
 * de "métricas de componente" aparte: el preset apunta a estos primitivos.
 *
 * FUENTE DE VERDAD de las métricas: `tokensprime.json` (export de las Variable
 * Collections del Smart Contact Prime Kit).
 *
 * ── ESCALA ──  Ley: nombre(v) = (v<0?"neg-":"") + |v|/14   con  "." → "-"
 *   (14 = base del Kit. 5.25 → 0.375 → `--sc-scale-0-375`; 175 → 12.5 →
 *   `--sc-scale-12-5`.) El nombre se deriva del VALOR, nunca del string de la
 *   clave del export (las claves del Kit son lossy: `scale125`=175=×12.5 pero
 *   `scale1125`=15.75=×1.125 — el punto decimal no se codifica). `v/14` es
 *   inequívoco. Def. completa: README §"The scale — formal definition".
 *
 * ── RADIOS ──  Escala dedicada del Kit (`primitive.borderRadius*`), independiente
 *   de la escala métrica: none/xs/sm/md/lg/xl = 0/2/4/6/8/12. Nombre = sufijo de
 *   la clave en minúscula (`borderRadiusMd` → `--sc-radius-md`). `2xl`(16) y
 *   `full`(9999) son customs SC sin equivalente en el Kit (extras documentados).
 *
 * Por qué un verificador-que-además-reescribe-zonas-marcadas y no un re-escritor
 * libre del CSS: las 7 capas son la fuente de verdad de la app (README); el export
 * es contra lo que comprobamos. Este script SOLO toca entre los marcadores
 * `@sc-gen:scale … :end` y `@sc-gen:radius … :end`; todo lo demás (colores, marca,
 * aliases, comentarios) queda intacto. Drift imposible por construcción, cero
 * riesgo sobre lo curado.
 *
 * Uso:
 *   node scripts/token-gen.mjs            # check (pre-commit) — sale ≠0 si drift
 *   node scripts/token-gen.mjs --emit     # imprime los bloques canónicos
 *   node scripts/token-gen.mjs --write    # reescribe las zonas @sc-gen de 01-primitive.css
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const EXPORT_PATH = resolve(root, 'packages/design-system/tokens/tokensprime.json');
const PRIMITIVE_CSS = resolve(root, 'packages/design-system/tokens/layers/01-primitive.css');

const emit = process.argv.includes('--emit');
const write = process.argv.includes('--write');
const log = (s = '') => process.stdout.write(s + '\n');

if (!existsSync(EXPORT_PATH)) {
  log(`⚠️  No existe ${EXPORT_PATH}`);
  process.exit(2);
}
let kit = JSON.parse(readFileSync(EXPORT_PATH, 'utf8'));
if (typeof kit === 'string') kit = JSON.parse(kit);
const prim = kit.primitive?.mode1 ?? {};

// ─────────────────────────────────────────────────────────────────────────────
// ESCALA
// ─────────────────────────────────────────────────────────────────────────────
function scaleSuffix(v) {
  const mult = parseFloat((Math.abs(v) / 14).toFixed(3)); // 16/14 = 1.142857 → 1.143
  return (v < 0 ? 'neg-' : '') + String(mult).replace('.', '-');
}
// Extras = pasos que el export ACTUAL no trae pero el código usa, con su razón.
// Justificados en customs-catalog §4 + README. Si dejan de hacer falta (o el Kit
// los añade), se quitan de aquí y el check los exigirá vía export.
const EXTRA_SCALE = [
  { value: 0, reason: 'reset — no es un paso métrico' },
  { value: 17.5, reason: 'Kit scale.1-25 ausente del export actual — checkbox/dialog' },
  { value: 35, reason: 'Kit scale.2-5 ausente del export actual — hero' },
];
const scaleCanon = new Map(); // name (sin "--") → value px
for (const [k, v] of Object.entries(prim))
  if (/^scale/i.test(k) && typeof v === 'number') scaleCanon.set('sc-scale-' + scaleSuffix(v), v);
for (const { value } of EXTRA_SCALE) scaleCanon.set('sc-scale-' + scaleSuffix(value), value);

function renderScale() {
  const pos = [...scaleCanon.entries()].filter(([, v]) => v > 0).sort((a, b) => a[1] - b[1]);
  const neg = [...scaleCanon.entries()].filter(([, v]) => v < 0).sort((a, b) => b[1] - a[1]);
  const out = ['  --sc-scale-0: 0;', '', '  /* Positivos */'];
  for (const [name, v] of pos) out.push(`  --${name}: ${v}px;`);
  out.push('', '  /* Negativos (margins negativos, transform offsets) */');
  for (const [name, v] of neg) out.push(`  --${name}: ${v}px;`);
  return out.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// RADIOS
// ─────────────────────────────────────────────────────────────────────────────
// Customs SC sin equivalente en el export del Kit (orden = tras los del export).
const EXTRA_RADIUS = [
  { name: '2xl', value: 16, reason: 'paso 16px custom SC (dialog/overlay grande)' },
  { name: 'full', value: 9999, reason: 'pill/círculo — custom SC' },
];
const radiusCanon = new Map(); // name → value px (number)
for (const [k, v] of Object.entries(prim)) {
  const m = k.match(/^borderRadius([A-Za-z0-9]+)$/);
  if (m && typeof v === 'number') radiusCanon.set('sc-radius-' + m[1].toLowerCase(), v);
}
for (const { name, value } of EXTRA_RADIUS) radiusCanon.set('sc-radius-' + name, value);

const fmtRadius = (v) => (v === 0 ? '0' : `${v}px`); // none → "0" sin unidad
function renderRadius() {
  const fromExport = [...radiusCanon.keys()].filter(
    (n) => !EXTRA_RADIUS.some((e) => 'sc-radius-' + e.name === n),
  );
  // Orden canónico del export: por valor ascendente (none, xs, sm, md, lg, xl).
  fromExport.sort((a, b) => radiusCanon.get(a) - radiusCanon.get(b));
  const out = [];
  for (const n of fromExport) out.push(`  --${n}: ${fmtRadius(radiusCanon.get(n))};`);
  out.push('', '  /* Custom SC (no en Kit Pro Variables) */');
  for (const { name, value } of EXTRA_RADIUS) out.push(`  --sc-radius-${name}: ${fmtRadius(value)};`);
  return out.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// EMIT
// ─────────────────────────────────────────────────────────────────────────────
if (emit) {
  log('/* @sc-generated — node scripts/token-gen.mjs --emit. Fuente: tokensprime.json. */');
  log('\n/* ===== SCALE ===== */');
  log(renderScale());
  log('\n/* ===== RADIUS ===== */');
  log(renderRadius());
  process.exit(0);
}

// ─────────────────────────────────────────────────────────────────────────────
// WRITE — reescribe SOLO las zonas marcadas @sc-gen:scale y @sc-gen:radius.
// ─────────────────────────────────────────────────────────────────────────────
function rewriteRegion(txt, startTag, endTag, header, body) {
  const si = txt.indexOf(startTag);
  const ei = txt.indexOf(endTag);
  if (si < 0 || ei < 0) return null;
  const lineStart = txt.lastIndexOf('\n', si) + 1;
  const indent = txt.slice(lineStart, si);
  const block = `${indent}${header}\n${body}\n${indent}${endTag}`;
  return txt.slice(0, lineStart) + block + txt.slice(ei + endTag.length);
}

if (write) {
  let txt = readFileSync(PRIMITIVE_CSS, 'utf8');
  const scaleHeader =
    '/* @sc-gen:scale — bloque GENERADO desde tokensprime.json por `npm run tokens:import`.\n' +
    '   * NO editar a mano (el generador lo pisa). Tras editar, la cascada (--sc-spacing/font-size/\n' +
    '   * line-height + componentes + preset PrimeNG) propaga sola. Ver tokens/README §"The scale". */';
  const radiusHeader =
    '/* @sc-gen:radius — bloque GENERADO desde tokensprime.json (primitive.borderRadius*)\n' +
    '   * por `npm run tokens:import`. NO editar a mano (el generador lo pisa).\n' +
    '   * none/xs/sm/md/lg/xl = export 1:1; 2xl/full = customs SC documentados. */';

  const afterScale = rewriteRegion(
    txt,
    '/* @sc-gen:scale',
    '/* @sc-gen:scale:end */',
    scaleHeader,
    renderScale(),
  );
  if (afterScale == null) {
    log('✗ Faltan los marcadores @sc-gen:scale … :end en 01-primitive.css.');
    process.exit(2);
  }
  txt = afterScale;
  const afterRadius = rewriteRegion(
    txt,
    '/* @sc-gen:radius',
    '/* @sc-gen:radius:end */',
    radiusHeader,
    renderRadius(),
  );
  if (afterRadius == null) {
    log('✗ Faltan los marcadores @sc-gen:radius … :end en 01-primitive.css.');
    process.exit(2);
  }
  txt = afterRadius;
  writeFileSync(PRIMITIVE_CSS, txt);
  log('✓ Bloques --sc-scale-* y --sc-radius-* reescritos desde el export. La cascada propaga.');
  process.exit(0);
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK — canónico (export-derivado) ↔ lo declarado en 01-primitive.css
// ─────────────────────────────────────────────────────────────────────────────
const css = readFileSync(PRIMITIVE_CSS, 'utf8');
let problems = 0;
const fail = (s) => {
  problems++;
  log('  ✗ ' + s);
};
// name → number en px (capta unitless como `--sc-radius-none: 0;`).
function readActual(prefix) {
  const map = new Map();
  const re = new RegExp(`--(${prefix}[a-z0-9-]*)\\s*:\\s*(-?[0-9.]+)(?:px)?\\s*;`, 'g');
  let m;
  while ((m = re.exec(css))) map.set(m[1], parseFloat(m[2]));
  return map;
}
function checkBlock(label, canon, actual) {
  for (const [name, v] of canon) {
    if (!actual.has(name)) fail(`${label}: falta --${name} (= ${v}) que el canónico exige`);
    else if (Math.abs(actual.get(name) - v) > 1e-6)
      fail(`${label}: --${name}: canónico=${v} vs css=${actual.get(name)}`);
  }
  for (const [name, v] of actual)
    if (!canon.has(name))
      fail(`${label}: --${name} (= ${v}) en css pero no en el canónico (¿fuera de la ley / sin documentar?)`);
}

log('=== PRIMITIVOS: export-derivado ↔ 01-primitive.css ===');
const actualScale = readActual('sc-scale-');
// Radios: solo los del bloque generado (no los aliases legacy radius-0/50/.../500,
// que son var()-refs y no matchean el regex numérico → no contaminan).
const actualRadius = readActual('sc-radius-');
checkBlock('SCALE', scaleCanon, actualScale);
checkBlock('RADIUS', radiusCanon, actualRadius);

log(
  `  scale: canónico ${scaleCanon.size} · css ${actualScale.size} (extras ${EXTRA_SCALE.length})` +
    ` | radius: canónico ${radiusCanon.size} · css ${actualRadius.size} (extras ${EXTRA_RADIUS.length})`,
);
log('─'.repeat(60));
if (problems === 0) {
  log('✓ PRIMITIVOS OK — el código cumple la ley v/14 (escala) y el set export ∪ extras (escala+radios).');
  process.exit(0);
}
log(`✗ ${problems} divergencia(s). Corre --emit para ver los bloques canónicos.`);
process.exit(1);
