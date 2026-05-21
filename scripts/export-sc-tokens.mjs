#!/usr/bin/env node
/**
 * export-sc-tokens.mjs
 *
 * Exports the SCDS primitive layer (`packages/design-system/tokens/layers/01-primitive.css`)
 * as DTCG (Design Tokens Community Group) JSON to `apps/ds-docs/public/sc-tokens.json`.
 *
 * - Parses `--sc-*: VALUE;` declarations.
 * - Resolves `var(--sc-X)` aliases to their raw primitive value.
 * - Detects `$type` by value pattern (hex → color, px → dimension, etc.).
 * - Groups by category (color palettes, scale, spacing, radius, etc.).
 * - Tags brand-custom tokens (navy primary, electric-blue, amber, soft-blue,
 *   radius-2xl/full, font-family-mono) with `$extensions.sc.custom = true`
 *   per customs-catalog §1.
 *
 * Trigger reapertura: cuando Kit Pro publique nuevas Variables JSON, re-run
 * y diff. La S58 cierra el pending del S57 (whats-new-v2 botón download).
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PRIMITIVE_CSS = resolve(ROOT, 'packages/design-system/tokens/layers/01-primitive.css');
const OUTPUT_JSON = resolve(ROOT, 'apps/ds-docs/public/sc-tokens.json');

const COLOR_FAMILIES = [
  'soft-blue', 'electric-blue',
  'blue', 'gray', 'green', 'amber', 'red',
  'violet', 'orange', 'teal', 'purple', 'emerald', 'azure',
];

const CUSTOM_FAMILIES = new Set(['blue', 'soft-blue', 'electric-blue', 'amber']);
const CUSTOM_TOKENS = new Set([
  'radius-2xl', 'radius-full', 'font-family-mono',
]);

function parsePrimitive(css) {
  const declarations = new Map();
  const re = /--sc-([a-z0-9-]+):\s*([^;]+);/gi;
  let m;
  while ((m = re.exec(css)) !== null) {
    const name = m[1].trim();
    const value = m[2].trim();
    declarations.set(name, value);
  }
  return declarations;
}

function resolveAlias(value, decls, seen = new Set()) {
  const aliasRe = /var\(--sc-([a-z0-9-]+)\)/i;
  const match = aliasRe.exec(value);
  if (!match) return value;
  const target = match[1];
  if (seen.has(target)) return value;
  seen.add(target);
  const targetValue = decls.get(target);
  if (targetValue === undefined) return value;
  return resolveAlias(targetValue, decls, seen);
}

function detectType(value) {
  if (/^#[0-9a-f]{3,8}$/i.test(value)) return 'color';
  if (/^-?\d+(\.\d+)?px$/.test(value)) return 'dimension';
  if (/^-?\d+(\.\d+)?$/.test(value)) return 'number';
  if (value === '0') return 'number';
  if (value === '9999px') return 'dimension';
  if (/^[\d.]+(em|rem|%)$/.test(value)) return 'dimension';
  if (/sans-serif|monospace|serif/.test(value)) return 'fontFamily';
  return null;
}

function categorize(name) {
  // Multi-word prefix categories
  const prefixed = [
    ['font-family-', 'font-family'],
    ['font-size-', 'font-size'],
    ['font-weight-', 'font-weight'],
    ['line-height-', 'line-height'],
    ['icon-size-', 'icon-size'],
    ['focus-ring-', 'focus-ring'],
  ];
  for (const [prefix, cat] of prefixed) {
    if (name.startsWith(prefix)) {
      return { category: cat, sub: null, leaf: name.slice(prefix.length) };
    }
  }
  if (name === 'icon-size') return { category: 'icon-size', sub: null, leaf: 'default' };

  // Color: detect family
  if (name.startsWith('color-')) {
    const rest = name.slice('color-'.length);
    for (const fam of COLOR_FAMILIES) {
      if (rest.startsWith(fam + '-') || rest === fam) {
        const leaf = rest === fam ? 'base' : rest.slice(fam.length + 1);
        return { category: 'color', sub: fam, leaf };
      }
    }
    return { category: 'color', sub: 'misc', leaf: rest };
  }

  // Scale, spacing, radius — single-word category
  for (const cat of ['scale', 'spacing', 'radius']) {
    if (name.startsWith(cat + '-') || name === cat) {
      const leaf = name === cat ? 'base' : name.slice(cat.length + 1);
      return { category: cat, sub: null, leaf };
    }
  }

  return { category: 'misc', sub: null, leaf: name };
}

function isCustom(category, sub, leaf, fullName) {
  if (CUSTOM_TOKENS.has(fullName)) return true;
  if (category === 'color' && CUSTOM_FAMILIES.has(sub)) return true;
  return false;
}

function build(decls) {
  const out = {
    $schema: 'https://design-tokens.github.io/community-group/format/',
    $description:
      'Smart Contact Design System (SCDS) — primitive tokens, exported from `packages/design-system/tokens/layers/01-primitive.css`. Naming 1:1 con Smart Contact Prime UI Kit Pro Variables JSON (Figma).',
  };

  for (const [name, rawValue] of decls.entries()) {
    const resolved = resolveAlias(rawValue, decls);
    const $type = detectType(resolved);
    if (!$type) continue; // skip unresolvable / unknown shapes

    const { category, sub, leaf } = categorize(name);
    const token = { $value: resolved, $type };

    if (resolved !== rawValue) {
      // Was an alias — record the reference for debug / round-trip.
      token.$extensions = { sc: { alias: rawValue } };
    }
    if (isCustom(category, sub, leaf, name)) {
      token.$extensions = token.$extensions ?? {};
      token.$extensions.sc = { ...(token.$extensions.sc ?? {}), custom: true };
    }

    if (!out[category]) out[category] = {};
    if (sub) {
      if (!out[category][sub]) out[category][sub] = {};
      out[category][sub][leaf] = token;
    } else {
      out[category][leaf] = token;
    }
  }

  return out;
}

function main() {
  const css = readFileSync(PRIMITIVE_CSS, 'utf8');
  const decls = parsePrimitive(css);
  const json = build(decls);

  mkdirSync(dirname(OUTPUT_JSON), { recursive: true });
  writeFileSync(OUTPUT_JSON, JSON.stringify(json, null, 2) + '\n', 'utf8');

  const tokenCount = Array.from(decls.keys()).length;
  console.log(`✓ Exported ${tokenCount} primitive tokens → ${OUTPUT_JSON}`);
}

main();
