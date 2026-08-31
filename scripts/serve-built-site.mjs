import { constants } from 'node:fs';
import { lstat, open, realpath } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

function isWithin(root, candidate) {
  return candidate === root || candidate.startsWith(`${root}${sep}`);
}

function requestSegments(rawUrl) {
  const rawPath = (rawUrl ?? '/').split(/[?#]/, 1)[0];
  let decoded;
  try {
    decoded = decodeURIComponent(rawPath);
  } catch {
    return null;
  }
  if (!decoded.startsWith('/') || decoded.includes('\0')) return null;
  const segments = decoded.replace(/\\/g, '/').split('/').filter(Boolean);
  if (segments.some((segment) => segment === '.' || segment === '..')) return null;
  return segments.length === 0 ? ['index.html'] : segments;
}

function notFound(response) {
  response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Not found');
}

async function serve(root, request, response) {
  const rootStat = await lstat(root).catch(() => null);
  if (!rootStat?.isDirectory() || rootStat.isSymbolicLink()) {
    response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' }).end('Static root is unavailable');
    return;
  }
  const rootReal = await realpath(root);
  const segments = requestSegments(request.url);
  if (!segments) return notFound(response);
  const candidate = resolve(root, ...segments);
  if (!isWithin(root, candidate)) return notFound(response);
  const candidateStat = await lstat(candidate).catch(() => null);
  if (!candidateStat?.isFile() || candidateStat.isSymbolicLink() || candidateStat.nlink !== 1) return notFound(response);
  const candidateReal = await realpath(candidate).catch(() => null);
  if (!candidateReal || !isWithin(rootReal, candidateReal)) return notFound(response);
  const handle = await open(candidate, constants.O_RDONLY | constants.O_NOFOLLOW).catch(() => null);
  if (!handle) return notFound(response);
  const opened = await handle.stat();
  if (!opened.isFile() || opened.nlink !== 1 || opened.dev !== candidateStat.dev || opened.ino !== candidateStat.ino) {
    await handle.close();
    return notFound(response);
  }
  response.writeHead(200, {
    'cache-control': 'no-store',
    'content-type': MIME_TYPES[extname(candidate).toLowerCase()] ?? 'application/octet-stream',
  });
  handle.createReadStream({ autoClose: true }).pipe(response);
}

export function createStaticServer(rootPath) {
  const root = resolve(rootPath);
  return createServer((request, response) => {
    void serve(root, request, response).catch(() => {
      if (!response.headersSent) response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('Internal server error');
    });
  });
}
