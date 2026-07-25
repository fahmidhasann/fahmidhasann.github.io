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
/** The terminal edition plays its boot animation once per session. */
const BOOT_KEY = 'v2:booted';

/**
 * Seeds storage before any page script runs, so the first-visit edition chooser
 * and the terminal boot animation do not block the flow under test. Seeding only
 * fills in missing keys, so reloads and in-test preference changes still survive
 * navigation. Pass `boot: true` to let the boot animation play.
 */
async function visit(page, path, { edition = 'classic', theme = 'light', boot = false } = {}) {
  await page.addInitScript(
    ([key, value, themeValue, bootKey, skipBoot]) => {
      if (window.localStorage.getItem(key) === null) window.localStorage.setItem(key, value);
      if (window.localStorage.getItem('theme') === null) window.localStorage.setItem('theme', themeValue);
      if (skipBoot) window.sessionStorage.setItem(bootKey, '1');
    },
    [EDITION_KEY, edition, theme, BOOT_KEY, !boot]
  );
  await page.goto(path);
}

/** Types a command into the terminal edition's prompt and runs it. */
async function runCommand(page, command) {
  const prompt = page.locator('#prompt');
  await prompt.fill(command);
  await prompt.press('Enter');
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

  test('skip link is the first tab stop and moves focus to main content', async ({ page }) => {
    await visit(page, '/');
    await page.keyboard.press('Tab');

    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeInViewport();

    await skipLink.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();
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

    // Everything outside the navigation is inert while the menu covers the page.
    await expect(page.locator('main')).toHaveJSProperty('inert', true);

    // Tabbing all the way round must stay inside the navigation.
    for (let step = 0; step < 12; step += 1) {
      await page.keyboard.press('Tab');
      const insideNav = await page.evaluate(() =>
        Boolean(document.activeElement?.closest('.compact-nav'))
      );
      expect(insideNav).toBe(true);
    }

    await page.keyboard.press('Escape');
    await expect(menu).not.toHaveClass(/active/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
    await expect(page.locator('main')).toHaveJSProperty('inert', false);
  });

  test('opening a dialog over the mobile menu leaves a consistent focus state', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await visit(page, '/');

    await page.locator('#navToggle').click();
    await expect(page.locator('#navMenu')).toHaveClass(/active/);

    await page.keyboard.press('ControlOrMeta+k');
    await expect(page.locator('#commandPalette')).toBeVisible();
    await expect(page.locator('#navMenu')).not.toHaveClass(/active/);
    await expect(page.locator('#commandInput')).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(page.locator('#commandPalette')).toBeHidden();
    await expect(page.locator('#commandInput')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('main')).toHaveJSProperty('inert', false);
    await expect(page.locator('body')).not.toHaveClass(/scroll-locked/);
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

    await expect(page.locator('.confetti-layer')).toBeAttached();
    await expect(page.locator('.confetti-piece')).toHaveCount(100);
  });

  test('a successful contact submission confirms and clears the form', async ({ page }) => {
    await visit(page, '/');
    await page.route('**/api.web3forms.com/submit', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
    );

    await page.fill('#contact-name', 'Ada Lovelace');
    await page.fill('#contact-email', 'ada@example.com');
    await page.fill('#contact-message', 'Hello there.');
    await page.locator('.contact-submit').click();

    const result = page.locator('#formResult');
    await expect(result).toHaveText(/Message sent/);
    await expect(result).toHaveClass(/success/);
    await expect(page.locator('#contact-name')).toHaveValue('');
    await expect(page.locator('.contact-submit')).toBeEnabled();
    await expect(page.locator('.btn-loading')).toBeHidden();
    await expect(page.locator('.btn-text')).toBeVisible();
  });

  test('a failed contact submission explains the problem and keeps the draft', async ({ page }) => {
    await visit(page, '/');
    await page.route('**/api.web3forms.com/submit', route => route.abort());

    await page.fill('#contact-name', 'Ada Lovelace');
    await page.fill('#contact-email', 'ada@example.com');
    await page.fill('#contact-message', 'Hello there.');
    await page.locator('.contact-submit').click();

    const result = page.locator('#formResult');
    await expect(result).toHaveText(/Failed to send/);
    await expect(result).toHaveAttribute('role', 'alert');
    await expect(page.locator('#contact-message')).toHaveValue('Hello there.');
    await expect(page.locator('.contact-submit')).toBeEnabled();
  });
});

