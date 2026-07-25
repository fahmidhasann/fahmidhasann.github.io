import { expect, test } from '@playwright/test';

/**
 * End-to-end smoke tests for both portfolio editions.
 *
 * The site has no build step, so these tests run against the static files
 * exactly as they are deployed. They intentionally assert on user-visible
 * behaviour rather than implementation details, so they keep passing when the
 * internals are refactored.
 */

/** Both editions read this key to decide whether to redirect on load. */
const EDITION_KEY = 'portfolioEdition';

/**
 * Seeds localStorage before any page script runs, so the first-visit edition
 * chooser does not block the flow under test. Seeding only fills in missing
 * keys, so reloads and in-test preference changes still survive navigation.
 */
async function visit(page, path, { edition = 'classic', theme = 'light' } = {}) {
  await page.addInitScript(
    ([key, value, themeValue]) => {
      if (window.localStorage.getItem(key) === null) window.localStorage.setItem(key, value);
      if (window.localStorage.getItem('theme') === null) window.localStorage.setItem('theme', themeValue);
    },
    [EDITION_KEY, edition, theme]
  );
  await page.goto(path);
}

/** Fails the test if the page logged an uncaught error or a console error. */
function watchForErrors(page) {
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

test.describe('classic edition', () => {
  test('loads and marks itself ready without script errors', async ({ page }) => {
    const errors = watchForErrors(page);
    await visit(page, '/');

    await expect(page.locator('html')).toHaveClass(/js-ready/);
    await expect(page.locator('#hero-heading')).toBeVisible();
    await expect(page.locator('.project-card')).toHaveCount(7);
    expect(errors).toEqual([]);
  });

  test('theme toggle flips the theme and remembers it', async ({ page }) => {
    await visit(page, '/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'light');

    await page.locator('#themeToggle').click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('#themeToggle')).toHaveAttribute('aria-pressed', 'true');

    const stored = await page.evaluate(() => window.localStorage.getItem('theme'));
    expect(stored).toBe('dark');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('project filters show only matching cards and announce the count', async ({ page }) => {
    await visit(page, '/');
    const cards = page.locator('.project-card');
    const visibleCards = page.locator('.project-card:not(.hidden-card)');

    await expect(visibleCards).toHaveCount(await cards.count());

    await page.locator('.filter-btn[data-filter="data"]').click();
    await expect(visibleCards).toHaveCount(1);
    await expect(page.locator('#projectsFilterStatus')).toHaveText('1 project shown');
    await expect(page.locator('.filter-btn[data-filter="data"]')).toHaveAttribute('aria-pressed', 'true');

    await page.locator('.filter-btn[data-filter="all"]').click();
    await expect(visibleCards).toHaveCount(await cards.count());
  });

  test('hidden cards are removed from the tab order', async ({ page }) => {
    await visit(page, '/');
    await page.locator('.filter-btn[data-filter="data"]').click();

    const hiddenLink = page.locator('#project-vocabflow a').first();
    await expect(hiddenLink).toHaveAttribute('tabindex', '-1');

    await page.locator('.filter-btn[data-filter="all"]').click();
    await expect(hiddenLink).not.toHaveAttribute('tabindex', '-1');
  });

  test('command palette opens, filters, runs a command and closes', async ({ page }) => {
    await visit(page, '/');
    const palette = page.locator('#commandPalette');

    await page.keyboard.press('ControlOrMeta+k');
    await expect(palette).toBeVisible();
    await expect(page.locator('#commandInput')).toBeFocused();

    await page.locator('#commandInput').fill('dark');
    await expect(page.locator('#command-dark-mode')).toBeVisible();
    await expect(page.locator('#command-projects')).toBeHidden();

    await page.locator('#commandInput').press('Enter');
    await expect(palette).toBeHidden();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('command palette closes on Escape and restores focus to the opener', async ({ page }) => {
    await visit(page, '/');
    const themeToggle = page.locator('#themeToggle');
    await themeToggle.focus();

    await page.keyboard.press('ControlOrMeta+k');
    await expect(page.locator('#commandPalette')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('#commandPalette')).toBeHidden();
    await expect(themeToggle).toBeFocused();
  });

  test('demo popup plays a project video and cleans up on close', async ({ page }) => {
    await visit(page, '/');
    const popup = page.locator('#videoPopup');

    await page.locator('#project-cold-outreach .btn-demo').click();
    await expect(popup).toBeVisible();
    await expect(page.locator('#videoPopupTitle')).toHaveText('AI-Powered Cold Outreach Automation');
    await expect(page.locator('#videoPopupPlayer')).toHaveJSProperty('paused', false);

    await page.locator('#videoPopupClose').click();
    await expect(popup).toBeHidden();
    const src = await page.locator('#videoPopupPlayer').getAttribute('src');
    expect(src).toBeNull();
  });

  test('carousel arrows scroll the track and update their disabled state', async ({ page }) => {
    await visit(page, '/');
    const carousel = page.locator('.projects-section .carousel');
    const track = page.locator('#projectsGrid');
    const next = carousel.locator('.carousel-btn-next');
    const prev = carousel.locator('.carousel-btn-prev');

    await expect(prev).toBeDisabled();
    await next.click();
    await expect.poll(() => track.evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
    await expect(prev).toBeEnabled();
  });

  test('mobile navigation opens, traps focus and closes on Escape', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await visit(page, '/');

    const toggle = page.locator('#navToggle');
    const menu = page.locator('#navMenu');
    await toggle.click();
    await expect(menu).toHaveClass(/active/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(menu).not.toHaveClass(/active/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });

  test('in-page navigation scrolls to the requested section', async ({ page }) => {
    await visit(page, '/');
    await page.locator('.nav-menu a[href="#contact"]').click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(200);
    await expect(page.locator('#contact')).toBeInViewport();
  });

  test('first visit offers an edition choice and remembers the answer', async ({ page }) => {
    const errors = watchForErrors(page);
    await page.goto('/');

    const chooser = page.locator('#editionChooser');
    await expect(chooser).toBeVisible();

    await page.locator('#editionChooserClassic').click();
    await expect(chooser).toBeHidden();
    expect(await page.evaluate(key => window.localStorage.getItem(key), EDITION_KEY)).toBe('classic');
    expect(errors).toEqual([]);
  });

  test('a stored terminal preference redirects to the terminal edition', async ({ page }) => {
    await visit(page, '/', { edition: 'terminal' });
    await expect(page).toHaveURL(/\/v2\/$/);
  });

  test('the konami code launches confetti', async ({ page }) => {
    await visit(page, '/');
    const sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    for (const key of sequence) await page.keyboard.press(key);

    await expect.poll(() => page.evaluate(() => document.querySelectorAll('body > div[aria-hidden="true"]').length)).toBeGreaterThan(0);
  });
});

test.describe('terminal edition', () => {
  test('loads and finishes booting without script errors', async ({ page }) => {
    const errors = watchForErrors(page);
    await visit(page, '/v2/', { edition: 'terminal' });

    await expect(page.locator('#projects')).toBeAttached();
    await expect(page.locator('.proj')).toHaveCount(7);
    expect(errors).toEqual([]);
  });

  test('theme toggle flips the theme and remembers it', async ({ page }) => {
    await visit(page, '/v2/', { edition: 'terminal', theme: 'dark' });
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await page.locator('#themeToggle').click();
    await expect(html).toHaveAttribute('data-theme', 'light');
    expect(await page.evaluate(() => window.localStorage.getItem('theme'))).toBe('light');
  });

  test('project filters narrow the visible cards', async ({ page }) => {
    await visit(page, '/v2/', { edition: 'terminal' });
    const visibleProjects = page.locator('.proj:not([hidden])');

    await page.locator('.flag[data-filter="data"]').click();
    await expect(visibleProjects).toHaveCount(1);

    await page.locator('.flag[data-filter="all"]').click();
    await expect(visibleProjects).toHaveCount(7);
  });

  test('switching to the classic edition navigates and is remembered', async ({ page }) => {
    await visit(page, '/v2/', { edition: 'terminal' });
    await page.locator('.edition-switch[data-edition="classic"]').first().click();

    await expect(page).toHaveURL(/\/$/);
    expect(await page.evaluate(key => window.localStorage.getItem(key), EDITION_KEY)).toBe('classic');
  });
});
