import { chromium } from '@playwright/test';

const KEYS = [
  '--sc-color-gray-50',
  '--sc-color-gray-100',
  '--sc-color-gray-200',
  '--sc-color-gray-300',
  '--sc-color-gray-400',
  '--sc-color-gray-500',
  '--sc-color-gray-600',
  '--sc-color-gray-700',
  '--sc-color-gray-800',
  '--sc-color-gray-900',
  '--sc-color-gray-950',
];

const EXPECTED_AURA = {
  '--sc-color-gray-50':  '#f8fafc',
  '--sc-color-gray-100': '#f1f5f9',
  '--sc-color-gray-200': '#e2e8f0',
  '--sc-color-gray-300': '#cbd5e1',
  '--sc-color-gray-400': '#94a3b8',
  '--sc-color-gray-500': '#64748b',
  '--sc-color-gray-600': '#475569',
  '--sc-color-gray-700': '#334155',
  '--sc-color-gray-800': '#1e293b',
  '--sc-color-gray-900': '#0f172a',
  '--sc-color-gray-950': '#020617',
} as const;

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:4200/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  const computed = await page.evaluate((keys) => {
    const style = getComputedStyle(document.documentElement);
    return Object.fromEntries(keys.map(k => [k, style.getPropertyValue(k).trim()]));
  }, KEYS);

  console.log('Token                       | Computed (browser) | Expected (Aura)  | Match');
  console.log('----------------------------|--------------------|------------------|------');
  let allMatch = true;
  for (const k of KEYS) {
    const got = computed[k];
    const exp = (EXPECTED_AURA as Record<string,string>)[k];
    const ok = got.toLowerCase() === exp.toLowerCase();
    if (!ok) allMatch = false;
    console.log(`${k.padEnd(28)}| ${got.padEnd(19)}| ${exp.padEnd(17)}| ${ok ? 'YES' : 'NO'}`);
  }
  console.log('---');
  console.log(allMatch ? 'ALL MATCH — palette swap is live in the browser.' : 'MISMATCH — dev server has stale CSS.');

  await browser.close();
  process.exit(allMatch ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(2); });
