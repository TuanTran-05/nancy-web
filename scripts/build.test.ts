import { chmod, lstat, mkdir, mkdtemp, readFile, rm, stat, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildStaticSite } from './build.mjs';
import { createStaticManifest } from './static-manifest.mjs';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const currentPayloadManifest = new URL(
  '../docs/baselines/2026-08-29-production-payload-manifest.json',
  import.meta.url,
);

async function fixture(callback: (root: string) => Promise<void>) {
  const root = await mkdtemp(join(tmpdir(), 'thienuy-static-build-'));
  try {
    await callback(root);
  } finally {
    await rm(root, { force: true, recursive: true });
  }
}

describe('copy-only static build', () => {
  it('copies bytes and filesystem modes into a new destination', async () => {
    await fixture(async (root) => {
      const sourceDir = join(root, 'site');
      const outputDir = join(root, 'dist');
      await mkdir(join(sourceDir, 'assets'), { recursive: true });
      await writeFile(join(sourceDir, 'index.html'), 'hello\r\n');
      await writeFile(join(sourceDir, 'assets', 'app.js'), 'console.log(1);\n');
      await chmod(sourceDir, 0o750);
      await chmod(join(sourceDir, 'assets'), 0o710);
      await chmod(join(sourceDir, 'index.html'), 0o640);
      await chmod(join(sourceDir, 'assets', 'app.js'), 0o600);

      await buildStaticSite({ sourceDir, outputDir });

      expect(await createStaticManifest(outputDir)).toEqual(await createStaticManifest(sourceDir));
      expect(await readFile(join(outputDir, 'index.html'), 'utf8')).toBe('hello\r\n');
      expect((await stat(outputDir)).mode & 0o777).toBe(0o750);
      expect((await stat(join(outputDir, 'assets'))).mode & 0o777).toBe(0o710);
      expect((await stat(join(outputDir, 'index.html'))).mode & 0o777).toBe(0o640);
      expect((await stat(join(outputDir, 'assets', 'app.js'))).mode & 0o777).toBe(0o600);
    });
  });

  it('refuses to overwrite an existing destination', async () => {
    await fixture(async (root) => {
      const sourceDir = join(root, 'site');
      const outputDir = join(root, 'dist');
      await mkdir(sourceDir);
      await writeFile(join(sourceDir, 'index.html'), 'hello\n');
      await mkdir(outputDir);
      await expect(buildStaticSite({ sourceDir, outputDir })).rejects.toThrow(/destination.*exist/i);
    });
  });

  it('rejects a symlinked destination parent that resolves inside the source', async () => {
    await fixture(async (root) => {
      const sourceDir = join(root, 'site');
      const aliasParent = join(root, 'site-alias');
      const outputDir = join(aliasParent, 'dist');
      await mkdir(sourceDir);
      await writeFile(join(sourceDir, 'index.html'), 'hello\n');
      await symlink(sourceDir, aliasParent);

      await expect(buildStaticSite({ sourceDir, outputDir })).rejects.toThrow(/destination.*source|symlink/i);
      await expect(lstat(join(sourceDir, 'dist'))).rejects.toMatchObject({ code: 'ENOENT' });
      expect(await createStaticManifest(sourceDir)).toEqual({
        entry_count: 1,
        entries: [{
          path: 'index.html',
          bytes: 6,
          sha256: '5891b5b522d5df086d0ff0b110fbd9d21bb4fc7163af34d08286a2e846f6be03',
        }],
      });
    });
  });

  it('matches the committed current payload before and after the copy-only build', async () => {
    const expected = JSON.parse(await readFile(currentPayloadManifest, 'utf8'));
    await fixture(async (root) => {
      const sourceDir = join(repoRoot, 'site');
      const outputDir = join(root, 'dist');
      expect(await createStaticManifest(sourceDir)).toEqual(expected);
      await buildStaticSite({ sourceDir, outputDir });
      expect(await createStaticManifest(outputDir)).toEqual(expected);
    });
  });
});
