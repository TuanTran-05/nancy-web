import { constants } from 'node:fs';
import { chmod, lstat, open, readdir, realpath, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const NO_FOLLOW = constants.O_NOFOLLOW;

function fail(message) {
  throw new Error(message);
}

function posixPath(segments) {
  const value = segments.join('/');
  if (!value || value.startsWith('/') || value.split('/').some((part) => !part || part === '.' || part === '..')) {
    fail(`unsafe POSIX relative path: ${value}`);
  }
  return value;
}

function lexicalCompare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function isWithin(root, candidate) {
  return candidate === root || candidate.startsWith(`${root}${sep}`);
}

async function secureRoot(root, label) {
  if (typeof root !== 'string' || !root) fail(`${label} root must be a non-empty path`);
  const absolute = resolve(root);
  const node = await lstat(absolute).catch((error) => {
    if (error.code === 'ENOENT') fail(`${label} root is missing: ${root}`);
    throw error;
  });
  if (node.isSymbolicLink() || !node.isDirectory()) fail(`${label} root must be a non-symlink directory`);
  return { absolute, real: await realpath(absolute), stat: node };
}

function assertContained(root, candidate, pathForError) {
  if (!isWithin(root, candidate)) fail(`lexical path escapes root: ${pathForError}`);
}

async function secureNode(root, segments) {
  const manifestPath = posixPath(segments);
  const lexicalPath = resolve(root.absolute, ...segments);
  assertContained(root.absolute, lexicalPath, manifestPath);
  const node = await lstat(lexicalPath);
  if (node.isSymbolicLink()) fail(`symlink rejected: ${manifestPath}`);
  const resolvedPath = await realpath(lexicalPath);
  assertContained(root.real, resolvedPath, manifestPath);
  if (node.isDirectory()) return { kind: 'directory', manifestPath, lexicalPath, stat: node };
  if (!node.isFile()) fail(`non-regular deployable node rejected: ${manifestPath}`);
  if (node.nlink !== 1) fail(`hard link rejected: ${manifestPath}`);
  return { kind: 'file', manifestPath, lexicalPath, stat: node };
}

function noFollowFlags(flags) {
  if (typeof NO_FOLLOW !== 'number') fail('safe no-follow file access is unavailable');
  return flags | NO_FOLLOW;
}

async function openValidatedFile(node) {
  const handle = await open(node.lexicalPath, noFollowFlags(constants.O_RDONLY));
  const opened = await handle.stat();
  if (!opened.isFile() || opened.nlink !== 1) {
    await handle.close();
    fail(`non-regular or hard-linked file rejected during access: ${node.manifestPath}`);
  }
  if (opened.dev !== node.stat.dev || opened.ino !== node.stat.ino) {
    await handle.close();
    fail(`file changed during access: ${node.manifestPath}`);
  }
  return { handle, opened };
}

async function hashValidatedFile(node) {
  const { handle, opened } = await openValidatedFile(node);
  const hash = createHash('sha256');
  const buffer = Buffer.allocUnsafe(64 * 1024);
  let offset = 0;
  try {
    while (true) {
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, offset);
      if (bytesRead === 0) break;
      hash.update(buffer.subarray(0, bytesRead));
      offset += bytesRead;
    }
    const finalStat = await handle.stat();
    if (finalStat.dev !== opened.dev || finalStat.ino !== opened.ino || finalStat.nlink !== 1 || finalStat.size !== offset) {
      fail(`file changed while hashing: ${node.manifestPath}`);
    }
  } finally {
    await handle.close();
  }
  return { path: node.manifestPath, bytes: offset, sha256: hash.digest('hex') };
}

export async function inspectStaticTree(rootPath) {
  const root = await secureRoot(rootPath, 'source');
  const files = [];
  const directories = [{ path: '', mode: root.stat.mode & 0o7777 }];

  async function visit(segments) {
    const directoryPath = segments.length === 0 ? root.absolute : resolve(root.absolute, ...segments);
    const names = (await readdir(directoryPath)).sort(lexicalCompare);
    for (const name of names) {
      const childSegments = [...segments, name];
      const node = await secureNode(root, childSegments);
      if (node.kind === 'directory') {
        directories.push({ path: node.manifestPath, mode: node.stat.mode & 0o7777 });
        await visit(childSegments);
      } else {
        files.push({ node, mode: node.stat.mode & 0o7777 });
      }
    }
  }

  await visit([]);
  const entries = [];
  for (const file of files) entries.push(await hashValidatedFile(file.node));
  entries.sort((left, right) => lexicalCompare(left.path, right.path));
  files.sort((left, right) => lexicalCompare(left.node.manifestPath, right.node.manifestPath));
  directories.sort((left, right) => lexicalCompare(left.path, right.path));
  return {
    root,
    files,
    directories,
    manifest: { entry_count: entries.length, entries },
  };
}

export async function createStaticManifest(root) {
  return (await inspectStaticTree(root)).manifest;
}

export async function copyValidatedFile(sourceFile, destinationPath) {
  const source = await openValidatedFile(sourceFile.node);
  let destination;
  const buffer = Buffer.allocUnsafe(64 * 1024);
  let offset = 0;
  try {
    destination = await open(
      destinationPath,
      constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL,
      sourceFile.mode,
    );
    while (true) {
      const { bytesRead } = await source.handle.read(buffer, 0, buffer.length, offset);
      if (bytesRead === 0) break;
      let written = 0;
      while (written < bytesRead) {
        const result = await destination.write(buffer, written, bytesRead - written, offset + written);
        written += result.bytesWritten;
      }
      offset += bytesRead;
    }
    const finalSource = await source.handle.stat();
    if (finalSource.dev !== source.opened.dev || finalSource.ino !== source.opened.ino || finalSource.nlink !== 1 || finalSource.size !== offset) {
      fail(`file changed while copying: ${sourceFile.node.manifestPath}`);
    }
    await destination.chmod(sourceFile.mode);
  } finally {
    if (destination) await destination.close();
    await source.handle.close();
  }
}

export function assertFreshDestination(sourceRoot, destinationRoot) {
  const output = resolve(destinationRoot);
  if (output === sourceRoot.absolute || isWithin(sourceRoot.absolute, output)) {
    fail('destination must not be the source root or inside it');
  }
  return output;
}

export async function writeStaticManifest(root, destinationPath) {
  const destination = resolve(destinationPath);
  const parent = resolve(dirname(destination));
  await realpath(parent);
  const manifest = await createStaticManifest(root);
  await writeFile(destination, `${JSON.stringify(manifest, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
  return manifest;
}

async function main() {
  const [root, option, manifestPath] = process.argv.slice(2);
  if (!root) fail('usage: node scripts/static-manifest.mjs <root> [--write <manifest-path>]');
  if (option === undefined) {
    process.stdout.write(`${JSON.stringify(await createStaticManifest(root), null, 2)}\n`);
    return;
  }
  if (option !== '--write' || !manifestPath) fail('usage: node scripts/static-manifest.mjs <root> [--write <manifest-path>]');
  await writeStaticManifest(root, manifestPath);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch((error) => {
    process.stderr.write(`static manifest failed: ${error.message}\n`);
    process.exitCode = 1;
  });
}
