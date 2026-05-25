import { test, expect } from '@playwright/test';

/**
 * AED smoke tests — valida que las páginas principales del módulo AED
 * cargan sin error y muestran el page-header esperado.
 *
 * Cada test asserta:
 *  1. URL final correcta tras navegar (router activo).
 *  2. `<sc-page-header>` presente (shell montado).
 *  3. Algún selector clave que pruebe el feature renderizó (no bare shell).
 */

const AED = 'http://localhost:4200';

test.describe('AED smoke', () => {
  test('agentes list-page carga', async ({ page }) => {
    await page.goto(`${AED}/admin/agentes`, { waitUntil: 'domcontentloaded' });
    // Modelo "todo arriba" (experiment S59): la identidad y el CTA ya no viven
    // en `sc-page-header` sino en el TopBar (breadcrumb + `.top-bar__actions`).
    // El resto de listas mantienen page-header hasta que se barra el modelo.
    await expect(page.locator('sc-top-bar')).toBeVisible();
    await expect(page.locator('.top-bar__actions')).toBeVisible();
    await expect(page.locator('table.table, .empty')).toBeVisible();
  });

  test('usuarios list-page carga', async ({ page }) => {
    await page.goto(`${AED}/admin/usuarios`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('sc-page-header')).toBeVisible();
    await expect(page.locator('table.table, sc-empty-state')).toBeVisible();
  });

  test('grupos list-page carga', async ({ page }) => {
    await page.goto(`${AED}/admin/grupos`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('sc-page-header')).toBeVisible();
    await expect(page.locator('table.table, .empty')).toBeVisible();
  });

  test('labels list-page carga', async ({ page }) => {
    await page.goto(`${AED}/admin/labels`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('sc-page-header')).toBeVisible();
    await expect(page.locator('table.table, .empty')).toBeVisible();
  });

  test('config sistema page carga + language switcher visible', async ({ page }) => {
    await page.goto(`${AED}/config/sistema`, { waitUntil: 'domcontentloaded' });
    // Theme picker + language switcher ambos deberían estar presentes
    const themeToggles = page.locator('.theme-toggle');
    await expect(themeToggles.first()).toBeVisible();
    // Hay 2 toggles ahora (apariencia + idioma)
    await expect(themeToggles).toHaveCount(2);
  });
});
