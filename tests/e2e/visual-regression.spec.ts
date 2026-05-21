import { test, expect } from '@playwright/test';

/**
 * Visual regression baseline. Pequeño set de pantallas canonical light +
 * dark — red de seguridad para detectar drift visual silencioso tras
 * cambios SCDS / tokens / refactors.
 *
 * Operativa:
 *   npm run e2e -- visual-regression                 # check diff vs baseline
 *   npm run e2e -- visual-regression --update-snapshots   # regenerar baseline
 *
 * Cuando un test falla = pixel diff > 2%. Decisión humana: el cambio es
 * intencional (regenerar baseline + commit) o regresión (fix).
 *
 * Screens cubiertos (4 × 2 themes = 8 baselines):
 *  - AED list-page (`/admin/agentes`) — table chrome + page header
 *  - AED form-page (`/admin/agentes/editar/1`) — sticky-form-header + section-cards
 *  - ds-docs gallery (`/components/inputtext`) — wrapper sizes/variants
 *  - Memory list (`/conversaciones/categorias`) — Memory shell + list chrome
 */

const AED = 'http://localhost:4200';
const DS_DOCS = 'http://localhost:4201';

const SCREENS: ReadonlyArray<{ name: string; url: string }> = [
  { name: 'aed-agentes-list', url: `${AED}/admin/agentes` },
  { name: 'aed-agentes-edit', url: `${AED}/admin/agentes/editar/1` },
  { name: 'ds-docs-inputtext', url: `${DS_DOCS}/components/inputtext` },
  { name: 'memory-categorias', url: `${AED}/conversaciones/categorias` },
];

const THEMES = ['light', 'dark'] as const;

/**
 * Antes de navegar: setear theme en localStorage (ThemeService AED lo lee
 * al boot). ds-docs NO tiene ThemeService propio — `applyThemeAfterBoot`
 * más abajo le aplica `.sc-dark` directamente sobre `<html>` tras el
 * bootstrap Angular (Vite/CDR limpia clases injected pre-bootstrap en
 * ds-docs por motivos no diagnosticados; aplicar post-render evita esa
 * race).
 */
async function preparePage(page: import('@playwright/test').Page, theme: 'light' | 'dark') {
  await page.addInitScript((t) => {
    localStorage.setItem('sc-theme', t);
  }, theme);
}

async function applyThemeAfterBoot(
  page: import('@playwright/test').Page,
  theme: 'light' | 'dark',
) {
  await page.evaluate((t) => {
    if (t === 'dark') {
      document.documentElement.classList.add('sc-dark');
    } else {
      document.documentElement.classList.remove('sc-dark');
    }
  }, theme);
}

async function freezeAndSettle(page: import('@playwright/test').Page) {
  // CSS reset de animaciones (PrimeNG + SCDS).
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
      /* Caret blink (sc-inputtext) introduce 1px flicker en gallery */
      input, textarea { caret-color: transparent !important; }
    `,
  });
  // Esperar fonts cargadas — sino el primer render usa fallback system font.
  await page.evaluate(() => (document as Document & { fonts: FontFaceSet }).fonts.ready);
  // Pequeña pausa para que el effect del ThemeService aplique `.sc-dark`.
  await page.waitForTimeout(150);
}

test.describe('Visual regression — light + dark baseline', () => {
  test.describe.configure({ mode: 'serial' });

  for (const theme of THEMES) {
    for (const screen of SCREENS) {
      test(`${screen.name} · ${theme}`, async ({ page }) => {
        await preparePage(page, theme);
        await page.goto(screen.url, { waitUntil: 'domcontentloaded' });
        await applyThemeAfterBoot(page, theme);
        await freezeAndSettle(page);
        await expect(page).toHaveScreenshot(`${screen.name}-${theme}.png`, {
          fullPage: false,
          maxDiffPixelRatio: 0.02,
          animations: 'disabled',
        });
      });
    }
  }
});
