import { chmod, lstat, mkdir, realpath } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  assertFreshDestination,
  copyValidatedFile,
  inspectStaticTree,
} from './static-manifest.mjs';

function fail(message) {
  throw new Error(message);
}

function manifestsMatch(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function modesMatch(left, right) {
  const leftModes = {
    directories: left.directories.map(({ path, mode }) => ({ path, mode })),
    files: left.files.map(({ node, mode }) => ({ path: node.manifestPath, mode })),
  };
  const rightModes = {
    directories: right.directories.map(({ path, mode }) => ({ path, mode })),
    files: right.files.map(({ node, mode }) => ({ path: node.manifestPath, mode })),
  };
  return JSON.stringify(leftModes) === JSON.stringify(rightModes);
}

export async function buildStaticSite({ sourceDir, outputDir }) {
  const source = await inspectStaticTree(sourceDir);
  const output = assertFreshDestination(source.root, outputDir);
  const parent = resolve(dirname(output));
  await realpath(parent);
  const existing = await lstat(output).catch((error) => (error.code === 'ENOENT' ? null : Promise.reject(error)));
  if (existing) fail(`destination already exists: ${outputDir}`);

  await mkdir(output, { mode: source.directories[0].mode });
  await chmod(output, source.directories[0].mode);
  for (const directory of source.directories.slice(1)) {
    const destination = resolve(output, ...directory.path.split('/'));
    await mkdir(destination, { mode: directory.mode });
    await chmod(destination, directory.mode);
  }
  for (const file of source.files) {
    const destination = resolve(output, ...file.node.manifestPath.split('/'));
    await copyValidatedFile(file, destination);
  }

  const sourceManifest = source.manifest;
  const outputTree = await inspectStaticTree(output);
  if (!manifestsMatch(sourceManifest, outputTree.manifest)) fail('copy-only build manifest mismatch');
  if (!modesMatch(source, outputTree)) fail('copy-only build filesystem mode mismatch');
}

async function main() {
  await buildStaticSite({ sourceDir: 'site', outputDir: 'dist' });
  process.stdout.write('Built dist from site with exact manifest equality.\n');
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch((error) => {
    process.stderr.write(`static build failed: ${error.message}\n`);
    process.exitCode = 1;
  });
}
