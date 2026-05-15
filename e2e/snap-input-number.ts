import { chromium } from '@playwright/test';
import { resolve } from 'node:path';
import { mkdirSync } from 'node:fs';

async function main() {
  const out = resolve(__dirname, 'ds-docs-input-number');
  mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  for (const theme of ['light', 'dark'] as const) {
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      deviceScaleFactor: 2,
      colorScheme: theme,
      locale: 'es-ES',
    });
    const page = await ctx.newPage();
    await page.goto('http://localhost:4300/components/input-number', { waitUntil: 'domcontentloaded', timeout: 30_000 }).catch(() => {});
    await page.waitForSelector('.gallery', { timeout: 10_000 }).catch(() => {});
    await page.waitForTimeout(700);
    await page.screenshot({ path: resolve(out, `input-number-${theme}.png`), fullPage: true });
    await ctx.close();
  }
  await browser.close();
  console.log('done →', out);
}
main().catch(e => { console.error(e); process.exit(1); });
