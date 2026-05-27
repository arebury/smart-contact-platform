#!/usr/bin/env node
/**
 * Auditoría de componentes — Aura default ↔ SC Prime export (drift silencioso inverso).
 *
 * SOLO LECTURA (no toca el DS). Bloque 3 batería S63. Detecta dónde el DEFAULT de
 * Aura (lo que PrimeNG renderiza si NO lo pisamos) difiere del Smart Contact Prime
 * Kit (`tokensprime.json`), para componentes que el preset NO fija → el usuario ve
 * "PrimeNG" en vez de "SC" sin que nadie lo note. Salida = lista de gaps a pinar.
 *
 * Cómo (determinista):
 *   1. Aplana Aura (primitive+semantic+components) a claves dot estilo PrimeNG
 *      (camelCase→dot: formField→form.field, paddingX→padding.x), dropando "root".
 *   2. Resuelve refs `{a.b.c}` contra ese mapa; convierte rem→px con base 14 (SC).
 *   3. Para cada métrica numérica del export (componentCommon), busca el valor Aura
 *      equivalente y compara. Buckets: match / DRIFT / sin-equivalente.
 *   4. Marca si el preset (sc-preset.ts) ya fija ese componente (entonces no es gap).
 *
 * Uso:  node scripts/component-audit.mjs [--all]   (--all = incluye sin-equivalente)
 */
import Aura from '@primeng/themes/aura';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve as presolve } from 'node:path';

const root = presolve(dirname(fileURLToPath(import.meta.url)), '..');
const REM_BASE = 14; // SC Prime root font-size (app/font/size = 14)
const log = (s = '') => process.stdout.write(s + '\n');
const showAll = process.argv.includes('--all');

// ── Export ───────────────────────────────────────────────────────────────────
let kit = JSON.parse(readFileSync(presolve(root, 'packages/design-system/tokens/tokensprime.json'), 'utf8'));
if (typeof kit === 'string') kit = JSON.parse(kit);
const exportCommon = kit.componentCommon?.mode1 ?? {};

// ── Aplanar Aura a claves dot (camelCase→dot, drop "root") ────────────────────
const camelToDot = (k) => k.replace(/([a-z0-9])([A-Z])/g, '$1.$2').replace(/([A-Z])([A-Z][a-z])/g, '$1.$2').toLowerCase();
const flat = new Map(); // 'button.padding.x' → rawValue
function flatten(obj, path) {
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'colorScheme') continue; // colores → fuera de este audit (métricas)
    const seg = k === 'root' ? '' : camelToDot(k);
    const next = seg ? (path ? path + '.' + seg : seg) : path;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, next);
    else flat.set(next, v);
  }
}
flatten(Aura.primitive ?? {}, '');
flatten(Aura.semantic ?? {}, '');
flatten(Aura.components ?? {}, '');

// ── Resolver ref/rem → px ─────────────────────────────────────────────────────
function toPx(raw, seen = new Set()) {
  if (typeof raw === 'number') return raw;
  if (typeof raw !== 'string') return undefined;
  const s = raw.trim();
  const ref = s.match(/^\{([^}]+)\}$/);
  if (ref) {
    if (seen.has(ref[1])) return undefined;
    seen.add(ref[1]);
    return flat.has(ref[1]) ? toPx(flat.get(ref[1]), seen) : undefined;
  }
  const rem = s.match(/^(-?[0-9.]+)rem$/);
  if (rem) return parseFloat(rem[1]) * REM_BASE;
  const px = s.match(/^(-?[0-9.]+)px$/);
  if (px) return parseFloat(px[1]);
  const num = s.match(/^-?[0-9.]+$/);
  if (num) return parseFloat(s);
  return undefined; // color, calc(), etc. — fuera de métricas
}

// ── Preset: ¿qué componentes fija? (para no marcar como gap lo ya pinado) ──────
const preset = existsSync(presolve(root, 'packages/design-system/tokens/sc-preset.ts'))
  ? readFileSync(presolve(root, 'packages/design-system/tokens/sc-preset.ts'), 'utf8')
  : '';
const PINNED = ['button', 'formField', 'tabs', 'tooltip', 'overlay']; // bloques que el preset fija
const isPinned = (compKey) => PINNED.some((p) => compKey.startsWith(p));

