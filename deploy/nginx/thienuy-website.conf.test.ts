import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const configuration = new URL('./thienuy-website.conf', import.meta.url);

describe('versioned production Nginx contract', () => {
  it('serves only the canonical immutable-release root with the required redirect and cache boundaries', async () => {
    const config = await readFile(configuration, 'utf8');

    expect(config).toContain('root /srv/thienuy-site/current;');
    expect(config).toMatch(/server_name thienuy\.edu\.vn www\.thienuy\.edu\.vn;/);
    expect(config).toContain('location ^~ /.well-known/acme-challenge/');
    expect(config).toContain('return 308 https://thienuy.edu.vn$request_uri;');
    expect(config).toMatch(/server_name www\.thienuy\.edu\.vn;/);
    expect(config).toContain('ssl_certificate /etc/letsencrypt/live/thienuy.edu.vn/fullchain.pem;');
    expect(config).toContain('ssl_certificate_key /etc/letsencrypt/live/thienuy.edu.vn/privkey.pem;');
    expect(config).toContain('include /etc/letsencrypt/options-ssl-nginx.conf;');
    expect(config).toContain('ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;');
    expect(config).toContain('Strict-Transport-Security "max-age=31536000" always;');
    expect(config).toMatch(/location ~\* \\.html\$/);
    expect(config).toContain('Cache-Control "no-cache" always;');
    expect(config).toContain('location ~* \\.(?:css|js|jpg|jpeg|png|gif|webp|svg|ico|woff|woff2)$');
    expect(config).toContain('expires 30d;');
    expect(config).toContain('location ~ /\\.(?!well-known/)');
    expect(config).toContain('deny all;');
    expect(config).toContain('try_files $uri $uri/ =404;');
    expect(config).not.toContain('/home/deploy');
    expect(config).not.toContain('-----BEGIN');
  });
});
