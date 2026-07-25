/**
 * Ad-hoc screenshot capture for eyeballing both editions in both themes.
 * Not part of `npm test`; run it directly when a change could move pixels.
 */
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4173';
const OUT = 'test-results/visual';

const shots = [
  { name: 'classic-light', path: '/', theme: 'light', edition: 'classic' },
  { name: 'classic-dark', path: '/', theme: 'dark', edition: 'classic' },
  { name: 'terminal-dark', path: '/v2/', theme: 'dark', edition: 'terminal' },
  { name: 'terminal-light', path: '/v2/', theme: 'light', edition: 'terminal' },
  { name: 'classic-mobile', path: '/', theme: 'light', edition: 'classic', width: 390, height: 844 }
];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();

for (const shot of shots) {
  const context = await browser.newContext({
    viewport: { width: shot.width || 1440, height: shot.height || 900 }
  });
  await context.addInitScript(
    ([theme, edition]) => {
      window.localStorage.setItem('theme', theme);
      window.localStorage.setItem('portfolioEdition', edition);
      window.sessionStorage.setItem('v2:booted', '1');
    },
    [shot.theme, shot.edition]
  );
  const page = await context.newPage();
  await page.goto(BASE + shot.path, { waitUntil: 'networkidle' });

  // Cards animate in on scroll, so walk the whole page before capturing it.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.75;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise(resolve => setTimeout(resolve, 220));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/${shot.name}.png`, fullPage: true });
  console.log(`captured ${shot.name}`);
  await context.close();
}

await browser.close();
