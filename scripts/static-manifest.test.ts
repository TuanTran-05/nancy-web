import { link, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';
import { createStaticManifest } from './static-manifest.mjs';

const execFileAsync = promisify(execFile);
const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const currentPayloadManifest = new URL(
  '../docs/baselines/2026-08-29-production-payload-manifest.json',
  import.meta.url,
);
const historicalSeedManifest = new URL(
  '../docs/baselines/2026-08-29-production-seed.json',
  import.meta.url,
);
const historicalSeedRelease = '/srv/thienuy-site/releases/20260830-041108-9da123e';
const historicalSeedTag = 'production-seed-20260830-041108-9da123e';

async function fixture(callback: (root: string) => Promise<void>) {
  const root = await mkdtemp(join(tmpdir(), 'thienuy-static-manifest-'));
  try {
    await callback(root);
  } finally {
    await rm(root, { force: true, recursive: true });
  }
}

describe('static payload manifest', () => {
  it('is sorted, content-addressed and contains no absolute paths', async () => {
    const result = await createStaticManifest('site');
    expect(result.entries.map((entry) => entry.path)).toEqual(
      [...result.entries.map((entry) => entry.path)].sort(),
    );
    expect(result.entries.every((entry) => /^[0-9a-f]{64}$/.test(entry.sha256))).toBe(true);
    expect(JSON.stringify(result)).not.toContain('/home/deploy');
  });

  it('rejects symlinked, special, and hard-linked payload nodes', async () => {
    await fixture(async (root) => {
      const payload = join(root, 'payload');
      const outside = join(root, 'outside.txt');
      await mkdir(payload);
      await writeFile(outside, 'outside');
      await symlink(outside, join(payload, 'link.txt'));
      await expect(createStaticManifest(payload)).rejects.toThrow(/symlink/i);

      await rm(join(payload, 'link.txt'));
      await link(outside, join(payload, 'hard-link.txt'));
      await expect(createStaticManifest(payload)).rejects.toThrow(/hard link/i);
    });
  });

  it('rejects a symlinked source root', async () => {
    await fixture(async (root) => {
      const payload = join(root, 'payload');
      await mkdir(payload);
      await symlink(payload, join(root, 'payload-link'));
      await expect(createStaticManifest(join(root, 'payload-link'))).rejects.toThrow(/root.*non-symlink/i);
    });
  });

  it('matches the committed current-source manifest', async () => {
    const expected = JSON.parse(await readFile(currentPayloadManifest, 'utf8'));
    expect(await createStaticManifest('site')).toEqual(expected);
  });

  it('keeps the immutable historical seed tag equal to the active /srv release', async () => {
    const { stdout, stderr } = await execFileAsync('python3', [
      'tools/verify_production_seed.py',
      '--manifest',
      relative(repoRoot, historicalSeedManifest.pathname),
      '--site',
      historicalSeedRelease,
      '--repo',
      '.',
      '--git-ref',
      historicalSeedTag,
    ], { cwd: repoRoot });
    expect(stderr).toBe('');
    expect(stdout).toContain('filesystem modes verified: 124 files');
  });
});
