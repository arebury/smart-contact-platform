#!/usr/bin/env node
/**
 * Generador / verificador de la ESCALA primitive — Kit Pro (Figma) → `--sc-scale-*`.
 *
 * FUENTE DE VERDAD de las métricas: `tokensprime.json` (export de las Variable
 * Collections del Smart Contact Prime Kit). De ahí se DERIVA el set canónico de
 * `--sc-scale-*` aplicando la ley de la escala:
 *
 *     nombre(v) = (v < 0 ? "neg-" : "") + |v|/14   con  "." → "-"
 *
 * (14 = base del Kit. Ej.: 5.25 → 0.375 → `--sc-scale-0-375`; 175 → 12.5 →
 *  `--sc-scale-12-5`; -10.5 → `--sc-scale-neg-0-75`.) Los nombres se derivan del
 * VALOR, nunca del string de la clave del export — las claves del Kit son lossy
 * (`scale125` = 175 = ×12.5, pero `scale1125` = 15.75 = ×1.125: el punto decimal
 * no está codificado). `v/14` es inequívoco. Definición completa:
 * `packages/design-system/tokens/README.md §"The scale — formal definition"`.
 *
 * Por qué un verificador y no un re-escritor del CSS: las 7 capas son la fuente de
 * verdad de la app (README); el export es contra lo que comprobamos. Este script
 * NO toca `01-primitive.css` — DERIVA el canónico y comprueba que el código lo
 * cumple, incluida la ley de NOMBRES (que `tokens:parity` no valida: solo cruza
 * valores). Así el drift es imposible por construcción y cero riesgo sobre lo curado.
 *
 * Uso:
 *   node scripts/token-gen-scale.mjs          # check (pre-commit) — sale ≠0 si drift
 *   node scripts/token-gen-scale.mjs --emit    # imprime el bloque canónico (pegar a mano)
 *
 * Radius queda FUERA a propósito: es un set fijo de 6 valores (xs/sm/md/lg/xl)
 * + 2 customs SC, sin la ambigüedad de naming de la escala, y `tokens:parity`
 * §2 ya cruza sus valores. No hay derivación que automatizar ahí.
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

// ── Ley de la escala: valor → sufijo del token ────────────────────────────────
function suffix(v) {
  const mult = parseFloat((Math.abs(v) / 14).toFixed(3)); // 16/14 = 1.142857 → 1.143
  return (v < 0 ? 'neg-' : '') + String(mult).replace('.', '-');
}

// ── Set canónico = export ∪ extras documentados ──────────────────────────────
// Extras = pasos que el export ACTUAL no trae pero el código usa, con su razón.
// Cada uno está justificado en customs-catalog §4 + README. Si dejan de hacer
// falta (o el Kit los añade), se quitan de aquí y el check los exigirá vía export.
const EXTRA_SCALE = [
  { value: 0, reason: 'reset — no es un paso métrico' },
  { value: 17.5, reason: 'Kit scale.1-25 ausente del export actual — checkbox/dialog' },
  { value: 35, reason: 'Kit scale.2-5 ausente del export actual — hero' },
];

const canonical = new Map(); // name (sin "--") → value px
for (const [k, v] of Object.entries(prim)) {
  if (/^scale/i.test(k) && typeof v === 'number') canonical.set('sc-scale-' + suffix(v), v);
}
for (const { value } of EXTRA_SCALE) canonical.set('sc-scale-' + suffix(value), value);

// ── Set actual = lo declarado en 01-primitive.css ────────────────────────────
const css = readFileSync(PRIMITIVE_CSS, 'utf8');
const actual = new Map();
const re = /--(sc-scale-[a-z0-9-]*)\s*:\s*(-?[0-9.]+)(?:px)?\s*;/g;
let m;
while ((m = re.exec(css))) actual.set(m[1], parseFloat(m[2]));

// ── Render del bloque canónico (orden y comentarios espejo del archivo) ───────
function render() {
  const pos = [...canonical.entries()].filter(([, v]) => v > 0).sort((a, b) => a[1] - b[1]);
  const neg = [...canonical.entries()].filter(([, v]) => v < 0).sort((a, b) => b[1] - a[1]);
  const out = [];
  out.push('  --sc-scale-0: 0;');
  out.push('');
  out.push('  /* Positivos */');
  for (const [name, v] of pos) out.push(`  --${name}: ${v}px;`);
  out.push('');
  out.push('  /* Negativos (margins negativos, transform offsets) */');
  for (const [name, v] of neg) out.push(`  --${name}: ${v}px;`);
  return out.join('\n');
}

