import { test, expect } from '@playwright/test';

/**
 * Memory smoke tests — valida que las 4 páginas de Memory cargan + el shell
 * compartido con AED (sidebar, top-bar) sigue presente.
 *
 * Modelo "todo arriba" (experiment S59): la identidad ya no vive en
 * `sc-page-header` sino en el breadcrumb del TopBar; el CTA (cuando lo hay)
 * en `.top-bar__actions`. Conversaciones no tiene CTA pero sí el switcher
 * de datos demo en el slot contextual del TopBar.
 */

const APP = 'http://localhost:4200';

test.describe('Memory smoke', () => {
  test('conversaciones list-page carga + mock switcher visible', async ({ page }) => {
    await page.goto(`${APP}/conversaciones`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('sc-top-bar')).toBeVisible();
    await expect(page.locator('.top-bar__crumb-current')).toBeVisible();
    await expect(page.locator('sc-memory-mock-sample-switcher')).toBeVisible();
    // Tabla o empty state según mock-data activo
    await expect(page.locator('sc-memory-conversation-table, sc-empty-state')).toBeVisible();
  });

  test('categorías list-page carga', async ({ page }) => {
    await page.goto(`${APP}/conversaciones/categorias`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('sc-top-bar')).toBeVisible();
    await expect(page.locator('.top-bar__actions')).toBeVisible();
  });

  test('entidades list-page carga', async ({ page }) => {
    await page.goto(`${APP}/conversaciones/entidades`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('sc-top-bar')).toBeVisible();
    await expect(page.locator('.top-bar__actions')).toBeVisible();
  });

  test('reglas list-page carga', async ({ page }) => {
    await page.goto(`${APP}/conversaciones/reglas`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('sc-top-bar')).toBeVisible();
    await expect(page.locator('.top-bar__actions')).toBeVisible();
  });
});
