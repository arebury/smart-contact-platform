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
// Comparación VALOR↔VALOR (no "el regex contiene el literal X"). Antes el valor
// esperado vivía hardcodeado dentro del regex: si el Kit se re-exportaba con otra
// medida, el check seguía buscando la vieja y pasaba en verde → drift silencioso.
// Ahora: extraemos el valor que el preset declara, lo resolvemos a px (literal o
// `var(--sc-…)`) y lo comparamos numéricamente contra el export. Cubre TODO lo que
// el preset fija hoy (button root/sm/lg, formField, tabs, tooltip).
log('\n=== 4. SIZING de componente (export ↔ sc-preset.ts, valor↔valor) ===');

// Bloque `{...}` balanceado que sigue a `key` dentro de `src`.
function brace(src, key) {
  const i = src.indexOf(key);
  if (i < 0) return '';
  const open = src.indexOf('{', i);
  if (open < 0) return '';
  let depth = 0;
  for (let j = open; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}' && --depth === 0) return src.slice(open, j + 1);
  }
  return src.slice(open);
}
// Resuelve un token `--sc-*` a px siguiendo la cadena de alias en el CSS
// (`--sc-radius-200: var(--sc-radius-md)` → `--sc-radius-md: 6px` → 6).
function resolveScToken(name, seen = new Set()) {
  if (scScale.has(name)) return scScale.get(name);
  if (scRadius.has(name)) return scRadius.get(name);
  if (seen.has(name)) return NaN; // ciclo
  seen.add(name);
  const m = css.match(new RegExp(`--${name}\\s*:\\s*([^;]+);`));
  if (!m) return NaN;
  const raw = m[1].trim();
  const lit = raw.match(/^(-?[0-9.]+)px$/);
  if (lit) return parseFloat(lit[1]);
  const ref = raw.match(/var\(\s*--([a-z0-9-]+)\s*\)/);
  return ref ? resolveScToken(ref[1], seen) : NaN;
}
// `'12.25px'` | `'6px'` | `'var(--sc-radius-200)'` → número px (resolviendo el token).
function toPx(raw) {
  if (raw == null) return undefined;
  const lit = String(raw).match(/^(-?[0-9.]+)px$/);
  if (lit) return parseFloat(lit[1]);
  const ref = String(raw).match(/var\(\s*--(sc-[a-z0-9-]+)\s*\)/);
  if (ref) return resolveScToken(ref[1]);
  return NaN; // existe pero no resoluble a px (token desconocido)
}
// Valor px de `prop` dentro de `block`, o undefined si el preset no lo fija.
function propPx(block, prop) {
  const m = block.match(new RegExp(`${prop}:\\s*'([^']+)'`));
  return m ? toPx(m[1]) : undefined;
}
// Shorthand `padding: 'A B [C D]'` → array de px (o undefined si no está).
function shorthandPx(block, prop) {
  const m = block.match(new RegExp(`${prop}:\\s*'([^']+)'`));
  return m ? m[1].trim().split(/\s+/).map(toPx) : undefined;
}

// Sub-bloques del preset (acotados para no cruzar paddingX de formField↔button).
const pBtnRoot = brace(brace(preset, 'button:'), 'root:');
const smBtnI = pBtnRoot.indexOf('sm:');
const pBtnRootDirect = smBtnI >= 0 ? pBtnRoot.slice(0, smBtnI) : pBtnRoot;
const pBtnSm = brace(pBtnRoot, 'sm:');
const pBtnLg = brace(pBtnRoot, 'lg:');

const pFF = brace(preset, 'formField:'); // 1er match = semantic.formField (sizing)
const smFFI = pFF.indexOf('sm:');
const pFFDirect = smFFI >= 0 ? pFF.slice(0, smFFI) : pFF;
const pFFSm = brace(pFF, 'sm:');
const pFFLg = brace(pFF, 'lg:');

