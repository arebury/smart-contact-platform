import { test, expect } from '@playwright/test';

/**
 * ds-docs smoke tests — valida que el sitio independiente carga + las
 * galleries clave funcionan (las que más visitadas son por el equipo de diseño).
 */

const DS_DOCS = 'http://localhost:4201';

test.describe('ds-docs smoke', () => {
  test('home tracker carga', async ({ page }) => {
    await page.goto(`${DS_DOCS}/`, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/SCDS|Smart Contact|Design/i);
    // Hero/header debería estar visible
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('inputtext gallery carga', async ({ page }) => {
    await page.goto(`${DS_DOCS}/components/inputtext`, { waitUntil: 'domcontentloaded' });
    // Al menos un <sc-inputtext> debe renderizar
    await expect(page.locator('sc-inputtext').first()).toBeVisible();
  });

  test('multiselect gallery carga (post-rename Bloque D)', async ({ page }) => {
    await page.goto(`${DS_DOCS}/components/multiselect`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('sc-multiselect').first()).toBeVisible();
  });

  test('dialog gallery carga (post-rename Bloque E2)', async ({ page }) => {
    await page.goto(`${DS_DOCS}/components/dialog`, { waitUntil: 'domcontentloaded' });
    // Al menos un botón que abre dialog debe estar
    await expect(page.locator('p-button').first()).toBeVisible();
  });

  test('toggleswitch gallery carga (post-rename Bloque E)', async ({ page }) => {
    await page.goto(`${DS_DOCS}/components/toggleswitch`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('sc-toggleswitch').first()).toBeVisible();
  });
});
