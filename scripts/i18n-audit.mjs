#!/usr/bin/env node
/**
 * i18n audit · verifica consistencia cross-locale en
 * `apps/supervisor/src/assets/i18n/{es,en,fr,pt}.json`.
 *
 * Origen S49 (bug 3): `common.duplicate` era string en ES y object con
 * sub-keys huérfanos en EN/FR/PT → `translate.instant('common.duplicate')`
 * devolvía `[object Object]` literal en EN. Mismo riesgo si cualquier
 * future commit divergiese tipos entre locales.
 *
 * Reglas:
 *   1. Todo path leaf que sea STRING en alguno de los locales debe ser
 *      STRING en TODOS (no puede ser objeto en otro).
 *   2. Todo path nested que sea OBJECT en alguno debe ser OBJECT en todos.
 *   3. Reporta keys missing en alguno (warn, no fail por defecto).
 *
 * Uso:
 *   node scripts/i18n-audit.mjs            # exit 1 si hay errores tipo
 *   node scripts/i18n-audit.mjs --strict   # exit 1 también si hay missing
 *
 * Integrado en `npm run i18n:audit` y husky pre-commit.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const LOCALES = ['es', 'en', 'fr', 'pt'];
const BASE = resolve(ROOT, 'apps/supervisor/src/assets/i18n');

const strict = process.argv.includes('--strict');

const loaded = Object.fromEntries(
  LOCALES.map((l) => [l, JSON.parse(readFileSync(`${BASE}/${l}.json`, 'utf8'))]),
);

/** Recursively collect all paths + their type ('object'|'string'|'other'). */
function walk(obj, prefix = '', out = new Map()) {
  if (obj === null || obj === undefined) return out;
  if (typeof obj !== 'object' || Array.isArray(obj)) {
    out.set(prefix, typeof obj === 'string' ? 'string' : typeof obj);
    return out;
  }
  // It's an object — record self AND descend
  if (prefix !== '') out.set(prefix, 'object');
  for (const [k, v] of Object.entries(obj)) {
    walk(v, prefix === '' ? k : `${prefix}.${k}`, out);
  }
  return out;
}

const maps = Object.fromEntries(LOCALES.map((l) => [l, walk(loaded[l])]));

// Union of all paths.
const allPaths = new Set();
for (const m of Object.values(maps)) for (const p of m.keys()) allPaths.add(p);

const typeMismatches = [];
const missingPaths = [];

for (const path of [...allPaths].sort()) {
  const types = LOCALES.map((l) => maps[l].get(path));
  const present = LOCALES.filter((_, i) => types[i] !== undefined);
  const absent = LOCALES.filter((_, i) => types[i] === undefined);

  if (absent.length > 0) {
    missingPaths.push({ path, presentIn: present, missingIn: absent });
  }

  const uniqueTypes = new Set(types.filter((t) => t !== undefined));
  if (uniqueTypes.size > 1) {
    typeMismatches.push({
      path,
      byLocale: Object.fromEntries(LOCALES.map((l, i) => [l, types[i] ?? '<missing>'])),
    });
  }
}

let failed = false;

if (typeMismatches.length > 0) {
  console.error('\n✗ Type mismatch across locales (CRITICAL — causes [object Object] runtime):');
  for (const m of typeMismatches) {
    console.error(`  • ${m.path}`);
    for (const [l, t] of Object.entries(m.byLocale)) {
      console.error(`      ${l}: ${t}`);
    }
  }
  failed = true;
}

if (missingPaths.length > 0) {
  const level = strict ? 'error' : 'warn';
  const symbol = strict ? '✗' : '⚠';
  console[level === 'error' ? 'error' : 'warn'](
    `\n${symbol} Missing keys (present in some locales, absent in others)${strict ? ' (CRITICAL — strict mode)' : ''}:`,
  );
  for (const m of missingPaths) {
    console[level === 'error' ? 'error' : 'warn'](
      `  • ${m.path} — present: [${m.presentIn.join(', ')}], missing: [${m.missingIn.join(', ')}]`,
    );
  }
  if (strict) failed = true;
}

if (failed) {
  console.error(`\n${typeMismatches.length} type mismatch(es), ${missingPaths.length} missing key(s).`);
  process.exit(1);
}

const total = allPaths.size;
console.log(
  `✓ i18n audit OK — ${total} unique paths across ${LOCALES.length} locales (${missingPaths.length} missing key warnings, 0 type mismatches).`,
);
