import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { expect, test } from '@playwright/test';

/**
 * The Content-Security-Policy lives in vercel.json, so it is not applied by the
 * local static server and a mistake in it would only show up in production.
 * These tests pin the two halves of that risk:
 *
 *  1. the inline-script hashes in the policy still match the inline scripts;
 *  2. loading each edition under the real policy produces no violations.
 */

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const vercelConfig = JSON.parse(readFileSync(join(repoRoot, 'vercel.json'), 'utf8'));

const policy = vercelConfig.headers
  .flatMap(entry => entry.headers)
  .find(header => header.key === 'Content-Security-Policy')?.value;

/** Every inline <script> in a page, in document order. */
function inlineScripts(htmlPath) {
  const html = readFileSync(join(repoRoot, htmlPath), 'utf8');
  return [...html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(match => match[1]);
}

function cspHash(source) {
  return `sha256-${createHash('sha256').update(source).digest('base64')}`;
}

test.describe('content security policy', () => {
  test('the policy is present and locks down the dangerous directives', () => {
    expect(policy, 'vercel.json should define a Content-Security-Policy').toBeTruthy();
    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("base-uri 'self'");
    expect(policy).not.toContain("'unsafe-eval'");
    expect(policy, "inline scripts are allowed by hash, never wholesale").not.toContain("'unsafe-inline'");
  });

  test('every inline script is allowlisted by hash', () => {
    const sources = [...inlineScripts('index.html'), ...inlineScripts('v2/index.html')];
    expect(sources.length).toBeGreaterThan(0);

    for (const source of sources) {
      expect(
        policy,
        `An inline script is not allowlisted. Add ${cspHash(source)} to script-src in vercel.json.`
      ).toContain(cspHash(source));
    }
  });

  for (const [name, path] of [['classic', '/'], ['terminal', '/v2/']]) {
    test(`the ${name} edition loads under the policy without violations`, async ({ page }) => {
      const violations = [];
      page.on('console', message => {
        if (message.type() === 'error' && /Content Security Policy/i.test(message.text())) {
          violations.push(message.text());
        }
      });

      // Apply the production header to the document response.
      await page.route(/127\.0\.0\.1.*(\/|\/v2\/)$/, async route => {
        const response = await route.fetch();
        await route.fulfill({
          response,
          headers: { ...response.headers(), 'content-security-policy': policy }
        });
      });

      await page.addInitScript(edition => {
        window.localStorage.setItem('portfolioEdition', edition);
      }, name === 'classic' ? 'classic' : 'terminal');

      await page.goto(path);
      await expect(page.locator('h1')).toBeAttached();
      await page.waitForTimeout(1500);

      expect(violations, violations.join('\n')).toEqual([]);
    });
  }
});