test.describe('terminal edition', () => {
  test('loads without script errors', async ({ page }) => {
    const errors = watchForErrors(page);
    await visit(page, '/v2/', { edition: 'terminal' });

    await expect(page.locator('#projects')).toBeAttached();
    await expect(page.locator('.proj')).toHaveCount(7);
    expect(errors).toEqual([]);
  });

  test('the boot animation holds the page, then hands it back', async ({ page }) => {
    await visit(page, '/v2/', { edition: 'terminal', boot: true });

    // Nothing behind the overlay should be reachable while it is up.
    const overlay = page.locator('.boot');
    await expect(overlay).toBeVisible();
    await expect(page.locator('.term')).toHaveJSProperty('inert', true);

    await page.keyboard.press('Enter');
    await expect(overlay).toBeHidden();
    await expect(page.locator('.term')).toHaveJSProperty('inert', false);
    await expect(page.locator('body')).not.toHaveClass(/locked/);

    // And it only plays once per session.
    await page.reload();
    await expect(page.locator('.boot')).toHaveCount(0);
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

  test('skip link is the first tab stop and moves focus to the first section', async ({ page }) => {
    await visit(page, '/v2/', { edition: 'terminal' });
    await page.keyboard.press('Tab');

    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeFocused();

    await skipLink.press('Enter');
    await expect(page.locator('#home')).toBeFocused();
  });

  test('the prompt runs a command and echoes it into the console', async ({ page }) => {
    await visit(page, '/v2/', { edition: 'terminal' });
    const console_ = page.locator('#console');
    await expect(console_).toBeHidden();

    await runCommand(page, 'help');
    await expect(console_).toBeVisible();
    await expect(page.locator('#consoleLines')).toContainText('available commands');
    await expect(page.locator('.console-line.is-echo').last()).toHaveText(/help$/);
  });

  test('an unknown command reports itself instead of failing silently', async ({ page }) => {
    const errors = watchForErrors(page);
    await visit(page, '/v2/', { edition: 'terminal' });

    await runCommand(page, 'nonsense');
    await expect(page.locator('.console-line.is-err')).toContainText('command not found: nonsense');
    expect(errors).toEqual([]);
  });

  test('Tab completes a command and the up arrow recalls history', async ({ page }) => {
    await visit(page, '/v2/', { edition: 'terminal' });
    const prompt = page.locator('#prompt');

    await prompt.fill('neo');
    await prompt.press('Tab');
    await expect(prompt).toHaveValue('neofetch');

    await prompt.press('Enter');
    await expect(prompt).toHaveValue('');
    await prompt.press('ArrowUp');
    await expect(prompt).toHaveValue('neofetch');
  });

  test('the filter command narrows the cards and matches the flag buttons', async ({ page }) => {
    await visit(page, '/v2/', { edition: 'terminal' });

    await runCommand(page, 'filter ai');
    await expect(page.locator('.proj:not([hidden])')).toHaveCount(4);
    await expect(page.locator('.flag[data-filter="ai"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#activeFlagEcho')).toHaveText('--filter=ai');
  });

  test('the theme command switches themes and clear empties the console', async ({ page }) => {
    await visit(page, '/v2/', { edition: 'terminal', theme: 'dark' });

    await runCommand(page, 'theme light');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('#themeLabel')).toHaveText('light');

    await runCommand(page, 'clear');
    await expect(page.locator('#console')).toBeHidden();
    await expect(page.locator('.console-line')).toHaveCount(0);
  });

  test('demo popup plays a project video and cleans up on Escape', async ({ page }) => {
    await visit(page, '/v2/', { edition: 'terminal' });
    const popup = page.locator('#videoPopup');

    await page.locator('.proj[data-slug="cold-outreach"] .btn-demo').click();
    await expect(popup).toBeVisible();
    await expect(page.locator('#videoPopupClose')).toBeFocused();
    // The page behind the dialog must be out of reach, not merely covered.
    await expect(page.locator('.term')).toHaveJSProperty('inert', true);

    await page.keyboard.press('Escape');
    await expect(popup).toBeHidden();
    await expect(page.locator('.term')).toHaveJSProperty('inert', false);
    expect(await page.locator('#videoPopupPlayer').getAttribute('src')).toBeNull();
  });

  test('carousel arrows scroll the track and update their disabled state', async ({ page }) => {
    await visit(page, '/v2/', { edition: 'terminal' });
    const carousel = page.locator('#projects [data-carousel]');
    const track = page.locator('#projectsList');
    const next = carousel.locator('.carousel-btn-next');
    const prev = carousel.locator('.carousel-btn-prev');

    await expect(prev).toBeDisabled();
    await next.click();
    await expect.poll(() => track.evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
    await expect(prev).toBeEnabled();
  });

  test('a successful contact submission confirms and clears the form', async ({ page }) => {
    await visit(page, '/v2/', { edition: 'terminal' });
    await page.route('**/api.web3forms.com/submit', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
    );

    await page.fill('#contact-name', 'Ada Lovelace');
    await page.fill('#contact-email', 'ada@example.com');
    await page.fill('#contact-message', 'Hello there.');
    await page.locator('.contact-submit').click();

    const result = page.locator('#formResult');
    await expect(result).toHaveText(/message sent/);
    await expect(page.locator('#contact-name')).toHaveValue('');
    await expect(page.locator('.contact-submit')).toBeEnabled();
  });
});
