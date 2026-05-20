import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright cross-app smoke tests.
 *
 * Arranca dos dev servers en paralelo (supervisor + ds-docs) y corre los
 * smoke tests que validan que las rutas principales cargan sin errores.
 *
 * Ejecutar localmente:
 *   npm run e2e          // ejecuta todos los smoke tests
 *   npm run e2e:headed   // con browser visible para debug
 *   npm run e2e:ui       // UI mode interactivo
 *
 * Detalles operativos:
 * - `--no-hmr` en `ng serve` es REQUERIDO en Angular 21 de este repo
 *   (sin él Vite no enlaza puerto y Playwright timeout). Ver memoria
 *   `reference_dev_server_no_hmr.md`.
 * - `waitUntil: 'domcontentloaded'` en page.goto() es REQUERIDO en
 *   Angular 21 + Vite (sin él los wait 'networkidle'/'load' nunca
 *   resuelven por el HMR socket activo). Mismo motivo.
 * - Webserver `reuseExistingServer: !process.env.CI` permite dev local
 *   con servers ya arrancados (Rafa flow); en CI siempre se arrancan
 *   fresh.
 */

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',

  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      command: 'npm run start:supervisor -- --no-hmr --port 4200',
      port: 4200,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'npm run start:ds-docs -- --no-hmr --port 4201',
      port: 4201,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
