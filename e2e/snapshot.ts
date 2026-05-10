/* eslint-disable */
/**
 * Visual snapshot script — drives Playwright through every key screen
 * of the AED app and saves a `.png` per screen under
 * `e2e/screenshots/<set>/<page>.png`. Used to compare BEFORE / AFTER
 * any visual refactor (Angular upgrades, dark-mode token tweaks,
 * SCSS consolidation, …).
 *
 * Usage:
 *   npx tsx e2e/snapshot.ts <set> [baseUrl] [theme]
 *
 *   <set>     — folder name under `e2e/screenshots/` (e.g. "baseline",
 *               "after-ng21", "before-color-mix-dark").
 *   [baseUrl] — defaults to http://localhost:4200. Pass a Netlify URL
 *               if you'd rather snapshot a deployed branch preview.
 *   [theme]   — "light" (default) or "dark". Sets `localStorage`
 *               `sc_theme` before navigation so the app's
 *               `ThemeService` picks the chosen mode on init.
 */

import { chromium, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

interface Screen {
  /** File name (without extension). */
  readonly name: string;
  /** Path to navigate to, relative to baseUrl. */
  readonly path: string;
  /** Optional waiter — skip a `domcontentloaded`-only race when there's a list to render. */
  readonly waitFor?: string;
}

const SCREENS: readonly Screen[] = [
  { name: '01-dashboard', path: '/' },
  { name: '02-agents-list', path: '/admin/agentes', waitFor: 'table.table' },
  { name: '03-agent-create', path: '/admin/agentes/crear', waitFor: '.sticky-header' },
  { name: '04-groups-list', path: '/admin/grupos', waitFor: 'table.table' },
  { name: '05-group-create', path: '/admin/grupos/crear', waitFor: '.sticky-header' },
  { name: '06-users-list', path: '/admin/usuarios', waitFor: 'table.table' },
  { name: '07-user-create', path: '/admin/usuarios/crear', waitFor: '.sticky-header' },
  { name: '08-labels', path: '/admin/etiquetas' },
  { name: '09-templates', path: '/admin/plantillas' },
  { name: '10-config-aed', path: '/admin/aed' },
];

async function snap(page: Page, screen: Screen, baseUrl: string, outDir: string): Promise<void> {
  const url = `${baseUrl}${screen.path}`;
  console.log(`→ ${screen.name}: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
  if (screen.waitFor) {
    await page.waitForSelector(screen.waitFor, { timeout: 10_000 }).catch(() => {
      console.warn(`  (waitFor "${screen.waitFor}" timed out, screenshotting anyway)`);
    });
  }
  // Settle: lazy fonts / illustrated avatars / async data finish painting.
  await page.waitForTimeout(500);
  await page.screenshot({ path: resolve(outDir, `${screen.name}.png`), fullPage: true });
}

async function main(): Promise<void> {
  const set = process.argv[2];
  const baseUrl = process.argv[3] ?? 'http://localhost:4200';
  const theme = (process.argv[4] ?? 'light') as 'light' | 'dark';
  if (!set) {
    console.error('Usage: npx tsx e2e/snapshot.ts <set> [baseUrl] [light|dark]');
    process.exit(1);
  }
  if (theme !== 'light' && theme !== 'dark') {
    console.error(`Invalid theme "${theme}" — must be "light" or "dark"`);
    process.exit(1);
  }
  const outDir = resolve(__dirname, 'screenshots', set);
  mkdirSync(outDir, { recursive: true });
  console.log(`📸 Snapshotting "${set}" (${theme} mode) against ${baseUrl} → ${outDir}`);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // retina-quality screenshots
    locale: 'es-ES',
    /* `colorScheme` is the cleanest dark-mode signal: it sets
     * `prefers-color-scheme: dark` on the page so AED's
     * `ThemeService` (which defaults to `'system'`) resolves
     * `effectiveMode` to `dark` without needing localStorage. */
    colorScheme: theme === 'dark' ? 'dark' : 'light',
  });
  const page = await context.newPage();

  for (const screen of SCREENS) {
    try {
      await snap(page, screen, baseUrl, outDir);
    } catch (err) {
      console.error(`  ✗ ${screen.name} failed:`, err instanceof Error ? err.message : err);
    }
  }

  await browser.close();
  console.log('✅ Done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
