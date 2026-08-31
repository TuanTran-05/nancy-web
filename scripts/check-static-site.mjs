import { constants } from 'node:fs';
import { lstat, open, readdir, realpath } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const CANONICAL_ORIGIN = 'https://thienuy.edu.vn';
const NO_FOLLOW = constants.O_NOFOLLOW;
const REFERENCE_EXTENSIONS = new Set(['.html', '.css', '.js', '.mjs']);

function extension(path) {
  const dot = path.lastIndexOf('.');
  return dot === -1 ? '' : path.slice(dot).toLowerCase();
}

function within(root, candidate) {
  return candidate === root || candidate.startsWith(`${root}${sep}`);
}

function issue(issues, code, path, detail) {
  issues.push({ code, path, detail });
}

function decode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

async function readRegularFile(path, expected) {
  const handle = await open(path, constants.O_RDONLY | NO_FOLLOW);
  try {
    const opened = await handle.stat();
    if (!opened.isFile() || opened.nlink !== 1 || opened.dev !== expected.dev || opened.ino !== expected.ino) {
      throw new Error('file changed or is unsafe during read');
    }
    const content = await handle.readFile({ encoding: 'utf8' });
    const final = await handle.stat();
    if (final.dev !== opened.dev || final.ino !== opened.ino || final.nlink !== 1 || final.size !== opened.size) {
      throw new Error('file changed while reading');
    }
    return content;
  } finally {
    await handle.close();
  }
}

async function collectFiles(rootPath, issues) {
  const root = resolve(rootPath);
  const rootStat = await lstat(root).catch((error) => {
    issue(issues, 'ROOT_MISSING', '.', error.code === 'ENOENT' ? 'root is missing' : error.message);
    return null;
  });
  if (!rootStat) return { root, real: root, files: new Map() };
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) {
    issue(issues, 'ROOT_UNSAFE', '.', 'root must be a non-symlink directory');
    return { root, real: root, files: new Map() };
  }
  const real = await realpath(root);
  const files = new Map();

  async function visit(absolute, relativePath) {
    const names = (await readdir(absolute)).sort();
    for (const name of names) {
      const childRelative = relativePath ? `${relativePath}/${name}` : name;
      const child = resolve(root, ...childRelative.split('/'));
      if (!within(root, child)) {
        issue(issues, 'NODE_PATH_TRAVERSAL', childRelative, 'lexical path escapes root');
        continue;
      }
      const stat = await lstat(child);
      if (stat.isSymbolicLink()) {
        issue(issues, 'NODE_SYMLINK', childRelative, 'symlinks are not allowed');
        continue;
      }
      const childReal = await realpath(child);
      if (!within(real, childReal)) {
        issue(issues, 'NODE_PATH_TRAVERSAL', childRelative, 'resolved path escapes root');
        continue;
      }
      if (stat.isDirectory()) {
        await visit(child, childRelative);
      } else if (!stat.isFile()) {
        issue(issues, 'NODE_SPECIAL', childRelative, 'only regular files are allowed');
      } else if (stat.nlink !== 1) {
        issue(issues, 'NODE_HARDLINK', childRelative, 'hard-linked files are not allowed');
      } else {
        files.set(childRelative, { absolute: child, stat });
      }
    }
  }

  await visit(root, '');
  return { root, real, files };
}