const pTabs = brace(preset, 'tabs:');
const pTab = brace(pTabs, 'tab:');
const pTabpanel = brace(pTabs, 'tabpanel:');
const pTooltip = brace(brace(preset, 'tooltip:'), 'root:');

const tabPad = shorthandPx(pTab, 'padding'); // [Y, X]
const panelPad = shorthandPx(pTabpanel, 'padding'); // [T, R, B, L]
const ttPad = shorthandPx(pTooltip, 'padding'); // [Y, X]

// [label, valor del export, valor que fija el preset]
const sizing = [
  ['button.root.paddingX', common.buttonPaddingX, propPx(pBtnRootDirect, 'paddingX')],
  ['button.root.paddingY', common.buttonPaddingY, propPx(pBtnRootDirect, 'paddingY')],
  ['button.root.borderRadius', common.buttonBorderRadius, propPx(pBtnRootDirect, 'borderRadius')],
  ['button.root.gap', common.buttonGap, propPx(pBtnRootDirect, 'gap')],
  ['button.root.iconOnlyWidth', common.buttonIconOnlyWidth, propPx(pBtnRootDirect, 'iconOnlyWidth')],
  ['button.root.sm.fontSize', common.buttonSmFontSize, propPx(pBtnSm, 'fontSize')],
  ['button.root.sm.paddingX', common.buttonSmPaddingX, propPx(pBtnSm, 'paddingX')],
  ['button.root.sm.paddingY', common.buttonSmPaddingY, propPx(pBtnSm, 'paddingY')],
  ['button.root.sm.iconOnlyWidth', common.buttonSmIconOnlyWidth, propPx(pBtnSm, 'iconOnlyWidth')],
  ['button.root.lg.fontSize', common.buttonLgFontSize, propPx(pBtnLg, 'fontSize')],
  ['button.root.lg.paddingX', common.buttonLgPaddingX, propPx(pBtnLg, 'paddingX')],
  ['button.root.lg.paddingY', common.buttonLgPaddingY, propPx(pBtnLg, 'paddingY')],
  ['button.root.lg.iconOnlyWidth', common.buttonLgIconOnlyWidth, propPx(pBtnLg, 'iconOnlyWidth')],
  ['formField.paddingX', semCommon.formFieldPaddingX, propPx(pFFDirect, 'paddingX')],
  ['formField.paddingY', semCommon.formFieldPaddingY, propPx(pFFDirect, 'paddingY')],
  ['formField.borderRadius', semCommon.formFieldBorderRadius, propPx(pFFDirect, 'borderRadius')],
  ['formField.sm.fontSize', semCommon.formFieldSmFontSize, propPx(pFFSm, 'fontSize')],
  ['formField.sm.paddingX', semCommon.formFieldSmPaddingX, propPx(pFFSm, 'paddingX')],
  ['formField.sm.paddingY', semCommon.formFieldSmPaddingY, propPx(pFFSm, 'paddingY')],
  ['formField.lg.fontSize', semCommon.formFieldLgFontSize, propPx(pFFLg, 'fontSize')],
  ['formField.lg.paddingX', semCommon.formFieldLgPaddingX, propPx(pFFLg, 'paddingX')],
  ['formField.lg.paddingY', semCommon.formFieldLgPaddingY, propPx(pFFLg, 'paddingY')],
  ['tabs.tab.gap', common.tabsTabGap, propPx(pTab, 'gap')],
  ['tabs.tab.paddingY', common.tabsTabPaddingY, tabPad?.[0]],
  ['tabs.tab.paddingX', common.tabsTabPaddingX, tabPad?.[1]],
  ['tabs.tabpanel.paddingTop', common.tabsTabpanelPaddingTop, panelPad?.[0]],
  ['tabs.tabpanel.paddingRight', common.tabsTabpanelPaddingRight, panelPad?.[1]],
  ['tabs.tabpanel.paddingBottom', common.tabsTabpanelPaddingBottom, panelPad?.[2]],
  ['tabs.tabpanel.paddingLeft', common.tabsTabpanelPaddingLeft, panelPad?.[3]],
  ['tooltip.maxWidth', common.tooltipMaxWidth, propPx(pTooltip, 'maxWidth')],
  ['tooltip.borderRadius', common.tooltipBorderRadius, propPx(pTooltip, 'borderRadius')],
  ['tooltip.paddingY', common.tooltipPaddingY, ttPad?.[0]],
  ['tooltip.paddingX', common.tooltipPaddingX, ttPad?.[1]],
];