// Divergencias de métrica conocidas y aceptadas (no fallan el guard). Cada una
// con razón. El accordion NO se usa en la app → no pinamos un bloque de preset
// "por si acaso" (regla DD-5 / no-goals); si se adopta, alinear su focus offset.
const ALLOW = new Map([
  ['accordionHeaderFocusRingOffset', 'accordion no usado; Aura usa focus inset (-1) vs SC outset (2) — pinar si se adopta'],
]);

// ── Diff: cada métrica numérica del export ↔ Aura resuelto ────────────────────
const drift = [];
const matched = [];
const noEquiv = [];
for (const [key, val] of Object.entries(exportCommon)) {
  if (typeof val !== 'number') continue; // solo métricas numéricas
  const dot = camelToDot(key);
  const auraRaw = flat.has(dot) ? flat.get(dot) : undefined;
  const aura = auraRaw === undefined ? undefined : toPx(auraRaw);
  const comp = dot.split('.')[0];
  if (aura === undefined) {
    noEquiv.push({ key, val, comp });
  } else if (Math.abs(aura - val) > 0.01) {
    drift.push({ key, val, aura, comp, pinned: isPinned(comp) });
  } else {
    matched.push(key);
  }
}

// ── Informe ────────────────────────────────────────────────────────────────────
const byComp = (arr) => {
  const m = {};
  for (const d of arr) (m[d.comp] = m[d.comp] || []).push(d);
  return m;
};
log('=== AUDITORÍA COMPONENTES — Aura default ↔ SC Prime export (métricas) ===');
log(`  métricas numéricas export: ${matched.length + drift.length + noEquiv.length}`);
log(`  ✓ coinciden: ${matched.length}  ·  ✗ DRIFT: ${drift.length}  ·  ? sin-equivalente-Aura: ${noEquiv.length}`);

const driftNotPinned = drift.filter((d) => !d.pinned && !ALLOW.has(d.key));
const driftAllowed = drift.filter((d) => !d.pinned && ALLOW.has(d.key));
const driftPinned = drift.filter((d) => d.pinned);
log(`\n── DRIFT accionable en componentes NO pinados (${driftNotPinned.length}) = el usuario ve Aura, no SC ──`);
const g = byComp(driftNotPinned);
for (const comp of Object.keys(g).sort()) {
  log(`  ${comp} (${g[comp].length}):`);
  for (const d of g[comp].slice(0, 8)) log(`    · ${d.key}: SC=${d.val} vs Aura=${+d.aura.toFixed(2)}`);
  if (g[comp].length > 8) log(`    … +${g[comp].length - 8} más`);
}
if (driftNotPinned.length === 0) log('  ✓ ninguno — los componentes no pinados heredan métricas = SC Prime');
if (driftAllowed.length)
  log(`\n── Divergencias conocidas/aceptadas (${driftAllowed.length}) ──\n` +
    driftAllowed.map((d) => `  · ${d.key}: SC=${d.val} vs Aura=${+d.aura.toFixed(2)} — ${ALLOW.get(d.key)}`).join('\n'));
log(`\n── DRIFT en componentes YA pinados (${driftPinned.length}) — el preset ya los corrige (sanity) ──`);
log(`  ${[...new Set(driftPinned.map((d) => d.comp))].join(', ') || 'ninguno'}`);

if (showAll) {
  log(`\n── Sin equivalente Aura (${noEquiv.length}) — clave del Kit que Aura no tiene o naming distinto ──`);
  const n = byComp(noEquiv);
  for (const comp of Object.keys(n).sort()) log(`  ${comp}: ${n[comp].length}`);
}
log('\n(Para pinar: añadir el bloque del componente en sc-preset.ts con el valor SC. --all para ver sin-equivalente.)');

// Guard: falla solo si hay DRIFT ACCIONABLE (no pinado, no allow-listado). Las
// claves sin-equivalente no cuentan (Aura no las tiene → no hay default que filtre).
if (driftNotPinned.length > 0) {
  log(`\n✗ ${driftNotPinned.length} drift accionable — pinar en sc-preset.ts o allow-listar con razón.`);
  process.exit(1);
}
log('\n✓ Sin drift de métrica accionable — los componentes heredan métricas SC Prime correctamente.');
process.exit(0);
