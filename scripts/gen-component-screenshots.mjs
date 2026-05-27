#!/usr/bin/env node
/**
 * Genera los thumbnails del tracker del home de ds-docs.
 *
 * El home (`pages/home`) referencia `/component-screenshots/{slug}.png` para cada
 * componente del tracker (thumbnail + lightbox "ampliada"). Esos PNGs NUNCA se
 * commitearon → las imágenes salían 404. Este script las (re)genera capturando la
 * región `.gallery` de cada página `/components/{slug}`.
 *
 * Las fotos SÍ son una captura legítima: son el ENTREGABLE (imagen para que un
 * humano la mire), no una verificación de diseño (eso se hace inspeccionando).
 *
 * Uso (con ds-docs sirviendo en 4201):
 *   npm run start:ds-docs -- --no-hmr --port 4201   # en otra terminal
 *   node scripts/gen-component-screenshots.mjs
 *
 * Los slugs se leen del propio home (fuente de verdad) → no hay lista que mantener.
 */
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(root, 'apps/ds-docs/public/component-screenshots');
const HOME = resolve(root, 'apps/ds-docs/src/app/pages/home/home.component.ts');
const BASE = process.env.DS_DOCS_URL || 'http://localhost:4201';

mkdirSync(OUT, { recursive: true });

// Slugs = los pageRoute del tracker del home (fuente de verdad, sin lista a mano).
const homeSrc = readFileSync(HOME, 'utf8');
const slugs = [...new Set([...homeSrc.matchAll(/pageRoute:\s*'\/components\/([a-z0-9-]+)'/g)].map((m) => m[1]))];
if (slugs.length === 0) {
  console.error('✗ No se encontraron slugs en home.component.ts');
  process.exit(1);
}
console.log(`Generando ${slugs.length} thumbnails desde ${BASE} …`);

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 2,
});

let ok = 0;
const fails = [];
for (const slug of slugs) {
  try {
    await page.goto(`${BASE}/components/${slug}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const gallery = page.locator('.gallery').first();
    await gallery.waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForTimeout(400); // que los demos terminen de pintar
    const box = await gallery.boundingBox();
    if (!box) throw new Error('.gallery sin boundingBox');
    // Recorte: cabecera + primer demo (tope de la gallery), ratio legible.
    await page.screenshot({
      path: resolve(OUT, `${slug}.png`),
      clip: { x: box.x, y: box.y, width: box.width, height: Math.min(box.height, 760) },
    });
    ok++;
    console.log(`  ✓ ${slug}`);
  } catch (e) {
    fails.push(slug);
    console.log(`  ✗ ${slug} — ${e.message.split('\n')[0]}`);
  }
}
await browser.close();

console.log(`\n${ok}/${slugs.length} thumbnails → ${OUT}`);
if (fails.length) {
  console.log(`✗ fallaron: ${fails.join(', ')}`);
  process.exit(1);
}
