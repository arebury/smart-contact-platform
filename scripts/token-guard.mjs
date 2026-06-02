#!/usr/bin/env node
/**
 * Guardarraíl de tokens — blindaje contra "un update de PrimeNG rompe todo".
 *
 * Regla dura (S62-ext-3, pedida por Rafa): el ÚNICO sitio que puede tocar las
 * variables `--p-*` de PrimeNG es el puente `sc-preset.ts`. Si un componente usa
 * `var(--p-...)` directo y un día PrimeNG renombra/reestructura ese token (v22,
 * v23…), ese componente se rompe en silencio. Manteniendo `--p-*` en UN archivo,
 * el radio de explosión de cualquier upgrade es ese archivo y nada más. Los
 * componentes consumen SIEMPRE el `--sc-*` equivalente (que el preset mapea).
 *
 * Regla dura 2: en componentes/app, las medidas van por el alias semántico
 * `--sc-spacing-*`, no por la primitiva `--sc-scale-*` directa (que es layer-1).
 * Hoy hay 0 violaciones; el check las mantiene en 0.
 *
 * Regla dura 3: los campos de formulario PrimeNG (`<p-select>`, `<p-multiselect>`,
 * `<p-datepicker>`, `<p-inputnumber>`, `<p-textarea>`, `<p-password>`,
 * `<p-autocomplete>`…) NO se usan crudos en plantillas de app — SIEMPRE vía su
 * wrapper SCDS (`<sc-select>`…). Si no, ese campo se salta la chrome del DS y la
 * densidad (font 14px base): PrimeNG hardcodea `font-size: 1rem` y el wrapper es
 * quien lo corrige. Un campo crudo reintroduce el "input enorme" 16px en silencio.
 * Hoy 0 usos fuera de los wrappers; el check los mantiene en 0.
 *
 * NO se vigila `var(--sc-color-*)` directo: hay ~261 usos legítimos (paletas de
 * label, status) y el riesgo de upgrade es bajo → sería ruido. Decisión por dato.
 *
 * Uso:  node scripts/token-guard.mjs   (pre-commit; sale ≠0 si hay violación)
 */
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const log = (s = '') => process.stdout.write(s + '\n');
const PRESET = 'packages/design-system/tokens/sc-preset.ts'; // único que puede tocar --p-*
// Allow-list Dura 4 (font-size literal): el display 88px de bulk-transcription es
// off-scale (decisión de tamaño display aparte). El resto debe ser --sc-font-size-*.
const FONT_ALLOW = new Set([
  'apps/supervisor/src/app/features/memory/components/bulk-transcription-modal/bulk-transcription-modal.component.scss',
]);

// Ficheros versionados de código/estilo bajo apps + packages.
const files = execSync('git ls-files apps packages', { cwd: root, encoding: 'utf8' })
  .split('\n')
  .filter((f) => /\.(scss|css|html|ts)$/.test(f) && !f.endsWith('.spec.ts'));

let problems = 0;
const fail = (s) => {
  problems++;
  log('  ✗ ' + s);
};

for (const f of files) {
  const lines = readFileSync(resolve(root, f), 'utf8').split('\n');
  lines.forEach((line, i) => {
    const at = `${f}:${i + 1}`;
    // El sufijo `[a-z]` exige un token REAL (`var(--p-focus-ring-color)`), no el
    // placeholder de documentación `var(--p-*)` que aparece como texto en ds-docs.
    // Dura 1 — var(--p-*) fuera del preset.
    if (f !== PRESET && /var\(\s*--p-[a-z]/.test(line)) {
      fail(`${at} usa var(--p-*) directo → solo ${PRESET} puede tocar --p-*. Usa el --sc-* equivalente.`);
      log(`      ${line.trim()}`);
    }
    // Dura 2 — var(--sc-scale-*) en componentes/app (debe ser el alias --sc-spacing-*).
    // Los ficheros de tokens/ (preset + capas) sí referencian --sc-scale-* legítimamente.
    if (!f.includes('design-system/tokens/') && /var\(\s*--sc-scale-[a-z0-9]/.test(line)) {
      fail(`${at} usa var(--sc-scale-*) (primitiva layer-1) → en componentes usa el alias semántico --sc-spacing-*.`);
      log(`      ${line.trim()}`);
    }
    // Dura 3 — campo de formulario PrimeNG crudo fuera de los wrappers SCDS.
    // Los wrappers (packages/design-system/components/) sí los usan internamente.
    if (
      f.endsWith('.html') &&
      !f.includes('design-system/') &&
      /<p-(select|multiSelect|multiselect|datePicker|datepicker|inputNumber|inputnumber|textarea|password|autoComplete|autocomplete|treeSelect|treeselect|cascadeSelect|cascadeselect)\b/i.test(
        line,
      )
    ) {
      fail(`${at} usa un campo PrimeNG crudo → envuélvelo en su wrapper SCDS (<sc-select>, <sc-multiselect>…). Si no, se salta la densidad/chrome del DS.`);
      log(`      ${line.trim()}`);
    }
    // Dura 4 — font-size literal px/rem en SCSS (debe ser --sc-font-size-*).
    // Cinturón tipográfico (S67): el tipo se cambia SOLO por tokens, nunca con
    // literales a mano → un update/cambio de tipo no deja huérfanos. Salta
    // comentarios, las capas de tokens y el allow-list (display 88px).
    if (
      /\.(scss|css)$/.test(f) &&
      !f.includes('design-system/tokens/') &&
      !FONT_ALLOW.has(f) &&
      /(?<![\w-])font-size:\s*[0-9.]+(px|rem)/.test(line) &&
      !/^\s*(\/\/|\*|\/\*)/.test(line) &&
      !/(\/\/|\/\*).*font-size/.test(line)
    ) {
      fail(`${at} usa font-size literal → usa un token --sc-font-size-* (cinturón tipográfico migration-safe).`);
      log(`      ${line.trim()}`);
    }
  });
}

log('─'.repeat(60));
if (problems === 0) {
  log(`✓ GUARDARRAÍL OK — ningún componente toca --p-*, primitivas de escala ni font-size literal (${files.length} ficheros).`);
  process.exit(0);
}
log(`✗ ${problems} violación(es). Los componentes deben consumir --sc-* (el puente sc-preset.ts aísla PrimeNG).`);
process.exit(1);
