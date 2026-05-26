#!/usr/bin/env node
/**
 * Auditoría de paridad de tokens — Kit Pro (Figma) ↔ código (--sc-*).
 *
 * FUENTE DE VERDAD: `packages/design-system/tokens/tokensprime.json` — el export
 * de las Variable Collections del Smart Contact Prime Kit (duplicado limpio de
 * PrimeNG). Tiene las MÉTRICAS EXACTAS de cada token (scale, radios, y el sizing
 * de cada componente: paddings, font-size, anchos…).
 *
 * Qué hace (determinista, sin "a ojo"):
 *   1. SCALE / RADIUS: cruza cada valor del export con nuestros `--sc-scale-*` /
 *      `--sc-radius-*` (01-primitive.css). Reporta match / mismatch / falta.
 *   2. MAPA valor → token: imprime la tabla de equivalencias (p.ej. 5.25 →
 *      `--sc-scale-0-375`) para que al inspeccionar un elemento del Figma el
 *      mapeo sea EXACTO y en nuestro vocabulario.
 *   3. SIZING DE COMPONENTE (button sm/lg, formField sm/lg, iconOnly…): verifica
 *      que `sc-preset.ts` los fija y que coinciden con el export.
 *
 * Uso:  node scripts/token-parity.mjs
 * Sale con código ≠ 0 si hay gaps → sirve como check (pre-commit / CI / antes de
 * cantar cualquier "1:1").
 *
 * Por qué existe (S62): hoy afirmé 3 cosas sin contrastar (button.sm "no soporta",
 * faltan negativos, "no se puede 1:1") y las 3 eran falsas. Este script sustituye
 * "mi memoria/greps a ojo" por un diff contra la fuente.
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const EXPORT_PATH = resolve(root, 'packages/design-system/tokens/tokensprime.json');
const PRIMITIVE_CSS = resolve(root, 'packages/design-system/tokens/layers/01-primitive.css');
const PRESET_TS = resolve(root, 'packages/design-system/tokens/sc-preset.ts');

let problems = 0;
const log = (s = '') => process.stdout.write(s + '\n');
const fail = (s) => {
  problems++;
  log('  ✗ ' + s);
};

// ── Cargar el export (acepta JSON-objeto o JSON-string-de-JSON) ──────────────
if (!existsSync(EXPORT_PATH)) {
  log(`⚠️  No existe ${EXPORT_PATH}`);
  log('   Guarda ahí el export del Kit Pro (tokensprime.json) y reejecuta.');
  process.exit(2);
}
let kit = JSON.parse(readFileSync(EXPORT_PATH, 'utf8'));
if (typeof kit === 'string') kit = JSON.parse(kit); // venía como string escapado

const prim = kit.primitive?.mode1 ?? {};
const common = kit.componentCommon?.mode1 ?? {};
const semCommon = kit.semanticCommon?.mode1 ?? {};

// ── Cargar nuestros tokens (px) desde 01-primitive.css ───────────────────────
const css = readFileSync(PRIMITIVE_CSS, 'utf8');
/** name → number en px, p.ej. "sc-scale-2" → 28. `px` opcional para captar
 *  unitless como `--sc-radius-none: 0;` (si exigimos `px`, ese token EXISTE
 *  pero el regex lo salta → falso "gap": justo el error que este script evita). */
function readScCssNumbers(prefix) {
  const map = new Map();
  const re = new RegExp(`--(${prefix}[a-z0-9-]*)\\s*:\\s*(-?[0-9.]+)(?:px)?\\s*;`, 'g');
  let m;
  while ((m = re.exec(css))) map.set(m[1], parseFloat(m[2]));
  return map;
}
const scScale = readScCssNumbers('sc-scale-');
const scRadius = readScCssNumbers('sc-radius-');