function referencesInHtml(content) {
  const values = [];
  for (const match of content.matchAll(/\b(?:href|src|poster|action)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'`=<>]+))/gi)) {
    values.push(match[1] ?? match[2] ?? match[3]);
  }
  for (const match of content.matchAll(/\bsrcset\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'`=<>]+))/gi)) {
    const value = match[1] ?? match[2] ?? match[3];
    for (const candidate of value.split(',')) values.push(candidate.trim().split(/\s+/)[0]);
  }
  for (const match of content.matchAll(/\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'`=<>]+))/gi)) values.push(...referencesInCss(match[1] ?? match[2] ?? match[3]));
  for (const match of content.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) values.push(...referencesInCss(match[1]));
  return values;
}

function referencesInCss(content) {
  const values = [];
  for (const match of content.matchAll(/(?:url\(\s*|@import\s+(?:url\(\s*)?)(["']?)([^"'()\s;]+)\1/gi)) values.push(match[2]);
  return values;
}

function referencesInJavaScript(content) {
  const values = [];
  for (const match of content.matchAll(/\b(?:import\s*(?:[^'"()]*)?\s*from\s*|import\s*\(|new\s+URL\s*\()(["'])(.*?)\1/gi)) values.push(match[2]);
  return values;
}

function idsInHtml(content) {
  return [...content.matchAll(/\bid\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'`=<>]+))/gi)].map((match) => match[1] ?? match[2] ?? match[3]);
}

function hrefParts(value) {
  const decoded = decode(value.trim());
  if (decoded === null) return { invalid: true };
  if (!decoded || decoded.startsWith('data:') || decoded.startsWith('mailto:') || decoded.startsWith('tel:') || decoded.startsWith('javascript:')) return { ignored: true };
  if (/^http:\/\//i.test(decoded)) return { insecure: true };
  if (/^https:\/\//i.test(decoded)) {
    let url;
    try {
      url = new URL(decoded);
    } catch {
      return { invalid: true };
    }
    if (url.origin !== CANONICAL_ORIGIN) return { external: true };
    return { path: url.pathname.replace(/\\/g, '/'), fragment: url.hash.slice(1) };
  }
  if (/^\/\//i.test(decoded)) return { external: true };
  const hash = decoded.indexOf('#');
  const withoutFragment = hash === -1 ? decoded : decoded.slice(0, hash);
  const fragment = hash === -1 ? '' : decoded.slice(hash + 1);
  const path = withoutFragment.split('?')[0].replace(/\\/g, '/');
  return { path, fragment };
}

function localTarget(currentPath, path) {
  if (!path || path === '/') return 'index.html';
  const normalized = path.startsWith('/') ? path.slice(1) : `${dirname(currentPath)}/${path}`;
  return normalized.replace(/\\/g, '/').replace(/^\.\//, '');
}

function traverses(path) {
  return path.replace(/\\/g, '/').split('/').some((segment) => segment === '..');
}

function canonicalIsValid(value, currentPath) {
  try {
    const url = new URL(value);
    const expectedPath = currentPath === 'index.html' ? '/' : `/${currentPath}`;
    return url.origin === CANONICAL_ORIGIN && url.pathname === expectedPath && !url.search && !url.hash;
  } catch {
    return false;
  }
}

function validateCanonicalAndSeo(path, content, issues) {
  const canonicals = [...content.matchAll(/<link\b(?=[^>]*\brel\s*=\s*(["'])canonical\1)(?=[^>]*\bhref\s*=\s*(["'])(.*?)\2)[^>]*>/gi)].map((match) => match[3]);
  if (canonicals.length !== 1 || !canonicalIsValid(canonicals[0], path)) {
    issue(issues, 'CANONICAL_INVALID', path, 'exactly one canonical URL must identify this page on https://thienuy.edu.vn');
  }
  if (!/<meta\b(?=[^>]*\bname\s*=\s*(["'])description\1)(?=[^>]*\bcontent\s*=\s*(["'])(?=\S).*?\2)[^>]*>/i.test(content)) {
    issue(issues, 'SEO_DESCRIPTION_MISSING', path, 'meta description is required');
  }
  if (!/<meta\b(?=[^>]*\bname\s*=\s*(["'])viewport\1)(?=[^>]*\bcontent\s*=\s*(["'])(?=\S).*?\2)[^>]*>/i.test(content)) {
    issue(issues, 'SEO_VIEWPORT_MISSING', path, 'viewport meta is required');
  }
}

function validateRobotsAndSitemap(files, issues) {
  const robots = files.get('robots.txt')?.content;
  const sitemapDirectives = robots
    ? robots.split(/\r?\n/).filter((line) => /^\s*sitemap\s*:/i.test(line))
    : [];
  if (sitemapDirectives.length !== 1 || !/^\s*sitemap\s*:\s*https:\/\/thienuy\.edu\.vn\/sitemap\.xml\s*$/i.test(sitemapDirectives[0] ?? '')) {
    issue(issues, 'ROBOTS_SITEMAP_INVALID', 'robots.txt', 'robots.txt must publish the HTTPS canonical sitemap');
  }
  const sitemap = files.get('sitemap.xml')?.content;
  if (!sitemap) {
    issue(issues, 'SITEMAP_MISSING', 'sitemap.xml', 'sitemap.xml is required');
    return;
  }
  for (const match of sitemap.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)) {
    try {
      const url = new URL(match[1]);
      if (url.origin !== CANONICAL_ORIGIN || url.search || url.hash) throw new Error('not canonical');
    } catch {
      issue(issues, 'SITEMAP_URL_INVALID', 'sitemap.xml', `invalid sitemap URL: ${match[1]}`);
    }
  }
}

export async function checkStaticSite(rootPath) {
  const issues = [];
  const tree = await collectFiles(rootPath, issues);
  const files = new Map();
  for (const [path, file] of tree.files) {
    try {
      files.set(path, { ...file, content: await readRegularFile(file.absolute, file.stat) });
    } catch (error) {
      issue(issues, 'NODE_READ_UNSAFE', path, error.message);
    }
  }

  const html = new Map([...files].filter(([path]) => extension(path) === '.html'));
  const ids = new Map();
  for (const [path, file] of html) {
    const pageIds = new Set();
    for (const id of idsInHtml(file.content)) {
      if (pageIds.has(id)) issue(issues, 'DUPLICATE_ID', path, `duplicate id: ${id}`);
      pageIds.add(id);
    }
    ids.set(path, pageIds);
    validateCanonicalAndSeo(path, file.content, issues);
  }

  const lowerPath = new Map([...files.keys()].map((path) => [path.toLowerCase(), path]));
  for (const [path, file] of files) {
    let references = [];
    if (extension(path) === '.html') references = referencesInHtml(file.content);
    if (extension(path) === '.css') references = referencesInCss(file.content);
    if (extension(path) === '.js' || extension(path) === '.mjs') references = referencesInJavaScript(file.content);
    for (const value of references) {
      const parts = hrefParts(value);
      if (parts.ignored || parts.external) continue;
      if (parts.invalid) {
        issue(issues, 'LOCAL_REFERENCE_INVALID', path, `malformed URL encoding: ${value}`);
        continue;
      }
      if (parts.insecure) {
        issue(issues, 'INSECURE_EXTERNAL_RESOURCE', path, `HTTP URL: ${value}`);
        continue;
      }
      if (traverses(parts.path)) {
        issue(issues, 'LOCAL_REFERENCE_TRAVERSAL', path, `path traversal: ${value}`);
        continue;
      }
      const target = localTarget(path, parts.path);
      if (parts.path && !files.has(target)) {
        if (lowerPath.has(target.toLowerCase())) issue(issues, 'LOCAL_REFERENCE_CASE_MISMATCH', path, `${value} should be ${lowerPath.get(target.toLowerCase())}`);
        else issue(issues, 'LOCAL_REFERENCE_MISSING', path, `missing local resource: ${value}`);
        continue;
      }
      if (parts.fragment) {
        const fragmentTarget = parts.path ? target : path;
        if (!ids.get(fragmentTarget)?.has(parts.fragment)) issue(issues, 'FRAGMENT_MISSING', path, `missing fragment #${parts.fragment} in ${fragmentTarget}`);
      }
    }
  }
  validateRobotsAndSitemap(files, issues);
  return { valid: issues.length === 0, issues };
}

async function main() {
  const root = process.argv[2] ?? 'dist';
  const result = await checkStaticSite(root);
  if (result.valid) {
    process.stdout.write(`Static site integrity passed: ${root}\n`);
    return;
  }
  for (const item of result.issues) process.stderr.write(`${item.code} ${item.path}: ${item.detail}\n`);
  process.exitCode = 1;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch((error) => {
    process.stderr.write(`static site integrity check failed: ${error.message}\n`);
    process.exitCode = 1;
  });
}
