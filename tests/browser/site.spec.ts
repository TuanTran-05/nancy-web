import { createReadStream } from 'node:fs';
import { lstat } from 'node:fs/promises';
import { createServer, type Server } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { test, expect } from '@playwright/test';

const distRoot = resolve(process.cwd(), 'dist');
const MIME_TYPES: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

let server: Server;
let origin = '';

function isWithin(root: string, candidate: string) {
  return candidate === root || candidate.startsWith(`${root}${sep}`);
}

async function serveBuiltSite(request: Parameters<Server['emit']>[1], response: Parameters<Server['emit']>[2]) {
  const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1');
  const decodedPath = decodeURIComponent(requestUrl.pathname);
  const candidate = resolve(distRoot, `.${decodedPath === '/' ? '/index.html' : decodedPath}`);
  if (decodedPath.includes('\\') || !isWithin(distRoot, candidate)) {
    response.writeHead(404).end('Not found');
    return;
  }
  const stat = await lstat(candidate).catch(() => null);
  if (!stat?.isFile()) {
    response.writeHead(404).end('Not found');
    return;
  }
  response.writeHead(200, {
    'cache-control': 'no-store',
    'content-type': MIME_TYPES[extname(candidate).toLowerCase()] ?? 'application/octet-stream',
  });
  createReadStream(candidate).pipe(response);
}

test.beforeAll(async () => {
  const stat = await lstat(distRoot).catch(() => null);
  if (!stat?.isDirectory()) throw new Error('dist/ is required; run npm run build before browser tests');
  server = createServer((request, response) => {
    void serveBuiltSite(request, response).catch(() => response.writeHead(500).end('Internal server error'));
  });
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