let sizingOk = 0;
for (const [label, exp, got] of sizing) {
  if (exp == null) {
    log(`  ? ${label}: la clave no está en el export (¿renombrada en el Kit?)`);
  } else if (got === undefined) {
    fail(`${label}: el export dice ${exp} pero el preset no lo fija`);
  } else if (Number.isNaN(got)) {
    fail(`${label}: el preset lo fija pero no resuelve a px (¿token nuevo sin valor?)`);
  } else if (Math.abs(got - exp) > 1e-6) {
    fail(`${label}: DRIFT — export=${exp} vs preset=${got}`);
  } else {
    sizingOk++;
  }
}
log(`  ✓ ${sizingOk}/${sizing.length} valores de sizing fijados 1:1 con el export`);

// ── 5. Reverse: tokens en código SIN valor en el export (informativo) ─────────
// Las secciones 1-2 verifican export ⊆ código. Esto reporta la dirección opuesta:
// pasos `--sc-scale-/radius-*` que existen en código pero el Kit export no trae.
// No es gap (hay customs legítimos: radius-full, scale-0), pero hacerlos visibles
// delata candidatos a reconciliar en el próximo re-export del Kit.
log('\n=== 5. Tokens en código sin equivalente en el export (informativo) ===');
const expScaleVals = new Set(exportScale.map(([, v]) => v));
const expRadiusVals = new Set(
  Object.entries(prim)
    .filter(([k, v]) => /^borderRadius/.test(k) && typeof v === 'number')
    .map(([, v]) => v),
);
// Para cada custom, el token MÁS CERCANO de su misma familia + la distancia.
// Si la distancia es mínima (≤1px) → "candidato a redondeo": acercarlo al token
// existente cierra la creación de un token "nuevo" (regla snapping SnowUI).
const allScale = [...scScale.values()];
const allRadius = [...scRadius.values()];
const codeOnly = [];
for (const [name, val] of scScale) if (!expScaleVals.has(val)) codeOnly.push([name, val, allScale]);
for (const [name, val] of scRadius) if (!expRadiusVals.has(val)) codeOnly.push([name, val, allRadius]);
if (codeOnly.length === 0) {
  log('  ✓ ninguno — código ⊆ export');
} else {
  let snapCandidates = 0;
  for (const [name, val, family] of codeOnly) {
    // 0 (reset) y ≥1000 (full) no son pasos métricos → sin vecino útil.
    const metric = val > 0 && val < 1000;
    let near = null;
    let dist = Infinity;
    if (metric)
      for (const x of family) {
        const d = Math.abs(x - val);
        if (x !== val && d < dist) {
          dist = d;
          near = x;
        }
      }
    let hint = '';
    if (near != null) {
      const candidate = dist <= 1;
      if (candidate) snapCandidates++;
      hint = `  (más cercano: ${near}px, Δ${+dist.toFixed(2)}px${candidate ? ' ← candidato a redondeo' : ''})`;
    }
    log(`  · --${name} = ${val}px${hint}`);
  }
  log('  (custom SC / aún no en el Kit export — revisar al re-exportar)');
  if (snapCandidates)
    log(`  ⚠ ${snapCandidates} candidato(s) a redondeo: acercarlo a un token existente cierra el custom (regla snapping).`);
  else log('  → ningún custom está a ≤1px de un token existente; no hay redondeo trivial.');
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
