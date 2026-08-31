import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';
import {
  buildCandidateMetadata,
  buildWebsiteDispositionExport,
  sourceIdentitySha256,
  targetIdentitySha256,
  validateWebsiteDispositionExport,
} from './disposition-export.mjs';

const execFileAsync = promisify(execFile);
const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const candidatePath = fileURLToPath(
  new URL('../docs/baselines/2026-08-29-website-candidate.json', import.meta.url),
);
const exportPath = fileURLToPath(
  new URL('../docs/baselines/2026-08-29-website-disposition-export.json', import.meta.url),
);
const seedPath = fileURLToPath(
  new URL('../docs/baselines/2026-08-29-production-seed.json', import.meta.url),
);
const manifestPath = fileURLToPath(
  new URL('../docs/baselines/2026-08-29-production-payload-manifest.json', import.meta.url),
);
const testedSourceSha = '53128492b2010f1a51020f22b56ad6abb848e2f2';
const seedAlias = 'website-production-seed';
const candidateAlias = 'website-candidate';
const platformImporterPath = process.env.EDUTRACK_PLATFORM_ROOT
  ? `${process.env.EDUTRACK_PLATFORM_ROOT}/scripts/consolidation/importDispositionExports.mjs`
  : '/home/deploy/edutrack-platform/scripts/consolidation/importDispositionExports.mjs';

function digest(value: string | Buffer): string {
  return createHash('sha256').update(value).digest('hex');
}

async function readJson(path: string): Promise<any> {
  return JSON.parse(await readFile(path, 'utf8'));
}

