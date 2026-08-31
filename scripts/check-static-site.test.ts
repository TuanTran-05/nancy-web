import { execFile } from 'node:child_process';
import { link, mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';
import { checkStaticSite } from './check-static-site.mjs';

const execFileAsync = promisify(execFile);

async function fixture(callback: (root: string) => Promise<void>) {
  const root = await mkdtemp(join(tmpdir(), 'thienuy-static-check-'));
  try {
    await callback(root);
  } finally {
    await rm(root, { force: true, recursive: true });
  }
}

function page(body: string, head = '') {
  return `<!doctype html><html lang="vi"><head>${head}</head><body>${body}</body></html>`;
}

async function writeValidMetadata(root: string) {
  await writeFile(join(root, 'robots.txt'), 'User-agent: *\nSitemap: https://thienuy.edu.vn/sitemap.xml\n');
  await writeFile(join(root, 'sitemap.xml'), '<?xml version="1.0"?><urlset><url><loc>https://thienuy.edu.vn/</loc></url></urlset>');
}

describe('static site integrity check', () => {
  it('reports stable codes for unsafe nodes and local-reference integrity failures', async () => {
    await fixture(async (root) => {
      await writeValidMetadata(root);
      await writeFile(join(root, 'Asset.PNG'), 'image');
      await writeFile(join(root, 'outside.txt'), 'outside');
      await writeFile(join(root, 'index.html'), page(`
        <img src="missing.png" alt="">
        <img src="asset.png" alt="">
        <a href="%2e%2e/outside.txt">escape</a>
        <a href="#absent">fragment</a>
        <div id="twice"></div><p id="twice"></p>
        <script src="http://example.test/app.js"></script>
      `, '<link rel="canonical" href="https://not-thienuy.test/">'));
      await symlink(join(root, 'outside.txt'), join(root, 'linked.txt'));
      await link(join(root, 'outside.txt'), join(root, 'hard-linked.txt'));

      const result = await checkStaticSite(root);

      expect(result.valid).toBe(false);
      expect(result.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
        'NODE_SYMLINK',
        'NODE_HARDLINK',
        'LOCAL_REFERENCE_MISSING',
        'LOCAL_REFERENCE_CASE_MISMATCH',
        'LOCAL_REFERENCE_TRAVERSAL',
        'FRAGMENT_MISSING',
        'DUPLICATE_ID',
        'INSECURE_EXTERNAL_RESOURCE',
        'CANONICAL_INVALID',
        'SEO_DESCRIPTION_MISSING',
      ]));
    });
  });

  it('reports a FIFO as a special node without opening it', async () => {
    await fixture(async (root) => {
      await writeValidMetadata(root);
      await writeFile(join(root, 'index.html'), page('<main id="main"></main>', '<meta name="description" content="fixture"><meta name="viewport" content="width=device-width"><link rel="canonical" href="https://thienuy.edu.vn/">'));
      await execFileAsync('mkfifo', [join(root, 'events.pipe')]);

      const result = await checkStaticSite(root);

      expect(result.issues).toEqual(expect.arrayContaining([
        expect.objectContaining({ code: 'NODE_SPECIAL', path: 'events.pipe' }),
      ]));
    });
  });

  it('rejects insecure CSS and JavaScript resource references without fetching them', async () => {
    await fixture(async (root) => {
      await writeValidMetadata(root);
      await writeFile(join(root, 'index.html'), page('<link rel="stylesheet" href="styles.css"><script src="app.js"></script>'));
      await writeFile(join(root, 'styles.css'), '@import "http://example.test/fonts.css"; .hero { background: url(../outside.png); }');
      await writeFile(join(root, 'app.js'), 'const asset = new URL("http://example.test/app.js", import.meta.url);');

      const result = await checkStaticSite(root);

      expect(result.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
        'INSECURE_EXTERNAL_RESOURCE',
        'LOCAL_REFERENCE_TRAVERSAL',
      ]));
    });
  });

  it('requires the canonical robots sitemap and canonical sitemap URLs', async () => {
    await fixture(async (root) => {
      await writeFile(join(root, 'index.html'), page('<main id="main"></main>', '<link rel="canonical" href="https://thienuy.edu.vn/">'));
      await writeFile(join(root, 'robots.txt'), 'User-agent: *\nSitemap: http://thienuy.edu.vn/sitemap.xml\n');
      await writeFile(join(root, 'sitemap.xml'), '<?xml version="1.0"?><urlset><url><loc>https://example.test/</loc></url></urlset>');

      const result = await checkStaticSite(root);

      expect(result.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
        'ROBOTS_SITEMAP_INVALID',
        'SITEMAP_URL_INVALID',
      ]));
    });
  });
});
