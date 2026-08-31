import { lstat } from 'node:fs/promises';
import { type Server } from 'node:http';
import { resolve } from 'node:path';
import { test, expect } from '@playwright/test';
import { createStaticServer } from '../../scripts/serve-built-site.mjs';

const distRoot = resolve(process.cwd(), 'dist');

let server: Server;
let origin = '';

test.beforeAll(async () => {
  const stat = await lstat(distRoot).catch(() => null);
  if (!stat?.isDirectory()) throw new Error('dist/ is required; run npm run build before browser tests');
  server = createStaticServer(distRoot);
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('static test server did not bind a TCP port');
  origin = `http://127.0.0.1:${address.port}`;
});

test.afterAll(async () => {
  await new Promise<void>((done, fail) => server.close((error) => error ? fail(error) : done()));
});

test('built homepage renders its hero, primary navigation, and local hero image', async ({ page }) => {
  await page.goto(`${origin}/`);

  await expect(page.locator('#home-heading')).toContainText('TIẾNG ANH VỮNG VÀNG');
  await expect(page.getByRole('navigation', { name: 'Điều hướng chính' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Điều hướng chính' }).getByRole('link', { name: 'Khóa học' })).toHaveAttribute('href', 'courses.html');
  await expect(page.locator('.home-hero img').first()).toEvaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0);
});

test('built courses page opens a result modal with its first result image', async ({ page }) => {
  await page.goto(`${origin}/courses.html`);
  await page.locator('[data-results="ket"]').click();

  await expect(page.locator('#results-modal')).toHaveAttribute('aria-hidden', 'false');
  await expect(page.locator('#results-modal .results-main__image')).toEvaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0);
});

test('built page preserves the Zalo safe-new-tab target', async ({ page }) => {
  await page.goto(`${origin}/`);

  const zalo = page.getByRole('link', { name: 'Zalo của trung tâm' });
  await expect(zalo).toHaveAttribute('href', 'https://zalo.me/1175234011658712481');
  await expect(zalo).toHaveAttribute('target', '_blank');
  await expect(zalo).toHaveAttribute('rel', /noopener/);
});

test('built mobile navigation opens and closes at a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${origin}/`);

  const toggle = page.getByRole('button', { name: 'Mở menu' });
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#main-nav')).toHaveClass(/open/);
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('built homepage has no browser console or page errors', async ({ page }) => {
  const failures: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') failures.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => failures.push(`page: ${error.message}`));

  await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
  expect(failures).toEqual([]);
});

test('production-like static server returns 404 for an unknown path', async ({ request }) => {
  const response = await request.get(`${origin}/not-a-real-page.html`);
  expect(response.status()).toBe(404);
});
