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
  const lit = raw.match(/^(-?[0-9.]+)(px|rem)$/);
  // rem→px a root 16 (tipografía DD-13: --sc-font-size-16: 1rem = 16px).
  if (lit) return parseFloat(lit[1]) * (lit[2] === 'rem' ? 16 : 1);
  const ref = raw.match(/var\(\s*--([a-z0-9-]+)\s*\)/);
  return ref ? resolveScToken(ref[1], seen) : NaN;
}
// `'12.25px'` | `'6px'` | `'var(--sc-radius-200)'` → número px (resolviendo el token).
function toPx(raw) {
  if (raw == null) return undefined;
  if (String(raw).trim() === '0') return 0; // CSS unitless zero (margin/padding shorthands)
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
// semantic.overlay (1er match; colorScheme.*.overlay no tiene borderRadius).
const pOverlay = brace(preset, 'overlay:');
const pOvModal = brace(pOverlay, 'modal:');
const pOvPopover = brace(pOverlay, 'popover:');
const pOvSelect = brace(pOverlay, 'select:');

const tabPad = shorthandPx(pTab, 'padding'); // [Y, X]
const panelPad = shorthandPx(pTabpanel, 'padding'); // [T, R, B, L]
const ttPad = shorthandPx(pTooltip, 'padding'); // [Y, X]

// Divider (componentes.divider): margin/padding H+V. Acotamos `content:` para no
// cruzar la padding directa con la del contenido.
const pDivider = brace(preset, 'divider:');
const pDivH = brace(pDivider, 'horizontal:');
const pDivV = brace(pDivider, 'vertical:');
const hcI = pDivH.indexOf('content:');
const pDivHDirect = hcI >= 0 ? pDivH.slice(0, hcI) : pDivH;
const vcI = pDivV.indexOf('content:');
const pDivVDirect = vcI >= 0 ? pDivV.slice(0, vcI) : pDivV;
const divHMargin = shorthandPx(pDivHDirect, 'margin'); // [Y, X]
const divVMargin = shorthandPx(pDivVDirect, 'margin'); // [Y, X]
const divHContentPad = shorthandPx(brace(pDivH, 'content:'), 'padding'); // [Y, X]
const divVContentPad = shorthandPx(brace(pDivV, 'content:'), 'padding'); // [Y, X]

// [label, valor del export, valor que fija el preset]
const sizing = [
  ['button.root.paddingX', common.buttonPaddingX, propPx(pBtnRootDirect, 'paddingX')],
  ['button.root.paddingY', common.buttonPaddingY, propPx(pBtnRootDirect, 'paddingY')],
  ['button.root.borderRadius', common.buttonBorderRadius, propPx(pBtnRootDirect, 'borderRadius')],
  ['button.root.gap', common.buttonGap, propPx(pBtnRootDirect, 'gap')],
  ['button.root.iconOnlyWidth', common.buttonIconOnlyWidth, propPx(pBtnRootDirect, 'iconOnlyWidth')],
  // fontSize sm/lg: divergencia consciente DD-13 — el tier de control es la escala
  // REDONDA (sm 12 / lg 16, = capa App del Kit `app/sm|lg/font/size`), no los decimales
  // base-14 del snapshot tokensprime.json (12.25/15.75, pre-DD-13). Expected = 12/16
  // hasta el próximo re-export del Kit base.
  ['button.root.sm.fontSize', 12, propPx(pBtnSm, 'fontSize')],
  ['button.root.sm.paddingX', common.buttonSmPaddingX, propPx(pBtnSm, 'paddingX')],
  ['button.root.sm.paddingY', common.buttonSmPaddingY, propPx(pBtnSm, 'paddingY')],
  ['button.root.sm.iconOnlyWidth', common.buttonSmIconOnlyWidth, propPx(pBtnSm, 'iconOnlyWidth')],
  ['button.root.lg.fontSize', 16, propPx(pBtnLg, 'fontSize')], // DD-13 (ver nota sm)
  ['button.root.lg.paddingX', common.buttonLgPaddingX, propPx(pBtnLg, 'paddingX')],
  ['button.root.lg.paddingY', common.buttonLgPaddingY, propPx(pBtnLg, 'paddingY')],
  ['button.root.lg.iconOnlyWidth', common.buttonLgIconOnlyWidth, propPx(pBtnLg, 'iconOnlyWidth')],
  ['formField.paddingX', semCommon.formFieldPaddingX, propPx(pFFDirect, 'paddingX')],
  ['formField.paddingY', semCommon.formFieldPaddingY, propPx(pFFDirect, 'paddingY')],
  ['formField.borderRadius', semCommon.formFieldBorderRadius, propPx(pFFDirect, 'borderRadius')],
  ['formField.sm.fontSize', 12, propPx(pFFSm, 'fontSize')], // DD-13 (ver nota sm botón)
  ['formField.sm.paddingX', semCommon.formFieldSmPaddingX, propPx(pFFSm, 'paddingX')],
  ['formField.sm.paddingY', semCommon.formFieldSmPaddingY, propPx(pFFSm, 'paddingY')],
  ['formField.lg.fontSize', 16, propPx(pFFLg, 'fontSize')], // DD-13 (ver nota sm botón)
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
  // Overlays: solo el borderRadius que el preset fija (resuelve var(--sc-radius-*)).
  // El shadow no se cruza (recipe). focusRing fuera: divergencia consciente 2px (a11y).
  ['overlay.modal.borderRadius', semCommon.overlayModalBorderRadius, propPx(pOvModal, 'borderRadius')],
  ['overlay.popover.borderRadius', semCommon.overlayPopoverBorderRadius, propPx(pOvPopover, 'borderRadius')],
  ['overlay.select.borderRadius', semCommon.overlaySelectBorderRadius, propPx(pOvSelect, 'borderRadius')],
  // Divider (sc-divider ↔ ❖ divider 302:11810). H/V margin + content padding,
  // 1:1 con el export (14/7, escala 14-base). El color va por semantic (§6).
  ['divider.horizontal.marginY', common.dividerHorizontalMarginY, divHMargin?.[0]],
  ['divider.horizontal.marginX', common.dividerHorizontalMarginX, divHMargin?.[1]],
  ['divider.horizontal.padding', common.dividerHorizontalPadding, propPx(pDivHDirect, 'padding')],
  ['divider.horizontal.content.paddingY', common.dividerHorizontalContentPaddingY, divHContentPad?.[0]],
  ['divider.horizontal.content.paddingX', common.dividerHorizontalContentPaddingX, divHContentPad?.[1]],
  ['divider.vertical.marginY', common.dividerVerticalMarginY, divVMargin?.[0]],
  ['divider.vertical.marginX', common.dividerVerticalMarginX, divVMargin?.[1]],
  ['divider.vertical.padding', common.dividerVerticalPadding, propPx(pDivVDirect, 'padding')],
  ['divider.vertical.content.paddingY', common.dividerVerticalContentPaddingY, divVContentPad?.[0]],
  ['divider.vertical.content.paddingX', common.dividerVerticalContentPaddingX, divVContentPad?.[1]],
];

// iconSize: el Kit lo declara en semanticCommon; nuestro default vive en una const TS
// (no en el preset) → lo leemos de ahí y lo cruzamos igual.
const ICON_TS = resolve(root, 'packages/design-system/utils/icon-size.ts');
const iconDefault = existsSync(ICON_TS)
  ? parseFloat((readFileSync(ICON_TS, 'utf8').match(/SC_ICON_SIZE_DEFAULT\s*=\s*([0-9.]+)/) || [])[1])
  : NaN;
sizing.push([
  'iconSize (SC_ICON_SIZE_DEFAULT)',
  semCommon.iconSize,
  Number.isNaN(iconDefault) ? undefined : iconDefault,
]);

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

// ── 6. COLOR de marca: export.semanticColorScheme ↔ --sc-* resuelto a hex ─────
// Las §1-5 cruzan MÉTRICAS (escala/radio/sizing); el COLOR no se vigilaba. Por eso
// el drift de primary.hover/active (light) y de toda la rampa primary dark vivió
// invisible hasta S62-ext-3 — lo cazó el ojo, no la herramienta. Esto lo cierra:
// resolvemos nuestros tokens a hex siguiendo var() por capas (dark→semantic→
// primitive) y los cruzamos con el export. Tabla con política por fila:
//   enforce → debe coincidir con el export (falla si no).
//   diverge → divergencia de marca consciente y documentada (solo informa).
log('\n=== 6. COLOR de marca (export.semanticColorScheme ↔ --sc-*, light+dark) ===');
const SEMANTIC_CSS = resolve(root, 'packages/design-system/tokens/layers/02-semantic.css');
const DARK_CSS = resolve(root, 'packages/design-system/tokens/layers/07-dark.css');
const semCss = existsSync(SEMANTIC_CSS) ? readFileSync(SEMANTIC_CSS, 'utf8') : '';
const darkCss = existsSync(DARK_CSS) ? readFileSync(DARK_CSS, 'utf8') : '';

function declMap(src) {
  const map = new Map();
  const re = /--([a-z0-9-]+)\s*:\s*([^;]+);/g;
  let x;
  while ((x = re.exec(src))) map.set(x[1], x[2].trim()); // última gana
  return map;
}
const primDecls = declMap(css);
const semDecls = declMap(semCss);
const darkDecls = declMap(darkCss);

function normHex(h) {
  let s = String(h).toLowerCase().replace(/^#/, '');
  if (s.length === 8) return s.slice(6) === 'ff' ? '#' + s.slice(0, 6) : '#' + s; // dropa alpha ff
  return '#' + s;
}
// Resuelve --name a #rrggbb en el modo dado, siguiendo var() por capas.
function resolveHex(name, mode, seen = new Set()) {
  if (seen.has(name)) return undefined;
  seen.add(name);
  const raw =
    mode === 'dark' && darkDecls.has(name)
      ? darkDecls.get(name)
      : (semDecls.get(name) ?? primDecls.get(name));
  if (raw == null) return undefined;
  if (/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(raw)) return normHex(raw);
  const v = raw.match(/var\(\s*--([a-z0-9-]+)\s*\)/);
  return v ? resolveHex(v[1], mode, seen) : undefined; // color-mix u otra forma → no-hex
}
// Reverso hex→primitiva (pista "usa --sc-color-X") para que el fix sea obvio.
const hexToPrim = new Map();
for (const [n, raw] of primDecls)
  if (/^sc-color-/.test(n) && /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(raw)) {
    const nh = normHex(raw);
    if (!hexToPrim.has(nh)) hexToPrim.set(nh, []);
    hexToPrim.get(nh).push('--' + n);
  }

const LC = kit.semanticColorScheme?.light ?? {};
const DC = kit.semanticColorScheme?.dark ?? {};
const expHex = (mode, key) => {
  const v = (mode === 'dark' ? DC : LC)[key];
  return v == null ? undefined : normHex(v);
};

// Tabla de mapeo marca↔Kit. [modo, claveExport, tokenSC]. Surface scale (light) =
// la base gris: gray-* DEBE == surface* del export (verificado 1:1). Rampa primary
// (color/hover/active/contrast) en ambos modos. El resto se diverge o queda sin mapear.
const ENFORCE = [
  ...['0', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'].map((s) => [
    'light',
    `surface${s}`,
    `sc-color-gray-${s}`,
  ]),
  ['light', 'primaryColor', 'sc-bg-primary'],
  ['light', 'primaryHoverColor', 'sc-bg-primary-hover'],
  ['light', 'primaryActiveColor', 'sc-bg-primary-active'],
  ['light', 'primaryContrastColor', 'sc-text-on-primary'],
  ['light', 'contentBackground', 'sc-bg-surface'],
  ['light', 'contentBorderColor', 'sc-border-default'],
  ['light', 'formFieldFocusBorderColor', 'sc-border-primary'],
  // Texto y roles alineados al Kit (S62-ext-3, bloque 2): cuerpo=gray-700,
  // muted=gray-500. nav/list resting text = gray-700 (= primary, no secondary).
  ['light', 'textColor', 'sc-text-primary'],
  ['light', 'textMutedColor', 'sc-text-secondary'],
  ['light', 'contentColor', 'sc-text-primary'],
  ['light', 'formFieldColor', 'sc-text-primary'],
  ['light', 'navigationItemColor', 'sc-text-primary'],
  ['light', 'listOptionColor', 'sc-text-primary'],
  // bg / icon / border que ya coincidían 1:1 — locked.
  ['light', 'formFieldBackground', 'sc-bg-surface'],
  ['light', 'formFieldHoverBorderColor', 'sc-border-strong'],
  ['light', 'formFieldDisabledBackground', 'sc-bg-disabled'],
  ['light', 'formFieldInvalidBorderColor', 'sc-border-error'],
  ['light', 'formFieldIconColor', 'sc-icon-subtle'],
  ['light', 'navigationItemActiveBackground', 'sc-bg-secondary-hover'],
  ['light', 'navigationItemIconColor', 'sc-icon-subtle'],
  ['light', 'listOptionFocusBackground', 'sc-bg-secondary-hover'],
  ['light', 'contentHoverBackground', 'sc-bg-secondary-hover'],
  ['light', 'overlayModalBackground', 'sc-bg-surface'],
  ['light', 'overlayModalBorderColor', 'sc-border-default'],
  ['light', 'overlayPopoverBackground', 'sc-bg-surface'],
  ['light', 'overlayPopoverBorderColor', 'sc-border-default'],
  ['light', 'overlaySelectBackground', 'sc-bg-elevated'],
  ['dark', 'primaryColor', 'sc-bg-primary'],
  ['dark', 'primaryHoverColor', 'sc-bg-primary-hover'],
  ['dark', 'primaryActiveColor', 'sc-bg-primary-active'],
  ['dark', 'primaryContrastColor', 'sc-text-on-primary'],
];
// Divergencias de marca conscientes (NO fallan; se listan para que consten).
const DIVERGE = [
  ['dark', 'surface*', 'gray-* navy-tinted (el Kit usa zinc en dark) — paleta de marca SC'],
  ['both', 'focusRing', '--sc-border-focus = electric-blue (a11y, customs §1.1) vs navy del Kit'],
  ['both', 'info', '--sc-bg-info = electric-blue (marca) — no está en el árbol semántico del Kit'],
  ['both', 'warn', '--sc-bg-warning = amber (marca) — ídem'],
  // Clasificadas por Rafa (S62-ext-3 bloque 2): chrome de form un punto más
  // fino/claro que el Kit, a propósito. El Kit colapsa todo lo no-primario a
  // gray-500; nosotros mantenemos una jerarquía más rica.
  ['light', 'formFieldBorderColor', 'borde de input gray-200 (=content/overlay) vs Kit gray-300 — 1 paso, imperceptible; sin token nuevo por decisión de Rafa'],
  ['light', 'formFieldPlaceholderColor', 'placeholder gray-400 vs Kit gray-500 — un punto más tenue (jerarquía propia)'],
  ['light', 'formFieldDisabledColor', 'disabled gray-300 vs Kit gray-500 — más tenue a propósito (se ve disabled)'],
  ['light', 'navigationItemActiveColor', 'nav activo gray-700 (= primary) vs Kit gray-800 — sin token de énfasis extra; minor'],
];

let colorOk = 0;
for (const [mode, key, token] of ENFORCE) {
  const exp = expHex(mode, key);
  const got = resolveHex(token, mode);
  if (exp === undefined) {
    log(`  ? [${mode}] ${key}: no está en el export (¿renombrada?)`);
  } else if (got === undefined) {
    fail(`[${mode}] ${key} → --${token}: no resuelve a hex (¿token inexistente o color-mix?)`);
  } else if (got !== exp) {
    const hint = hexToPrim.get(exp)?.join(' / ') || '∅ (ningún primitive con ese hex)';
    fail(`[${mode}] ${key}: export=${exp} vs --${token}=${got}  → debería apuntar a ${hint}`);
  } else {
    colorOk++;
  }
}
log(`  ✓ ${colorOk}/${ENFORCE.length} colores de marca 1:1 con el export (light+dark)`);
log('  divergencias de marca conscientes (no fallan):');
for (const [mode, what, why] of DIVERGE) log(`    · [${mode}] ${what}: ${why}`);
// ── 7. COLOR semántico extendido (INFORME — clasificar enforce vs divergencia) ─
// Bloque 2 batería S63: mapeo de los semánticos del Kit a nuestros roles --sc-*.
// REPORT-ONLY (no falla el build): saca la lista objetiva coincide/difiere para que
// Rafa clasifique cada "difiere" como drift (→ a corregir + enforce) o marca consciente
// (→ allow-list). Cuando estén clasificados, los enforce suben a §6. Mapeo por rol
// (PrimeNG semantic → rol SCDS); las claves sin token --sc- directo se listan aparte.
// Cobertura: claves semánticas del Kit sin token --sc- directo (hover/focus/
// submenu/highlight/mask/filled): no son enforce-ables (no hay token que cruzar);
// se resuelven vía el preset/colorScheme. Informativo.
const classified = new Set([...ENFORCE.map(([, k]) => k), ...DIVERGE.map(([, k]) => k)]);
const noToken = Object.keys(LC).filter(
  (k) => !classified.has(k) && !/^surface\d/.test(k) && !/^primary/.test(k),
);
log(`  sin token --sc- directo (${noToken.length}): se resuelven vía preset/colorScheme — informativo, no enforce.`);

// ── Resumen ──────────────────────────────────────────────────────────────────
log('\n' + '─'.repeat(60));
if (problems === 0) {
  log('✓ PARIDAD OK — sin gaps detectados.');
  process.exit(0);
} else {
  log(`✗ ${problems} gap(s) de paridad. Revisar arriba.`);
  process.exit(1);
}
