import { execFile, spawn } from 'node:child_process';
import { access, chmod, link, lstat, mkdir, mkdtemp, readFile, readlink, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { once } from 'node:events';
import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const prepareScript = join(repoRoot, 'deploy', 'prepare-release.sh');
const activateScript = join(repoRoot, 'deploy', 'activate-release.sh');

type CommandResult = { code: number; stderr: string; stdout: string };

async function command(file: string, args: string[], env: Record<string, string>): Promise<CommandResult> {
  try {
    const { stdout, stderr } = await execFileAsync(file, args, { env: { ...process.env, ...env } });
    return { code: 0, stdout, stderr };
  } catch (error: any) {
    return { code: error.code ?? 1, stdout: error.stdout ?? '', stderr: error.stderr ?? '' };
  }
}

async function fixture(callback: (root: string) => Promise<void>) {
  const root = await mkdtemp(join(tmpdir(), 'thienuy-release-assets-'));
  try {
    await callback(root);
  } finally {
    await rm(root, { force: true, recursive: true });
  }
}

async function createFixtureRepository(root: string) {
  const repo = join(root, 'repo');
  const dist = join(root, 'dist');
  await mkdir(join(repo, 'scripts'), { recursive: true });
  await mkdir(join(repo, 'site'), { recursive: true });
  await mkdir(join(repo, 'docs', 'baselines'), { recursive: true });
  await mkdir(dist);
  await writeFile(join(repo, 'site', 'index.html'), 'fixture payload\n');
  await writeFile(join(dist, 'index.html'), 'fixture payload\n');
  await writeFile(
    join(repo, 'scripts', 'static-manifest.mjs'),
    await readFile(join(repoRoot, 'scripts', 'static-manifest.mjs'), 'utf8'),
  );
  await writeFile(
    join(repo, 'scripts', 'build.mjs'),
    await readFile(join(repoRoot, 'scripts', 'build.mjs'), 'utf8'),
  );
  const manifest = await command('node', [join(repo, 'scripts', 'static-manifest.mjs'), dist], {});
  expect(manifest.code).toBe(0);
  await writeFile(join(repo, 'docs', 'baselines', '2026-08-29-production-payload-manifest.json'), manifest.stdout);
  await command('git', ['init', '--quiet', repo], {});
  await command('git', ['-C', repo, 'config', 'user.email', 'fixture@example.test'], {});
  await command('git', ['-C', repo, 'config', 'user.name', 'Fixture'], {});
  await command('git', ['-C', repo, 'add', '.'], {});
  await command('git', ['-C', repo, 'commit', '--quiet', '-m', 'fixture'], {});
  const sha = (await command('git', ['-C', repo, 'rev-parse', 'HEAD'], {})).stdout.trim();
  return { repo, dist, sha };
}

async function writeMockCommands(root: string) {
  const nginx = join(root, 'nginx');
  const systemctl = join(root, 'systemctl');
  await writeFile(nginx, '#!/bin/sh\n[ "$1" = "-t" ] && exit "${MOCK_NGINX_TEST_EXIT:-0}"\nexit 0\n');
  await writeFile(systemctl, '#!/bin/sh\nexit "${MOCK_RELOAD_EXIT:-0}"\n');
  await chmod(nginx, 0o755);
  await chmod(systemctl, 0o755);
  return { nginx, systemctl };
}

async function prepare(root: string, repo: string, sha: string, dist: string) {
  return command(prepareScript, [sha, dist], {
    THIENUY_REPO_ROOT: repo,
    THIENUY_RELEASE_ROOT: join(root, 'runtime'),
  });
}

async function waitForFile(path: string) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (await access(path).then(() => true).catch(() => false)) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error(`timed out waiting for ${path}`);
}

