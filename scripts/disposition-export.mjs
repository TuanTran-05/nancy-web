import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

export const SEED_ALIAS = 'website-production-seed';
export const CANDIDATE_ALIAS = 'website-candidate';
export const DEFAULT_TESTED_SOURCE_SHA = '53128492b2010f1a51020f22b56ad6abb848e2f2';

const REPOSITORY_NAME = 'thienuy-website';
const MANIFEST_RELATIVE_PATH = 'docs/baselines/2026-08-29-production-payload-manifest.json';
const SEED_RELATIVE_PATH = 'docs/baselines/2026-08-29-production-seed.json';
const CANDIDATE_RELATIVE_PATH = 'docs/baselines/2026-08-29-website-candidate.json';
const EXPORT_RELATIVE_PATH = 'docs/baselines/2026-08-29-website-disposition-export.json';
const SHA40 = /^[0-9a-f]{40}$/u;
const SHA64 = /^[0-9a-f]{64}$/u;
const ALIAS = /^[a-z0-9][a-z0-9-]{0,63}$/u;

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

function hash(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function sourceIdentitySha256(sourceAlias, exactPath, sourceContentSha256) {
  if (!ALIAS.test(sourceAlias) || !safeRelativePath(exactPath) || !SHA64.test(sourceContentSha256)) {
    fail('WEBSITE_SOURCE_IDENTITY_INPUT_INVALID');
  }
  return hash(`${sourceAlias}\0${exactPath}\0${sourceContentSha256}`);
}

export function targetIdentitySha256(targetPath, targetContentSha256) {
  if (!safeRelativePath(targetPath) || !SHA64.test(targetContentSha256)) {
    fail('WEBSITE_TARGET_IDENTITY_INPUT_INVALID');
  }
  return hash(`${targetPath}\0${targetContentSha256}`);
}

function safeRelativePath(value) {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    !isAbsolute(value) &&
    !value.includes('\\') &&
    !/[\u0000-\u001f\u007f]/u.test(value) &&
    !value.split('/').some((part) => part.length === 0 || part === '.' || part === '..')
  );
}

function exactKeys(value, keys, code) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(code);
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    fail(code);
  }
}

function assertSha(value, code, expression = SHA64) {
  if (typeof value !== 'string' || !expression.test(value)) fail(code);
}

function assertManifest(value, code = 'WEBSITE_CANDIDATE_MANIFEST_INVALID') {
  exactKeys(value, ['entry_count', 'entries'], code);
  if (!Number.isSafeInteger(value.entry_count) || value.entry_count <= 0 || !Array.isArray(value.entries) || value.entries.length !== value.entry_count) {
    fail(code);
  }
  let previous = '';
  const paths = new Set();
  for (const entry of value.entries) {
    exactKeys(entry, ['path', 'bytes', 'sha256'], code);
    if (!safeRelativePath(entry.path) || paths.has(entry.path) || entry.path <= previous) fail(code);
    if (!Number.isSafeInteger(entry.bytes) || entry.bytes < 0) fail(code);
    assertSha(entry.sha256, code);
    previous = entry.path;
    paths.add(entry.path);
  }
  return value;
}

function assertSeed(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('WEBSITE_SEED_INVALID');
  if (!Number.isSafeInteger(value.entry_count) || value.entry_count <= 0 || !Array.isArray(value.entries) || value.entries.length !== value.entry_count) {
    fail('WEBSITE_SEED_INVALID');
  }
  let previous = '';
  const paths = new Set();
  for (const entry of value.entries) {
    exactKeys(entry, ['bytes', 'mode', 'path', 'sha256'], 'WEBSITE_SEED_INVALID');
    if (!safeRelativePath(entry.path) || paths.has(entry.path) || entry.path <= previous) fail('WEBSITE_SEED_INVALID');
    if (!Number.isSafeInteger(entry.bytes) || entry.bytes < 0 || !/^0[0-7]{3}$/u.test(entry.mode)) fail('WEBSITE_SEED_INVALID');
    assertSha(entry.sha256, 'WEBSITE_SEED_INVALID');
    previous = entry.path;
    paths.add(entry.path);
  }
  return value;
}