// value → [token,...] (índice inverso para el mapeo de vocabulario)
const valueToScTokens = new Map();
for (const [name, val] of [...scScale, ...scRadius]) {
  if (!valueToScTokens.has(val)) valueToScTokens.set(val, []);
  valueToScTokens.get(val).push(name);
}

const preset = readFileSync(PRESET_TS, 'utf8');

// ── 1. SCALE parity ──────────────────────────────────────────────────────────
log('\n=== 1. SCALE (export.primitive ↔ --sc-scale-*) ===');
const exportScale = Object.entries(prim).filter(([k]) => /^scale/i.test(k));
const codeScaleValues = new Set(scScale.values());
for (const [k, v] of exportScale) {
  if (codeScaleValues.has(v)) continue;
  fail(`export ${k}=${v} no tiene ningún --sc-scale-* con ese valor`);
}
log(`  export: ${exportScale.length} valores · código: ${scScale.size} tokens · gaps: ${problems}`);

// ── 2. RADIUS parity ─────────────────────────────────────────────────────────
log('\n=== 2. RADIUS (export.primitive.borderRadius* ↔ --sc-radius-*) ===');
const codeRadiusValues = new Set(scRadius.values());
let radiusGaps = 0;
for (const [k, v] of Object.entries(prim).filter(([k]) => /^borderRadius/.test(k))) {
  if (typeof v === 'number' && !codeRadiusValues.has(v)) {
    fail(`export ${k}=${v} sin --sc-radius-* equivalente`);
    radiusGaps++;
  }
}
if (!radiusGaps) log('  ✓ todos los radios del export tienen --sc-radius-*');

// ── 3. MAPA valor → token (referencia de vocabulario para inspección 1:1) ─────
log('\n=== 3. MAPA valor(px) → token SC (usar al inspeccionar Figma) ===');
const wanted = [...new Set(exportScale.map(([, v]) => v))].sort((a, b) => a - b);
for (const v of wanted) {
  const toks = (valueToScTokens.get(v) || []).map((t) => `--${t}`).join(' / ') || '∅ (sin token)';
  log(`  ${String(v).padStart(7)}px  →  ${toks}`);
}

// ── 4. SIZING de componente: ¿el preset fija lo que dice el export? ───────────
log('\n=== 4. SIZING de componente (export ↔ sc-preset.ts) ===');
// pares [valor esperado del export, regex que debe aparecer en el preset, etiqueta]
const checks = [
  [common.buttonSmFontSize, /sm:\s*{[^}]*fontSize:\s*'12\.25px'/s, 'button.root.sm.fontSize=12.25'],
  [common.buttonSmPaddingY, /sm:\s*{[^}]*paddingY:\s*'5\.25px'/s, 'button.root.sm.paddingY=5.25'],
  [common.buttonLgFontSize, /lg:\s*{[^}]*fontSize:\s*'15\.75px'/s, 'button.root.lg.fontSize=15.75'],
  [common.buttonIconOnlyWidth, /iconOnlyWidth:\s*'35px'/, 'button.root.iconOnlyWidth=35'],
  [semCommon.formFieldSmPaddingY, /paddingY:\s*'5\.25px'/, 'formField.sm.paddingY=5.25'],
  [semCommon.formFieldSmFontSize, /fontSize:\s*'12\.25px'/, 'formField.sm.fontSize=12.25'],
];
for (const [exp, re, label] of checks) {
  if (exp == null) {
    log(`  ? ${label}: no encontrado en el export (revisar clave)`);
  } else if (re.test(preset)) {
    log(`  ✓ ${label} (export=${exp})`);
  } else {
    fail(`${label}: el export dice ${exp} pero el preset no lo fija`);
  }
}

// ── Resumen ──────────────────────────────────────────────────────────────────
log('\n' + '─'.repeat(60));
if (problems === 0) {
  log('✓ PARIDAD OK — sin gaps detectados.');
  process.exit(0);
} else {
  log(`✗ ${problems} gap(s) de paridad. Revisar arriba.`);
  process.exit(1);
}
