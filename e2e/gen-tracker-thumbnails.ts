/* eslint-disable */
/**
 * Generador de thumbnails contextuales del tracker home ds-docs.
 *
 * Cada uno de los 34 componentes SCDS se captura en su pantalla
 * representativa AED/Memory (no en la gallery aislada del ds-docs).
 * Refleja la audiencia "equipo de diseño": evidencia visual del DS
 * usándose en producto real.
 *
 * Output: 34 PNG (1440×720, ratio 2:1 → thumbnail 160×80) en
 * `packages/design-system/docs/components/screenshots/`.
 *
 * Para componentes sin consumer real (confirm-host, toast) →
 * placeholder PNG con texto explicativo.
 *
 * Usage (requiere dev servers up):
 *   npm run start:supervisor -- --no-hmr  (puerto 4200)
 *   npm run start:ds-docs -- --no-hmr     (puerto 4201)
 *   npx tsx e2e/gen-tracker-thumbnails.ts
 */

import { chromium, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

interface Entry {
  /** File name (without extension) — matches the slug used by the tracker. */
  readonly name: string;
  /** Absolute URL (supervisor 4200 o ds-docs 4201). */
  readonly url: string;
  /** Wait for this selector before triggering / capturing. */
  readonly waitFor?: string;
  /** Optional interaction step before screenshot (click trigger, hover, etc). */
  readonly trigger?: (page: Page) => Promise<void>;
  /** CSS selector cuyo bounding box centra el crop. Si omitido, viewport entero. */
  readonly cropSelector?: string;
  /** Padding extra alrededor del bbox (px) para dar contexto. */
  readonly padding?: number;
  /** Si true → genera placeholder PNG en lugar de screenshot. */
  readonly placeholder?: boolean;
  /** Texto del placeholder cuando placeholder=true. */
  readonly placeholderHint?: string;
}

const SUPERVISOR = 'http://localhost:4200';
const DS_DOCS = 'http://localhost:4201';

const ENTRIES: readonly Entry[] = [
  // ─── Page-level chrome (visible al cargar) ───────────────────────────
  {
    name: 'page-header',
    url: `${SUPERVISOR}/admin/agentes`,
    waitFor: 'sc-page-header',
    cropSelector: 'sc-page-header',
    padding: 40,
  },
  {
    name: 'button',
    url: `${SUPERVISOR}/admin/agentes`,
    waitFor: 'sc-page-header p-button',
    cropSelector: 'sc-page-header',
    padding: 40,
  },
  {
    name: 'search',
    url: `${SUPERVISOR}/admin/agentes`,
    waitFor: 'sc-search',
    cropSelector: '.page__action-bar',
    padding: 24,
  },
  {
    name: 'column-selector',
    url: `${SUPERVISOR}/admin/agentes`,
    waitFor: 'sc-column-selector',
    cropSelector: '.page__action-bar',
    padding: 24,
  },
  {
    name: 'illustrated-avatar',
    url: `${SUPERVISOR}/admin/agentes`,
    waitFor: 'sc-illustrated-avatar',
    cropSelector: 'table.table tbody tr:nth-child(1)',
    padding: 24,
  },
  {
    name: 'label-chip',
    url: `${SUPERVISOR}/admin/etiquetas`,
    waitFor: 'sc-label-chip',
    cropSelector: 'table.table tbody tr:nth-child(1)',
    padding: 24,
  },
  {
    name: 'checkbox',
    url: `${SUPERVISOR}/admin/agentes`,
    waitFor: 'table.table',
    cropSelector: 'table.table thead',
    padding: 24,
  },
  {
    name: 'tabs',
    // <p-tabs> = Custom-preset SCDS, 0 consumers AED hoy (doc 06-tabs.md
    // dice "esperando caso"). Fallback a la gallery ds-docs.
    url: `${DS_DOCS}/components/tabs`,
    waitFor: 'p-tabs, .p-tabs',
    cropSelector: 'p-tabs, .p-tabs',
    padding: 32,
  },

  // ─── Form chrome ──────────────────────────────────────────────────────
  {
    name: 'sticky-form-header',
    url: `${SUPERVISOR}/admin/agentes/editar/1`,
    waitFor: 'sc-sticky-form-header',
    cropSelector: 'sc-sticky-form-header',
    padding: 16,
  },
  {
    name: 'photo-upload',
    url: `${SUPERVISOR}/admin/agentes/editar/1`,
    waitFor: 'sc-photo-upload',
    cropSelector: 'sc-photo-upload',
    padding: 80,
  },
  {
    name: 'form-section-nav',
    url: `${SUPERVISOR}/admin/agentes/editar/1`,
    waitFor: 'sc-form-section-nav',
    cropSelector: 'sc-form-section-nav',
    padding: 24,
  },
  {
    name: 'section-card',
    url: `${SUPERVISOR}/admin/agentes/editar/1`,
    waitFor: 'sc-section-card',
    cropSelector: 'sc-section-card:nth-of-type(1)',
    padding: 24,
  },
  {
    name: 'inputtext',
    url: `${SUPERVISOR}/admin/agentes/editar/1`,
    waitFor: 'sc-form-section-nav',
    trigger: async (page) => {
      // En edit mode la sección Identificación está al final del nav.
      // Click para activar @switch a 'agent-section-identity' donde viven
      // los inputtext/select del form.
      await page.locator('sc-form-section-nav a:has-text("Identificación")').click().catch(() => {});
      await page.waitForSelector('sc-inputtext', { timeout: 4_000 }).catch(() => {});
      await page.waitForTimeout(200);
    },
    cropSelector: 'sc-inputtext',
    padding: 40,
  },
  {
    name: 'select',
    url: `${SUPERVISOR}/admin/agentes/editar/1`,
    waitFor: 'sc-form-section-nav',
    trigger: async (page) => {
      await page.locator('sc-form-section-nav a:has-text("Identificación")').click().catch(() => {});
      await page.waitForSelector('sc-select', { timeout: 4_000 }).catch(() => {});
      await page.waitForTimeout(200);
    },
    cropSelector: 'sc-select',
    padding: 40,
  },
  {
    name: 'toggleswitch',
    url: `${SUPERVISOR}/admin/agentes/editar/1`,
    waitFor: 'sc-toggleswitch',
    cropSelector: 'sc-toggleswitch:nth-of-type(1)',
    padding: 80,
  },
  {
    name: 'form-danger-zone',
    url: `${SUPERVISOR}/admin/agentes/editar/1`,
    waitFor: 'sc-form-section-nav',
    trigger: async (page) => {
      // Danger-zone vive AL FINAL de la sección Identificación (@switch case).
      // Click nav → render sección → scroll al danger-zone.
      await page.locator('sc-form-section-nav a:has-text("Identificación")').click().catch(() => {});
      await page.waitForSelector('sc-form-danger-zone', { timeout: 4_000 }).catch(() => {});
      await page.locator('sc-form-danger-zone').scrollIntoViewIfNeeded({ timeout: 4_000 }).catch(() => {});
      await page.waitForTimeout(400);
    },
    cropSelector: 'sc-form-danger-zone',
    padding: 32,
  },

  // ─── Config (inputs numéricos / grupos) ───────────────────────────────
  {
    name: 'inputnumber',
    url: `${SUPERVISOR}/config/aed/grupos`,
    waitFor: 'sc-inputnumber',
    cropSelector: 'sc-inputnumber',
    padding: 40,
  },
  {
    name: 'inputgroup',
    url: `${SUPERVISOR}/config/aed/servicio`,
    waitFor: 'sc-inputgroup',
    cropSelector: 'sc-inputgroup',
    padding: 24,
  },

  // ─── Memory (datepicker / multiselect / dialog / tooltip) ─────────────
  {
    name: 'datepicker',
    url: `${SUPERVISOR}/conversaciones`,
    waitFor: 'sc-datepicker',
    cropSelector: 'sc-datepicker',
    padding: 24,
  },
  {
    name: 'multiselect',
    url: `${SUPERVISOR}/conversaciones`,
    waitFor: 'sc-multiselect',
    cropSelector: 'sc-multiselect:nth-of-type(1)',
    padding: 24,
  },
  {
    name: 'tooltip',
    url: `${SUPERVISOR}/conversaciones`,
    // pTooltip vive en el sidebar collapsed AED (icons rail). Abrir un
    // tooltip del nav siempre funciona porque el sidebar está montado.
    waitFor: '.sidebar a, .sidebar [pTooltip], aside [pTooltip]',
    trigger: async (page) => {
      // Forzar sidebar collapsed (toggle) para que aparezcan tooltips de iconos
      await page.evaluate(() => {
        const sidebar = document.querySelector('aside, .sidebar');
        if (sidebar) sidebar.classList.add('collapsed');
      });
      await page.waitForTimeout(300);
      const target = page
        .locator('aside [pTooltip], .sidebar [pTooltip], aside a[ng-reflect-p-tooltip]')
        .first();
      await target.hover().catch(() => {});
      await page.waitForTimeout(800);
    },
    cropSelector: '.p-tooltip',
    padding: 32,
  },

  // ─── Triggers manuales (popovers, modales, bulk) ─────────────────────
  {
    name: 'group-popover',
    url: `${SUPERVISOR}/admin/agentes`,
    waitFor: 'sc-group-popover',
    trigger: async (page) => {
      // Click sobre la celda Grupos del primer agente
      const target = page.locator('sc-group-popover button, sc-group-popover [role="button"]').first();
      await target.click().catch(() => {});
      await page.waitForTimeout(400);
    },
    cropSelector: '.p-popover, sc-group-popover',
    padding: 24,
  },
  {
    name: 'command-palette',
    url: `${SUPERVISOR}/admin/agentes`,
    // sc-command-palette LIVE en app shell pero el `.palette` overlay
    // solo aparece tras ⌘K. waitFor un elemento estático del shell.
    waitFor: 'sc-page-header',
    trigger: async (page) => {
      await page.keyboard.press('Meta+k');
      await page.waitForSelector('.palette', { timeout: 4_000 }).catch(() => {});
      await page.waitForTimeout(200);
    },
    cropSelector: '.palette',
    padding: 24,
  },
  {
    name: 'keyboard-shortcuts',
    url: `${SUPERVISOR}/admin/agentes`,
    // Mismo patrón: sheet solo aparece tras Shift+?
    waitFor: 'sc-page-header',
    trigger: async (page) => {
      await page.keyboard.press('Shift+?');
      await page.waitForSelector('.kbd-sheet', { timeout: 4_000 }).catch(() => {});
      await page.waitForTimeout(200);
    },
    cropSelector: '.kbd-sheet',
    padding: 24,
  },
  {
    name: 'dialog',
    url: `${SUPERVISOR}/admin/agentes/editar/1`,
    waitFor: 'sc-form-section-nav',
    trigger: async (page) => {
      await page.locator('sc-form-section-nav a:has-text("Identificación")').click().catch(() => {});
      await page.waitForSelector('sc-form-danger-zone', { timeout: 4_000 }).catch(() => {});
      await page.locator('sc-form-danger-zone').scrollIntoViewIfNeeded({ timeout: 4_000 }).catch(() => {});
      await page.locator('sc-form-danger-zone p-button button').first().click({ timeout: 4_000 }).catch(() => {});
      await page.waitForSelector('sc-delete-entity-dialog, .p-dialog', { timeout: 4_000 }).catch(() => {});
      await page.waitForTimeout(400);
    },
    cropSelector: 'sc-delete-entity-dialog, .p-dialog',
    padding: 24,
  },
  {
    name: 'delete-entity-dialog',
    url: `${SUPERVISOR}/admin/agentes/editar/1`,
    waitFor: 'sc-form-section-nav',
    trigger: async (page) => {
      await page.locator('sc-form-section-nav a:has-text("Identificación")').click().catch(() => {});
      await page.waitForSelector('sc-form-danger-zone', { timeout: 4_000 }).catch(() => {});
      await page.locator('sc-form-danger-zone').scrollIntoViewIfNeeded({ timeout: 4_000 }).catch(() => {});
      await page.locator('sc-form-danger-zone p-button button').first().click({ timeout: 4_000 }).catch(() => {});
      await page.waitForSelector('sc-delete-entity-dialog', { timeout: 4_000 }).catch(() => {});
      await page.waitForTimeout(400);
    },
    cropSelector: 'sc-delete-entity-dialog',
    padding: 24,
  },
  {
    name: 'bulk-action-bar',
    url: `${SUPERVISOR}/admin/agentes`,
    waitFor: 'table.table',
    trigger: async (page) => {
      // Click en la primera fila para seleccionarla → aparece bulk-action-bar
      const firstRowCheckbox = page.locator('table.table tbody tr:nth-child(1) input[type="checkbox"]').first();
      await firstRowCheckbox.check().catch(async () => {
        // Fallback: click en la fila si no hay checkbox
        await page.locator('table.table tbody tr:nth-child(1)').click().catch(() => {});
      });
      await page.waitForTimeout(400);
    },
    cropSelector: 'sc-bulk-action-bar',
    padding: 24,
  },
  {
    name: 'bulk-edit-menu',
    url: `${SUPERVISOR}/admin/agentes`,
    waitFor: 'table.table',
    trigger: async (page) => {
      const firstRowCheckbox = page.locator('table.table tbody tr:nth-child(1) input[type="checkbox"]').first();
      await firstRowCheckbox.check().catch(() => {});
      await page.waitForTimeout(300);
      // Abrir el menú de edición masiva
      await page.locator('sc-bulk-edit-menu button').first().click().catch(() => {});
      await page.waitForTimeout(400);
    },
    cropSelector: 'sc-bulk-edit-menu, .p-popover',
    padding: 24,
  },
  {
    name: 'impact-preview-dialog',
    url: `${SUPERVISOR}/admin/agentes`,
    waitFor: 'table.table',
    trigger: async (page) => {
      // Flujo: select rows → bulk edit → preview dialog
      const checkboxes = page.locator('table.table tbody tr input[type="checkbox"]');
      const count = await checkboxes.count();
      const max = Math.min(count, 3);
      for (let i = 0; i < max; i++) {
        await checkboxes.nth(i).check().catch(() => {});
      }
      await page.waitForTimeout(300);
      await page.locator('sc-bulk-edit-menu button').first().click().catch(() => {});
      await page.waitForTimeout(400);
      // Pick a field
      await page.locator('.p-popover button, .p-popover [role="menuitem"]').first().click().catch(() => {});
      await page.waitForTimeout(400);
      // Submit to open impact preview (depende del flow exacto)
      await page.locator('.p-popover button:has-text("Aplicar"), .p-popover button:has-text("Continuar")').first().click().catch(() => {});
      await page.waitForTimeout(600);
    },
    cropSelector: 'sc-impact-preview-dialog .sc-dialog',
    padding: 24,
  },
  {
    name: 'inline-rename-cell',
    url: `${SUPERVISOR}/admin/agentes`,
    waitFor: 'table.table',
    trigger: async (page) => {
      // Click derecho para abrir context menu → Duplicar (que dispara inline rename)
      // Fallback: ir directo a un seedFromId que active rename inline en lista
      await page.goto(`${SUPERVISOR}/admin/agentes?renameTargetId=1`).catch(() => {});
      await page.waitForTimeout(400);
    },
    cropSelector: 'sc-inline-rename-cell',
    padding: 40,
    // Fallback: si no se logra disparar el inline-rename, placeholder
  },

  // ─── Color picker (etiqueta editar) ──────────────────────────────────
  {
    name: 'color-dot-picker',
    url: `${SUPERVISOR}/admin/etiquetas`,
    waitFor: 'table.table',
    trigger: async (page) => {
      // Click en una etiqueta para editar (probable abre panel inline)
      await page.locator('table.table tbody tr:nth-child(1)').click();
      await page.waitForTimeout(500);
    },
    cropSelector: 'sc-color-dot-picker',
    padding: 40,
  },

  // ─── Empty state (sin datos) ─────────────────────────────────────────
  {
    name: 'empty-state',
    url: `${SUPERVISOR}/admin/agentes`,
    waitFor: 'table.table',
    trigger: async (page) => {
      // Filtrar para forzar empty state (search debounce ~300ms)
      await page.locator('sc-search input').first().fill('zzzz-not-found-xxxx');
      await page.waitForSelector('sc-empty-state', { timeout: 4_000 }).catch(() => {});
      await page.waitForTimeout(400);
    },
    cropSelector: 'sc-empty-state',
    padding: 40,
  },

  // ─── Sin consumer real → placeholders ────────────────────────────────
  {
    name: 'confirm-host',
    placeholder: true,
    placeholderHint: 'Componente host invisible: vive en app-root, sin chrome visible propio.',
    url: '',
  },
  {
    name: 'toast',
    placeholder: true,
    placeholderHint: 'Notificación efímera (3s). Captura visual en la gallery del DS.',
    url: '',
  },
];

const OUT_DIR = resolve(
  __dirname,
  '..',
  'packages',
  'design-system',
  'docs',
  'components',
  'screenshots',
);

const CLIP_WIDTH = 1440;
const CLIP_HEIGHT = 720;

/**
 * Calcula el rect de clip 2:1 centrado en el bounding box del selector.
 * Si el componente es pequeño, expande con padding para dar contexto.
 * Si excede el viewport, recorta al viewport.
 */
async function computeCropRect(
  page: Page,
  selector: string,
  padding: number,
): Promise<{ x: number; y: number; width: number; height: number } | null> {
  const bbox = await page
    .locator(selector)
    .first()
    .boundingBox()
    .catch(() => null);
  if (!bbox) return null;

  const viewport = page.viewportSize();
  if (!viewport) return null;

  // Centro del componente
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;

  // Tamaño deseado: bbox + padding, manteniendo ratio 2:1
  const desiredW = Math.max(bbox.width + padding * 2, 720);
  const desiredH = Math.max(bbox.height + padding * 2, desiredW / 2);
  let width = desiredW;
  let height = desiredH;
  if (width / height > 2) {
    height = width / 2;
  } else {
    width = height * 2;
  }

  // Centrar y clampear al viewport
  let x = cx - width / 2;
  let y = cy - height / 2;
  if (x < 0) x = 0;
  if (y < 0) y = 0;
  if (x + width > viewport.width) x = viewport.width - width;
  if (y + height > viewport.height) y = viewport.height - height;
  if (width > viewport.width) width = viewport.width;
  if (height > viewport.height) height = viewport.height;

  return { x, y, width, height };
}

async function capture(page: Page, entry: Entry): Promise<void> {
  if (entry.placeholder) {
    await renderPlaceholder(page, entry);
    return;
  }

  console.log(`→ ${entry.name}: ${entry.url}`);
  try {
    await page.goto(entry.url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  } catch (err) {
    console.warn(`  (goto warn: ${err instanceof Error ? err.message.split('\n')[0] : err})`);
  }

  if (entry.waitFor) {
    await page.waitForSelector(entry.waitFor, { timeout: 8_000 }).catch(() => {
      console.warn(`  (waitFor "${entry.waitFor}" timeout — capturando igual)`);
    });
  }
  await page.waitForTimeout(800);

  if (entry.trigger) {
    try {
      await entry.trigger(page);
    } catch (err) {
      console.warn(`  (trigger warn: ${err instanceof Error ? err.message : err})`);
    }
  }

  const path = resolve(OUT_DIR, `${entry.name}.png`);
  if (entry.cropSelector) {
    const rect = await computeCropRect(page, entry.cropSelector, entry.padding ?? 24);
    if (rect) {
      await page.screenshot({ path, clip: rect });
      console.log(`  ✓ ${entry.name}.png (clip ${Math.round(rect.width)}×${Math.round(rect.height)})`);
      return;
    }
    console.warn(`  (selector "${entry.cropSelector}" not found — fullPage fallback)`);
  }
  // Fallback: screenshot del viewport entero a 1440×720
  await page.screenshot({ path, clip: { x: 0, y: 0, width: CLIP_WIDTH, height: CLIP_HEIGHT } });
  console.log(`  ✓ ${entry.name}.png (viewport clip)`);
}

async function renderPlaceholder(page: Page, entry: Entry): Promise<void> {
  console.log(`→ ${entry.name}: [placeholder]`);
  const html = `<!DOCTYPE html><html><head><style>
    body { margin:0; font-family: 'Inter', system-ui, sans-serif; }
    .ph { width: 1440px; height: 720px;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      background: linear-gradient(135deg, #f7f8fa 0%, #eceff3 100%);
      color: #8f97a3; text-align: center;
      border: 2px dashed #c6ccd6; box-sizing: border-box; }
    h1 { font-size: 56px; font-weight: 600; color: #4f5663;
      margin: 0 0 24px; letter-spacing: -0.02em; }
    p { font-size: 28px; color: #8f97a3; max-width: 900px;
      line-height: 1.4; margin: 0; }
    .hint { margin-top: 48px; font-size: 18px; color: #aeb6c2;
      text-transform: uppercase; letter-spacing: 0.1em; }
  </style></head><body><div class="ph">
    <h1>Sin consumer visible</h1>
    <p>${entry.placeholderHint ?? 'Componente sin captura natural — ver gallery DS.'}</p>
    <p class="hint">SCDS · ${entry.name}</p>
  </div></body></html>`;
  await page.setContent(html, { waitUntil: 'load' });
  const path = resolve(OUT_DIR, `${entry.name}.png`);
  await page.screenshot({ path, clip: { x: 0, y: 0, width: CLIP_WIDTH, height: CLIP_HEIGHT } });
  console.log(`  ✓ ${entry.name}.png (placeholder)`);
}

async function main(): Promise<void> {
  mkdirSync(OUT_DIR, { recursive: true });
  console.log(`📸 Generando ${ENTRIES.length} thumbnails contextuales → ${OUT_DIR}`);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: CLIP_WIDTH, height: CLIP_HEIGHT },
    deviceScaleFactor: 2,
    locale: 'es-ES',
    colorScheme: 'light',
  });
  const page = await context.newPage();

  let ok = 0;
  let warn = 0;
  for (const entry of ENTRIES) {
    try {
      await capture(page, entry);
      ok++;
    } catch (err) {
      console.error(`  ✗ ${entry.name} failed:`, err instanceof Error ? err.message : err);
      warn++;
    }
  }

  await browser.close();
  console.log(`✅ Done. OK=${ok}, warn=${warn}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