function git(repositoryRoot, ...args) {
  try {
    return execFileSync('git', args, { cwd: repositoryRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    fail('WEBSITE_CANDIDATE_GIT_INVALID');
  }
}

function gitBlob(repositoryRoot, sourceGitSha, relativePath) {
  try {
    return execFileSync('git', ['show', `${sourceGitSha}:${relativePath}`], {
      cwd: repositoryRoot,
      encoding: 'buffer',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    fail('WEBSITE_CANDIDATE_GIT_INVALID');
  }
}

function readCheckoutBlob(repositoryRoot, relativePath) {
  try {
    return readFileSync(resolve(repositoryRoot, relativePath));
  } catch {
    fail('WEBSITE_CANDIDATE_WORKTREE_DRIFT');
  }
}

function assertCheckoutMatchesSource(repositoryRoot, relativePath, sourceBytes) {
  if (!readCheckoutBlob(repositoryRoot, relativePath).equals(sourceBytes)) {
    fail('WEBSITE_CANDIDATE_WORKTREE_DRIFT');
  }
}

function parseJson(bytes, code) {
  try {
    return JSON.parse(bytes.toString('utf8'));
  } catch {
    fail(code);
  }
}

function assertCommitIsReachable(repositoryRoot, commitSha, headSha = 'HEAD', code = 'WEBSITE_CANDIDATE_SOURCE_UNREACHABLE') {
  assertSha(commitSha, code, SHA40);
  try {
    execFileSync('git', ['cat-file', '-e', `${commitSha}^{commit}`], { cwd: repositoryRoot, stdio: 'ignore' });
    execFileSync('git', ['merge-base', '--is-ancestor', commitSha, headSha], { cwd: repositoryRoot, stdio: 'ignore' });
  } catch {
    fail(code);
  }
}

function assertCandidateShape(value) {
  exactKeys(
    value,
    ['nodeVersion', 'packageLockSha256', 'payloadBytes', 'payloadFileCount', 'releaseManifestSha256', 'schemaVersion', 'sourceGitSha', 'sourceTreeSha'],
    'WEBSITE_CANDIDATE_SCHEMA_INVALID',
  );
  if (value.schemaVersion !== 1 || typeof value.nodeVersion !== 'string' || !/^v\d+\.\d+\.\d+$/u.test(value.nodeVersion)) {
    fail('WEBSITE_CANDIDATE_SCHEMA_INVALID');
  }
  assertSha(value.sourceGitSha, 'WEBSITE_CANDIDATE_SCHEMA_INVALID', SHA40);
  assertSha(value.sourceTreeSha, 'WEBSITE_CANDIDATE_SCHEMA_INVALID', SHA40);
  assertSha(value.packageLockSha256, 'WEBSITE_CANDIDATE_SCHEMA_INVALID');
  assertSha(value.releaseManifestSha256, 'WEBSITE_CANDIDATE_SCHEMA_INVALID');
  if (!Number.isSafeInteger(value.payloadFileCount) || value.payloadFileCount <= 0 || !Number.isSafeInteger(value.payloadBytes) || value.payloadBytes < 0) {
    fail('WEBSITE_CANDIDATE_SCHEMA_INVALID');
  }
  return value;
}

export function buildCandidateMetadata({ repositoryRoot, sourceGitSha = DEFAULT_TESTED_SOURCE_SHA }) {
  if (!repositoryRoot || !isAbsolute(repositoryRoot)) fail('WEBSITE_CANDIDATE_REPOSITORY_INVALID');
  assertCommitIsReachable(repositoryRoot, sourceGitSha);
  const sourceTreeSha = git(repositoryRoot, 'rev-parse', `${sourceGitSha}^{tree}`);
  assertSha(sourceTreeSha, 'WEBSITE_CANDIDATE_GIT_INVALID', SHA40);
  const packageLockBytes = gitBlob(repositoryRoot, sourceGitSha, 'package-lock.json');
  const manifestBytes = gitBlob(repositoryRoot, sourceGitSha, MANIFEST_RELATIVE_PATH);
  assertCheckoutMatchesSource(repositoryRoot, 'package-lock.json', packageLockBytes);
  assertCheckoutMatchesSource(repositoryRoot, MANIFEST_RELATIVE_PATH, manifestBytes);
  const manifest = assertManifest(parseJson(manifestBytes, 'WEBSITE_CANDIDATE_MANIFEST_INVALID'));
  const candidate = {
    schemaVersion: 1,
    sourceGitSha,
    sourceTreeSha,
    nodeVersion: process.version,
    packageLockSha256: hash(packageLockBytes),
    releaseManifestSha256: hash(manifestBytes),
    payloadFileCount: manifest.entry_count,
    payloadBytes: manifest.entries.reduce((total, entry) => total + entry.bytes, 0),
  };
  assertCandidateShape(candidate);
  return candidate;
}

export function validateCandidateMetadata(value, { repositoryRoot, manifest, headSha = 'HEAD' } = {}) {
  const candidate = assertCandidateShape(value);
  if (repositoryRoot) {
    assertCommitIsReachable(repositoryRoot, candidate.sourceGitSha, headSha, 'WEBSITE_CANDIDATE_SOURCE_UNREACHABLE');
    if (git(repositoryRoot, 'rev-parse', `${candidate.sourceGitSha}^{tree}`) !== candidate.sourceTreeSha) {
      fail('WEBSITE_CANDIDATE_TREE_MISMATCH');
    }
    const lockBytes = gitBlob(repositoryRoot, candidate.sourceGitSha, 'package-lock.json');
    const manifestBytes = gitBlob(repositoryRoot, candidate.sourceGitSha, MANIFEST_RELATIVE_PATH);
    assertCheckoutMatchesSource(repositoryRoot, 'package-lock.json', lockBytes);
    assertCheckoutMatchesSource(repositoryRoot, MANIFEST_RELATIVE_PATH, manifestBytes);
    if (hash(lockBytes) !== candidate.packageLockSha256 || hash(manifestBytes) !== candidate.releaseManifestSha256) {
      fail('WEBSITE_CANDIDATE_DIGEST_MISMATCH');
    }
    manifest = assertManifest(parseJson(manifestBytes, 'WEBSITE_CANDIDATE_MANIFEST_INVALID'));
  }
  if (manifest) {
    assertManifest(manifest);
    if (manifest.entry_count !== candidate.payloadFileCount || manifest.entries.reduce((total, entry) => total + entry.bytes, 0) !== candidate.payloadBytes) {
      fail('WEBSITE_CANDIDATE_PAYLOAD_MISMATCH');
    }
  }
  return candidate;
}

function candidateExport(candidate) {
  assertCandidateShape(candidate);
  return {
    repository: REPOSITORY_NAME,
    gitSha: candidate.sourceGitSha,
    treeSha: candidate.sourceTreeSha,
    manifestSha256: candidate.releaseManifestSha256,
  };
}

function assertEntry(value) {
  exactKeys(value, ['disposition', 'replacementSha', 'sourceAlias', 'sourceContentSha256', 'sourceIdentitySha256', 'targetIdentitySha256', 'targetRepository'], 'WEBSITE_EXPORT_SCHEMA_INVALID');
  if (!ALIAS.test(value.sourceAlias) || !['integrate', 'superseded', 'generated'].includes(value.disposition) || value.targetRepository !== REPOSITORY_NAME) {
    fail(value.disposition === 'pending' ? 'WEBSITE_EXPORT_DISPOSITION_INVALID' : 'WEBSITE_EXPORT_SCHEMA_INVALID');
  }
  assertSha(value.sourceIdentitySha256, 'WEBSITE_EXPORT_SCHEMA_INVALID');
  assertSha(value.sourceContentSha256, 'WEBSITE_EXPORT_SCHEMA_INVALID');
  assertSha(value.targetIdentitySha256, 'WEBSITE_EXPORT_SCHEMA_INVALID');
  assertSha(value.replacementSha, 'WEBSITE_EXPORT_SCHEMA_INVALID', SHA40);
  return value;
}

function assertEnvelope(value) {
  exactKeys(value, ['kind', 'payload', 'payloadSha256', 'schemaVersion'], 'EXPORT_SCHEMA_INVALID');
  if (value.schemaVersion !== 1 || value.kind !== 'canonical-disposition-export') fail('EXPORT_SCHEMA_INVALID');
  assertSha(value.payloadSha256, 'EXPORT_SCHEMA_INVALID');
  exactKeys(value.payload, ['candidate', 'entries', 'ledger', 'schemaVersion', 'surface'], 'EXPORT_SCHEMA_INVALID');
  if (value.payload.schemaVersion !== 1 || value.payload.surface !== 'website') fail('EXPORT_SCHEMA_INVALID');
  exactKeys(value.payload.candidate, ['gitSha', 'manifestSha256', 'repository', 'treeSha'], 'EXPORT_SCHEMA_INVALID');
  if (value.payload.candidate.repository !== REPOSITORY_NAME) fail('EXPORT_REPOSITORY_MISMATCH');
  assertSha(value.payload.candidate.gitSha, 'EXPORT_SCHEMA_INVALID', SHA40);
  assertSha(value.payload.candidate.treeSha, 'EXPORT_SCHEMA_INVALID', SHA40);
  assertSha(value.payload.candidate.manifestSha256, 'EXPORT_SCHEMA_INVALID');
  exactKeys(value.payload.ledger, ['bytesSha256', 'entryCount'], 'EXPORT_SCHEMA_INVALID');
  assertSha(value.payload.ledger.bytesSha256, 'EXPORT_SCHEMA_INVALID');
  if (!Number.isSafeInteger(value.payload.ledger.entryCount) || value.payload.ledger.entryCount <= 0 || !Array.isArray(value.payload.entries) || value.payload.entries.length !== value.payload.ledger.entryCount) {
    fail('EXPORT_ENTRY_COUNT_MISMATCH');
  }
  for (const entry of value.payload.entries) assertEntry(entry);
  if (hash(JSON.stringify(value.payload)) !== value.payloadSha256) fail('EXPORT_PAYLOAD_DIGEST_MISMATCH');
  return value;
}

function expectedCandidateMap(candidateSource) {
  if (!candidateSource) return null;
  assertManifest(candidateSource);
  return new Map(candidateSource.entries.map((entry) => [entry.path, entry]));
}

export function buildWebsiteDispositionExport({ candidate, candidateSource, seed, seedBytes, replacementSha = candidate?.sourceGitSha, seedAlias = SEED_ALIAS, candidateAlias = CANDIDATE_ALIAS }) {
  const parsedCandidate = assertCandidateShape(candidate);
  const current = expectedCandidateMap(candidateSource);
  if (!current || !Buffer.isBuffer(seedBytes)) fail('WEBSITE_EXPORT_INPUT_INVALID');
  assertSeed(seed);
  let seedFromBytes;
  try {
    seedFromBytes = JSON.parse(seedBytes.toString('utf8'));
  } catch {
    fail('WEBSITE_EXPORT_SEED_BYTES_INVALID');
  }
  if (!isDeepStrictEqual(seedFromBytes, seed)) fail('WEBSITE_EXPORT_SEED_BYTES_MISMATCH');
  assertSha(replacementSha, 'WEBSITE_EXPORT_REPLACEMENT_INVALID', SHA40);
  if (!ALIAS.test(seedAlias) || !ALIAS.test(candidateAlias) || seedAlias === candidateAlias) fail('WEBSITE_EXPORT_ALIAS_INVALID');

  const seedPaths = new Set(seed.entries.map((entry) => entry.path));
  const entries = [];
  for (const source of seed.entries) {
    const target = current.get(source.path);
    if (!target) fail('WEBSITE_EXPORT_SEED_PATH_MISSING');
    const unchanged = source.sha256 === target.sha256 && source.bytes === target.bytes;
    entries.push({
      sourceAlias: seedAlias,
      sourceIdentitySha256: sourceIdentitySha256(seedAlias, source.path, source.sha256),
      sourceContentSha256: source.sha256,
      disposition: unchanged ? 'integrate' : 'superseded',
      targetRepository: REPOSITORY_NAME,
      targetIdentitySha256: targetIdentitySha256(target.path, target.sha256),
      replacementSha,
    });
  }
  for (const target of [...current.values()].filter((entry) => !seedPaths.has(entry.path))) {
    entries.push({
      sourceAlias: candidateAlias,
      sourceIdentitySha256: sourceIdentitySha256(candidateAlias, target.path, target.sha256),
      sourceContentSha256: target.sha256,
      disposition: 'generated',
      targetRepository: REPOSITORY_NAME,
      targetIdentitySha256: targetIdentitySha256(target.path, target.sha256),
      replacementSha,
    });
  }
  const payload = {
    schemaVersion: 1,
    surface: 'website',
    candidate: candidateExport(parsedCandidate),
    ledger: { bytesSha256: hash(seedBytes), entryCount: entries.length },
    entries,
  };
  const result = { schemaVersion: 1, kind: 'canonical-disposition-export', payloadSha256: hash(JSON.stringify(payload)), payload };
  return result;
}

export function validateWebsiteDispositionExport(value, { candidate, seed, seedBytes, candidateSource, repositoryRoot, headSha = 'HEAD' } = {}) {
  const result = assertEnvelope(value);
  if (candidate) {
    const expected = candidateExport(assertCandidateShape(candidate));
    if (JSON.stringify(result.payload.candidate) !== JSON.stringify(expected)) fail('WEBSITE_EXPORT_CANDIDATE_MISMATCH');
  }
  if (seedBytes !== undefined) {
    if (!Buffer.isBuffer(seedBytes)) fail('WEBSITE_EXPORT_SEED_BYTES_INVALID');
    if (result.payload.ledger.bytesSha256 !== hash(seedBytes)) fail('WEBSITE_EXPORT_SEED_DIGEST_MISMATCH');
  }
  if (!seed) fail('WEBSITE_EXPORT_SEED_INVALID');
  assertSeed(seed);
  if (result.payload.ledger.entryCount < seed.entry_count) fail('WEBSITE_EXPORT_ENTRY_COUNT_MISMATCH');
  const current = expectedCandidateMap(candidateSource);
  const expectedSeedIdentities = new Map(seed.entries.map((entry) => [sourceIdentitySha256(SEED_ALIAS, entry.path, entry.sha256), entry]));
  const seen = new Set();
  const sourceEntries = new Map();
  for (const entry of result.payload.entries) {
    if (seen.has(entry.sourceIdentitySha256)) fail('DUPLICATE_SOURCE_IDENTITY');
    seen.add(entry.sourceIdentitySha256);
    if (entry.replacementSha !== result.payload.candidate.gitSha) fail('WEBSITE_EXPORT_REPLACEMENT_MISMATCH');
    if (repositoryRoot) assertCommitIsReachable(repositoryRoot, entry.replacementSha, headSha, 'WEBSITE_EXPORT_REPLACEMENT_UNREACHABLE');
    if (entry.sourceAlias === SEED_ALIAS) {
      const source = expectedSeedIdentities.get(entry.sourceIdentitySha256);
      if (!source) fail('WEBSITE_EXPORT_SEED_IDENTITY_UNEXPECTED');
      if (sourceEntries.has(source.path)) fail('DUPLICATE_SOURCE_IDENTITY');
      sourceEntries.set(source.path, entry);
      if (entry.sourceContentSha256 !== source.sha256) fail('WEBSITE_EXPORT_SOURCE_CONTENT_MISMATCH');
      if (!current) continue;
      const target = current.get(source.path);
      if (!target) fail('WEBSITE_EXPORT_SEED_PATH_MISSING');
      const expectedDisposition = source.sha256 === target.sha256 && source.bytes === target.bytes ? 'integrate' : 'superseded';
      if (entry.disposition !== expectedDisposition || entry.targetIdentitySha256 !== targetIdentitySha256(source.path, target.sha256)) {
        fail('WEBSITE_EXPORT_TARGET_IDENTITY_MISMATCH');
      }
    } else if (entry.sourceAlias === CANDIDATE_ALIAS) {
      if (entry.disposition !== 'generated') fail('WEBSITE_EXPORT_DISPOSITION_INVALID');
      if (current) {
        const target = [...current.values()].find((item) => sourceIdentitySha256(CANDIDATE_ALIAS, item.path, item.sha256) === entry.sourceIdentitySha256);
        if (!target || seed.entries.some((source) => source.path === target.path)) fail('WEBSITE_EXPORT_GENERATED_IDENTITY_INVALID');
        if (entry.sourceContentSha256 !== target.sha256 || entry.targetIdentitySha256 !== targetIdentitySha256(target.path, target.sha256)) fail('WEBSITE_EXPORT_TARGET_IDENTITY_MISMATCH');
      }
    } else {
      fail('WEBSITE_EXPORT_SOURCE_ALIAS_INVALID');
    }
  }
  for (const source of seed.entries) {
    const identity = sourceIdentitySha256(SEED_ALIAS, source.path, source.sha256);
    if (!seen.has(identity)) fail('WEBSITE_EXPORT_SEED_IDENTITY_MISSING');
  }
  if (current) {
    for (const target of current.values()) {
      const identity = sourceIdentitySha256(seed.entries.some((source) => source.path === target.path) ? SEED_ALIAS : CANDIDATE_ALIAS, target.path, seed.entries.find((source) => source.path === target.path)?.sha256 ?? target.sha256);
      if (!seed.entries.some((source) => source.path === target.path) && !seen.has(sourceIdentitySha256(CANDIDATE_ALIAS, target.path, target.sha256))) fail('WEBSITE_EXPORT_GENERATED_IDENTITY_MISSING');
      void identity;
    }
  }
  return result;
}

function readJson(path, code) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    fail(code);
  }
}

function repositoryRootFromModule() {
  return resolve(dirname(fileURLToPath(import.meta.url)), '..');
}

function writeArtifacts(repositoryRoot, sourceGitSha) {
  const candidate = buildCandidateMetadata({ repositoryRoot, sourceGitSha });
  const manifest = assertManifest(readJson(resolve(repositoryRoot, MANIFEST_RELATIVE_PATH), 'WEBSITE_CANDIDATE_MANIFEST_INVALID'));
  const seedPath = resolve(repositoryRoot, SEED_RELATIVE_PATH);
  const seedBytes = readFileSync(seedPath);
  const seed = readJson(seedPath, 'WEBSITE_SEED_INVALID');
  const exported = buildWebsiteDispositionExport({ candidate, candidateSource: manifest, seed, seedBytes, replacementSha: sourceGitSha });
  writeFileSync(resolve(repositoryRoot, CANDIDATE_RELATIVE_PATH), `${JSON.stringify(candidate, null, 2)}\n`, { flag: 'w', mode: 0o664 });
  writeFileSync(resolve(repositoryRoot, EXPORT_RELATIVE_PATH), `${JSON.stringify(exported, null, 2)}\n`, { flag: 'w', mode: 0o664 });
  process.stdout.write('WEBSITE_DISPOSITION_EXPORT_WRITE_PASS\n');
}

function verifyArtifact(repositoryRoot, exportPath) {
  const candidatePath = resolve(repositoryRoot, CANDIDATE_RELATIVE_PATH);
  const seedPath = resolve(repositoryRoot, SEED_RELATIVE_PATH);
  const manifestPath = resolve(repositoryRoot, MANIFEST_RELATIVE_PATH);
  const candidate = readJson(candidatePath, 'WEBSITE_CANDIDATE_JSON_INVALID');
  const seedBytes = readFileSync(seedPath);
  const seed = readJson(seedPath, 'WEBSITE_SEED_INVALID');
  const manifest = readJson(manifestPath, 'WEBSITE_CANDIDATE_MANIFEST_INVALID');
  validateCandidateMetadata(candidate, { repositoryRoot, manifest });
  const exported = readJson(exportPath, 'WEBSITE_EXPORT_JSON_INVALID');
  validateWebsiteDispositionExport(exported, { candidate, seed, seedBytes, candidateSource: manifest, repositoryRoot });
  process.stdout.write('WEBSITE_DISPOSITION_EXPORT_PASS\n');
}

function main() {
  const repositoryRoot = repositoryRootFromModule();
  const args = process.argv.slice(2);
  if (args[0] === '--write' && args.length <= 2) {
    writeArtifacts(repositoryRoot, args[1] ?? DEFAULT_TESTED_SOURCE_SHA);
    return;
  }
  if (args[0] === '--verify' && args.length === 2 && isAbsolute(resolve(args[1]))) {
    verifyArtifact(repositoryRoot, resolve(args[1]));
    return;
  }
  fail('WEBSITE_EXPORT_ARGUMENTS_INVALID');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 2;
  }
}