if (emit) {
  log('/* @sc-generated — node scripts/token-gen-scale.mjs --emit. Fuente: tokensprime.json. */');
  log(render());
  process.exit(0);
}

// ── --write: reescribe SOLO la zona marcada @sc-gen:scale de 01-primitive.css ──
// Es el "pipeline import": el valor llega de Figma (tokensprime.json) al token sin
// teclearlo. Toca únicamente entre los marcadores; todo lo demás (colores, marca,
// aliases, comentarios) queda intacto. Desde ahí la cascada propaga a todo.
const START = '/* @sc-gen:scale';
const END = '/* @sc-gen:scale:end */';
if (write) {
  let txt = readFileSync(PRIMITIVE_CSS, 'utf8');
  const si = txt.indexOf(START);
  const ei = txt.indexOf(END);
  if (si < 0 || ei < 0) {
    log(`✗ Faltan los marcadores ${START} … ${END} en 01-primitive.css. Añádelos alrededor`);
    log('  del bloque --sc-scale-* antes de usar --write (evita reescribir a ciegas).');
    process.exit(2);
  }
  const lineStart = txt.lastIndexOf('\n', si) + 1; // inicio de la línea del marcador START
  const indent = txt.slice(lineStart, si); // sangría (normalmente 2 espacios)
  const block =
    `${indent}/* @sc-gen:scale — bloque GENERADO desde tokensprime.json por \`npm run tokens:scale -- --write\`.\n` +
    `${indent} * NO editar a mano (el generador lo pisa). Tras editar, la cascada (--sc-spacing/font-size/\n` +
    `${indent} * line-height + componentes + preset PrimeNG) propaga sola. Ver tokens/README §"The scale". */\n` +
    `${render()}\n` +
    `${indent}${END}`;
  txt = txt.slice(0, lineStart) + block + txt.slice(ei + END.length);
  writeFileSync(PRIMITIVE_CSS, txt);
  log('✓ Bloque --sc-scale-* reescrito desde el export (zona @sc-gen:scale). La cascada propaga.');
  process.exit(0);
}

// ── Check: canónico ↔ actual (nombres + valores) ──────────────────────────────
log('=== ESCALA: export-derivado (ley v/14) ↔ 01-primitive.css ===');
let problems = 0;
const fail = (s) => {
  problems++;
  log('  ✗ ' + s);
};

for (const [name, v] of canonical) {
  if (!actual.has(name)) fail(`falta --${name} (= ${v}px) que el canónico exige`);
  else if (Math.abs(actual.get(name) - v) > 1e-6)
    fail(`--${name}: canónico=${v}px vs css=${actual.get(name)}px`);
}
for (const [name, v] of actual) {
  if (!canonical.has(name))
    fail(`--${name} (= ${v}px) en el css pero no en el canónico (¿nombre fuera de la ley v/14, o paso sin documentar?)`);
}

log(`  canónico: ${canonical.size} tokens · css: ${actual.size} · extras: ${EXTRA_SCALE.length}`);
log('─'.repeat(60));
if (problems === 0) {
  log('✓ ESCALA OK — el código cumple la ley v/14 y el set export ∪ extras.');
  process.exit(0);
}
log(`✗ ${problems} divergencia(s) de escala. Corre --emit para ver el bloque canónico.`);
process.exit(1);
