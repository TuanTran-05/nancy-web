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

  it('does not let unquoted HTML reference attributes bypass local checks', async () => {
    await fixture(async (root) => {
      await writeValidMetadata(root);
      await writeFile(join(root, 'index.html'), page(`
        <img src=missing.png alt=missing>
        <script src=http://example.test/app.js></script>
        <a href=../outside.txt>escape</a>
      `, '<meta name="description" content="fixture"><meta name="viewport" content="width=device-width"><link rel="canonical" href="https://thienuy.edu.vn/">'));

      const result = await checkStaticSite(root);

      expect(result.issues.map((entry) => entry.code)).toEqual(expect.arrayContaining([
        'LOCAL_REFERENCE_MISSING',
        'INSECURE_EXTERNAL_RESOURCE',
        'LOCAL_REFERENCE_TRAVERSAL',
      ]));
    });
  });

  it('reports duplicate unquoted HTML id attributes', async () => {
    await fixture(async (root) => {
      await writeValidMetadata(root);
      await writeFile(join(root, 'index.html'), page('<main id=duplicate></main><aside id=duplicate></aside>', '<meta name="description" content="fixture"><meta name="viewport" content="width=device-width"><link rel="canonical" href="https://thienuy.edu.vn/">'));

      const result = await checkStaticSite(root);

      expect(result.issues).toEqual(expect.arrayContaining([
        expect.objectContaining({ code: 'DUPLICATE_ID', path: 'index.html' }),
      ]));
    });
  });

  it('validates same-origin HTTPS resource paths as local files', async () => {
    await fixture(async (root) => {
      await writeValidMetadata(root);
      await writeFile(join(root, 'Asset.PNG'), 'image');
      await writeFile(join(root, 'index.html'), page(`
        <img src="https://thienuy.edu.vn/missing.png" alt="missing">
        <img src="https://thienuy.edu.vn/asset.png" alt="case mismatch">
      `, '<meta name="description" content="fixture"><meta name="viewport" content="width=device-width"><link rel="canonical" href="https://thienuy.edu.vn/">'));

      const result = await checkStaticSite(root);

      expect(result.issues.map((entry) => entry.code)).toEqual(expect.arrayContaining([
        'LOCAL_REFERENCE_MISSING',
        'LOCAL_REFERENCE_CASE_MISMATCH',
      ]));
    });
  });

  it('decodes same-origin percent-encoded local filenames before lookup', async () => {
    await fixture(async (root) => {
      await writeValidMetadata(root);
      await writeFile(join(root, 'Asset Name.png'), 'image');
      await writeFile(join(root, 'index.html'), page('<img src="https://thienuy.edu.vn/Asset%20Name.png" alt="space">', '<meta name="description" content="fixture"><meta name="viewport" content="width=device-width"><link rel="canonical" href="https://thienuy.edu.vn/">'));

      await expect(checkStaticSite(root)).resolves.toEqual({ valid: true, issues: [] });
    });
  });

  it('reports malformed HTTPS references instead of aborting validation', async () => {
    await fixture(async (root) => {
      await writeValidMetadata(root);
      await writeFile(join(root, 'index.html'), page('<img src="https://[not-an-ipv6" alt="malformed">', '<meta name="description" content="fixture"><meta name="viewport" content="width=device-width"><link rel="canonical" href="https://thienuy.edu.vn/">'));

      await expect(checkStaticSite(root)).resolves.toMatchObject({
        valid: false,
        issues: expect.arrayContaining([
          expect.objectContaining({ code: 'LOCAL_REFERENCE_INVALID', path: 'index.html' }),
        ]),
      });
    });
  });

  it('rejects literal and URL-encoded backslash traversal', async () => {
    await fixture(async (root) => {
      await writeValidMetadata(root);
      await writeFile(join(root, 'index.html'), page(`
        <a href="..\\outside.txt">literal escape</a>
        <a href="%2e%2e%5coutside.txt">encoded escape</a>
      `, '<meta name="description" content="fixture"><meta name="viewport" content="width=device-width"><link rel="canonical" href="https://thienuy.edu.vn/">'));

      const result = await checkStaticSite(root);

      expect(result.issues.filter((entry) => entry.code === 'LOCAL_REFERENCE_TRAVERSAL')).toHaveLength(2);
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

  it('rejects a valid robots sitemap directive when another sitemap directive is invalid', async () => {
    await fixture(async (root) => {
      await writeFile(join(root, 'index.html'), page('<main id="main"></main>', '<meta name="description" content="fixture"><meta name="viewport" content="width=device-width"><link rel="canonical" href="https://thienuy.edu.vn/">'));
      await writeFile(join(root, 'robots.txt'), [
        'User-agent: *',
        'Sitemap: https://thienuy.edu.vn/sitemap.xml',
        'Sitemap: http://example.test/sitemap.xml',
      ].join('\n'));
      await writeFile(join(root, 'sitemap.xml'), '<?xml version="1.0"?><urlset><url><loc>https://thienuy.edu.vn/</loc></url></urlset>');

      const result = await checkStaticSite(root);

      expect(result.issues).toEqual(expect.arrayContaining([
        expect.objectContaining({ code: 'ROBOTS_SITEMAP_INVALID' }),
      ]));
    });
  });
});
