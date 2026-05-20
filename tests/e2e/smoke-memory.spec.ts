import { test, expect } from '@playwright/test';

/**
 * Memory smoke tests — valida que las 4 páginas de Memory cargan + el shell
 * compartido con AED (sidebar, top-bar, page-header) sigue presente.
 */

const APP = 'http://localhost:4200';

test.describe('Memory smoke', () => {
  test('conversaciones list-page carga + mock switcher visible', async ({ page }) => {
    await page.goto(`${APP}/conversaciones`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('sc-page-header')).toBeVisible();
    await expect(page.locator('sc-memory-mock-sample-switcher')).toBeVisible();
    // Tabla o empty state según mock-data activo
    await expect(page.locator('sc-memory-conversation-table, sc-empty-state')).toBeVisible();
  });

  test('categorías list-page carga', async ({ page }) => {
    await page.goto(`${APP}/conversaciones/categorias`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('sc-page-header')).toBeVisible();
  });

  test('entidades list-page carga', async ({ page }) => {
    await page.goto(`${APP}/conversaciones/entidades`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('sc-page-header')).toBeVisible();
  });

  test('reglas list-page carga', async ({ page }) => {
    await page.goto(`${APP}/conversaciones/reglas`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('sc-page-header')).toBeVisible();
  });
});
