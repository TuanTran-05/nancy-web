import { get } from 'node:http';
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createStaticServer } from './serve-built-site.mjs';

async function fixture(callback: (root: string) => Promise<void>) {
  const root = await mkdtemp(join(tmpdir(), 'thienuy-static-server-'));
  try {
    await callback(root);
  } finally {
    await rm(root, { force: true, recursive: true });
  }
}

function request(origin: string, path: string) {
  return new Promise<{ body: string; status: number }>((done, fail) => {
    const target = new URL(origin);
    get({ hostname: target.hostname, port: target.port, path }, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => done({ body, status: response.statusCode ?? 0 }));
    }).on('error', fail);
  });
}

describe('built static server', () => {
  it('serves only regular files physically contained in its root', async () => {
    await fixture(async (root) => {
      const payload = join(root, 'dist');
      const outside = join(root, 'outside');
      await mkdir(payload);
      await mkdir(outside);
      await writeFile(join(payload, 'index.html'), 'inside');
      await writeFile(join(outside, 'secret.txt'), 'outside');
      await symlink(join(outside, 'secret.txt'), join(payload, 'linked-file.txt'));
      await symlink(outside, join(payload, 'linked-directory'));
      const server = createStaticServer(payload);
      await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
      const address = server.address();
      if (!address || typeof address === 'string') throw new Error('static test server did not bind a TCP port');
      const origin = `http://127.0.0.1:${address.port}`;
      try {
        await expect(request(origin, '/index.html')).resolves.toEqual({ body: 'inside', status: 200 });
        await expect(request(origin, '/%2e%2e/outside/secret.txt')).resolves.toMatchObject({ status: 404 });
        await expect(request(origin, '/%5c..%5coutside%5csecret.txt')).resolves.toMatchObject({ status: 404 });
        await expect(request(origin, '/linked-file.txt')).resolves.toMatchObject({ status: 404 });
        await expect(request(origin, '/linked-directory/secret.txt')).resolves.toMatchObject({ status: 404 });
      } finally {
        await new Promise<void>((done, fail) => server.close((error) => error ? fail(error) : done()));
      }
    });
  });
});