describe('canonical website candidate', () => {
  it('records the tested source and payload identity without runtime paths', async () => {
    const candidate = await readJson(candidatePath);
    const manifest = await readJson(manifestPath);
    expect(candidate).toEqual(buildCandidateMetadata({ repositoryRoot, sourceGitSha: testedSourceSha }));
    expect(candidate).toMatchObject({
      schemaVersion: 1,
      sourceGitSha: testedSourceSha,
      sourceTreeSha: '796724d3c4b9362bfc5560e9bc1e66c6b542806e',
      nodeVersion: process.version,
      packageLockSha256: digest(await readFile(`${repositoryRoot}/package-lock.json`)),
      releaseManifestSha256: digest(await readFile(manifestPath)),
      payloadFileCount: manifest.entry_count,
      payloadBytes: manifest.entries.reduce((total: number, entry: { bytes: number }) => total + entry.bytes, 0),
    });
    expect(JSON.stringify(candidate)).not.toMatch(/\/srv\/|\/etc\/|\/var\/|secret|password|token|private/i);
  });

  it('emits the exact sanitized envelope accepted by the Platform importer', async () => {
    const candidate = await readJson(candidatePath);
    const seedBytes = await readFile(seedPath);
    const seed = JSON.parse(seedBytes.toString('utf8'));
    const manifest = await readJson(manifestPath);
    const exported = await readJson(exportPath);
    const expected = buildWebsiteDispositionExport({
      candidate,
      candidateSource: manifest,
      seed,
      seedBytes,
      replacementSha: testedSourceSha,
      seedAlias,
      candidateAlias,
    });

    expect(exported).toEqual(expected);
    expect(validateWebsiteDispositionExport(exported, { candidate, seed, seedBytes })).toEqual(exported);
    expect(exported.payload.surface).toBe('website');
    expect(exported.payload.candidate).toEqual({
      repository: 'thienuy-website',
      gitSha: candidate.sourceGitSha,
      treeSha: candidate.sourceTreeSha,
      manifestSha256: candidate.releaseManifestSha256,
    });
    expect(exported.payload.ledger).toEqual({
      bytesSha256: digest(seedBytes),
      entryCount: manifest.entry_count,
    });
    expect(exported.payload.entries).toHaveLength(seed.entry_count + 1);
    expect(exported.payload.entries.every((entry: any) => entry.targetRepository === 'thienuy-website')).toBe(true);
    expect(exported.payload.entries.every((entry: any) => /^[0-9a-f]{40}$/.test(entry.replacementSha))).toBe(true);
    expect(JSON.stringify(exported)).not.toMatch(/sourcePath|\/srv\/|\/etc\/|\/var\/|secret|password|token|private|evidence|data/i);

    const seedIdentitySet = new Set(
      seed.entries.map((entry: any) => sourceIdentitySha256(seedAlias, entry.path, entry.sha256)),
    );
    const exportedSeedEntries = exported.payload.entries.filter((entry: any) => entry.sourceAlias === seedAlias);
    expect(new Set(exportedSeedEntries.map((entry: any) => entry.sourceIdentitySha256))).toEqual(seedIdentitySet);
    expect(exportedSeedEntries).toHaveLength(seed.entry_count);
    const changed = exportedSeedEntries.filter((entry: any) => entry.disposition === 'superseded');
    expect(changed.length).toBeGreaterThan(0);
    expect(exported.payload.entries.find((entry: any) => entry.sourceAlias === candidateAlias)).toMatchObject({
      disposition: 'generated',
      targetIdentitySha256: targetIdentitySha256('google-apps-script.gs', manifest.entries.find((entry: any) => entry.path === 'google-apps-script.gs').sha256),
    });
  });

  it('is accepted by the canonical Platform importer without conversion', async () => {
    const exported = await readJson(exportPath);
    const { validateDispositionExport } = await import(platformImporterPath);
    expect(validateDispositionExport(exported, 'website')).toEqual(exported);
  });

  it('rejects tamper, duplicate/missing identities, stale candidates, pending values, and forbidden fields', async () => {
    const value = await readJson(exportPath);
    const candidate = await readJson(candidatePath);
    const seedBytes = await readFile(seedPath);
    const seed = JSON.parse(seedBytes.toString('utf8'));
    const cases: Array<[string, (input: any) => void, string]> = [
      ['tampered payload', (input) => { input.payload.entries[0].sourceContentSha256 = 'f'.repeat(64); }, 'EXPORT_PAYLOAD_DIGEST_MISMATCH'],
      ['duplicate identity', (input) => { input.payload.entries[1].sourceIdentitySha256 = input.payload.entries[0].sourceIdentitySha256; input.payloadSha256 = digest(JSON.stringify(input.payload)); }, 'DUPLICATE_SOURCE_IDENTITY'],
      ['missing seed identity', (input) => { input.payload.entries.shift(); input.payload.ledger.entryCount = input.payload.entries.length; input.payloadSha256 = digest(JSON.stringify(input.payload)); }, 'WEBSITE_EXPORT_SEED_IDENTITY_MISSING'],
      ['stale candidate', (input) => { input.payload.candidate.gitSha = 'f'.repeat(40); input.payloadSha256 = digest(JSON.stringify(input.payload)); }, 'WEBSITE_EXPORT_CANDIDATE_MISMATCH'],
      ['pending disposition', (input) => { input.payload.entries[0].disposition = 'pending'; input.payloadSha256 = digest(JSON.stringify(input.payload)); }, 'WEBSITE_EXPORT_DISPOSITION_INVALID'],
      ['absolute source field', (input) => { input.payload.entries[0].sourcePath = '/srv/private'; input.payloadSha256 = digest(JSON.stringify(input.payload)); }, 'EXPORT_SCHEMA_INVALID'],
      ['secret field', (input) => { input.payload.secret = 'do-not-export'; input.payloadSha256 = digest(JSON.stringify(input.payload)); }, 'EXPORT_SCHEMA_INVALID'],
    ];
    for (const [name, mutate, error] of cases) {
      const copy = structuredClone(value);
      mutate(copy);
      expect(() => validateWebsiteDispositionExport(copy, { candidate, seed, seedBytes }), name).toThrow(error);
    }
  });

  it('verifies the committed export through the CLI', async () => {
    const { stdout } = await execFileAsync(process.execPath, [
      `${repositoryRoot}/scripts/disposition-export.mjs`,
      '--verify',
      exportPath,
    ], { cwd: repositoryRoot });
    expect(stdout).toContain('WEBSITE_DISPOSITION_EXPORT_PASS');
  });
});