describe('immutable release assets', () => {
  it('rejects a non-full release ID before changing the current pointer', async () => {
    await fixture(async (root) => {
      const { repo, dist } = await createFixtureRepository(root);
      const runtime = join(root, 'runtime');
      const previous = join(runtime, 'releases', 'previous');
      await mkdir(previous, { recursive: true });
      await symlink(previous, join(runtime, 'current'));

      const result = await prepare(root, repo, 'not-a-full-sha', dist);

      expect(result.code).not.toBe(0);
      expect(result.stderr).toMatch(/40-character.*SHA/i);
      expect(await readlink(join(runtime, 'current'))).toBe(previous);
    });
  });

  it('prepares only a manifest-exact immutable release and leaves current untouched', async () => {
    await fixture(async (root) => {
      const { repo, dist, sha } = await createFixtureRepository(root);
      const runtime = join(root, 'runtime');
      const previous = join(runtime, 'releases', 'previous');
      await mkdir(previous, { recursive: true });
      await symlink(previous, join(runtime, 'current'));

      const result = await prepare(root, repo, sha, dist);

      expect(result).toMatchObject({ code: 0 });
      expect(await readlink(join(runtime, 'current'))).toBe(previous);
      expect(await readFile(join(runtime, 'releases', sha, 'index.html'), 'utf8')).toBe('fixture payload\n');
      expect((await readdir(join(runtime, 'releases'))).filter((name) => name.startsWith('.staging-'))).toEqual([]);
      const marker = await readFile(join(runtime, 'release-metadata', sha, 'source-marker.json'), 'utf8');
      expect(marker).toContain(`"git_sha":"${sha}"`);
      expect(marker).toContain('"manifest_sha256":"');
      expect(await lstat(join(runtime, 'releases', sha, '.release-manifest.json')).catch((error) => error.code)).toBe('ENOENT');
    });
  });

  it.each(['symlink', 'hardlink', 'fifo', 'secret'])('rejects a %s path rather than releasing an unverified tree', async (kind) => {
    await fixture(async (root) => {
      const { repo, dist, sha } = await createFixtureRepository(root);
      if (kind === 'symlink') await symlink(join(dist, 'index.html'), join(dist, 'escape.html'));
      if (kind === 'hardlink') await link(join(dist, 'index.html'), join(dist, 'alias.html'));
      if (kind === 'fifo') {
        const fifo = await command('mkfifo', [join(dist, 'pipe')], {});
        expect(fifo.code).toBe(0);
      }
      if (kind === 'secret') await writeFile(join(dist, '.env'), 'API_KEY=not-for-release\n');

      const result = await prepare(root, repo, sha, dist);

      expect(result.code).not.toBe(0);
      await expect(lstat(join(root, 'runtime', 'releases', sha))).rejects.toMatchObject({ code: 'ENOENT' });
    });
  });

  it('uses verifier and copy modules from the requested commit rather than mutable checkout files', async () => {
    await fixture(async (root) => {
      const { repo, dist, sha } = await createFixtureRepository(root);
      const runtime = join(root, 'runtime');
      const previous = join(runtime, 'releases', 'previous');
      await mkdir(previous, { recursive: true });
      await symlink(previous, join(runtime, 'current'));
      await symlink(join(dist, 'index.html'), join(dist, 'escape.html'));
      await writeFile(
        join(repo, 'scripts', 'static-manifest.mjs'),
        "import { readFile } from 'node:fs/promises';\nprocess.stdout.write(await readFile(new URL('../docs/baselines/2026-08-29-production-payload-manifest.json', import.meta.url), 'utf8'));\n",
      );
      await writeFile(
        join(repo, 'scripts', 'build.mjs'),
        "import { copyFile, mkdir } from 'node:fs/promises';\nimport { join } from 'node:path';\nexport async function buildStaticSite({ sourceDir, outputDir }) { await mkdir(outputDir); await copyFile(join(sourceDir, 'index.html'), join(outputDir, 'index.html')); }\n",
      );

      const result = await prepare(root, repo, sha, dist);

      expect(result.code).not.toBe(0);
      await expect(lstat(join(runtime, 'releases', sha))).rejects.toMatchObject({ code: 'ENOENT' });
      expect(await readlink(join(runtime, 'current'))).toBe(previous);
    });
  });

  it('keeps the old pointer on nginx preflight failure and rolls it back after reload failure', async () => {
    await fixture(async (root) => {
      const { repo, dist, sha } = await createFixtureRepository(root);
      const runtime = join(root, 'runtime');
      const previous = join(runtime, 'releases', 'previous');
      await mkdir(previous, { recursive: true });
      await symlink(previous, join(runtime, 'current'));
      expect((await prepare(root, repo, sha, dist)).code).toBe(0);
      const { nginx, systemctl } = await writeMockCommands(root);
      const env = {
        THIENUY_REPO_ROOT: repo,
        THIENUY_RELEASE_ROOT: runtime,
        THIENUY_NGINX_BIN: nginx,
        THIENUY_SYSTEMCTL_BIN: systemctl,
      };

      const preflight = await command(activateScript, [sha], { ...env, MOCK_NGINX_TEST_EXIT: '1' });
      expect(preflight.code).not.toBe(0);
      expect(await readlink(join(runtime, 'current'))).toBe(previous);

      const reload = await command(activateScript, [sha], { ...env, MOCK_RELOAD_EXIT: '1' });
      expect(reload.code).not.toBe(0);
      expect(await readlink(join(runtime, 'current'))).toBe(previous);
    });
  });

  it('refuses a competing activation while the runtime activation lock is held', async () => {
    await fixture(async (root) => {
      const { repo, dist, sha } = await createFixtureRepository(root);
      const runtime = join(root, 'runtime');
      const previous = join(runtime, 'releases', 'previous');
      await mkdir(previous, { recursive: true });
      await symlink(previous, join(runtime, 'current'));
      expect((await prepare(root, repo, sha, dist)).code).toBe(0);
      const { nginx, systemctl } = await writeMockCommands(root);
      const ready = join(root, 'lock-held');
      const lock = join(runtime, '.activation.lock');
      const holder = spawn('flock', ['-n', lock, 'sh', '-c', 'touch "$1"; exec sleep 5', 'sh', ready]);
      try {
        await waitForFile(ready);
        const result = await command(activateScript, [sha], {
          THIENUY_REPO_ROOT: repo,
          THIENUY_RELEASE_ROOT: runtime,
          THIENUY_NGINX_BIN: nginx,
          THIENUY_SYSTEMCTL_BIN: systemctl,
        });

        expect(result.code).not.toBe(0);
        expect(await readlink(join(runtime, 'current'))).toBe(previous);
      } finally {
        holder.kill('SIGTERM');
        await once(holder, 'exit');
      }
    });
  });
});
