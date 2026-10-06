#!/usr/bin/env node
/**
 * Tarayıcı testleri için GitHub Pages davranışını taklit eden küçük statik sunucu:
 * - `/klasor` -> 301 -> `/klasor/`
 * - `/klasor/` -> `/klasor/index.html`
 * - bulunamayan adres -> `404.html`, durum kodu 404
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'dist');
const port = Number(process.env.PORT ?? 4322);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.pdf': 'application/pdf',
};

function send(res, status, file) {
  res.writeHead(status, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
}

createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${port}`);
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    pathname = '/';
  }
  const target = path.join(root, pathname);
  if (!target.startsWith(root)) {
    send(res, 404, path.join(root, '404.html'));
    return;
  }
  if (existsSync(target) && statSync(target).isDirectory()) {
    if (!pathname.endsWith('/')) {
      res.writeHead(301, { Location: `${url.pathname}/${url.search}` });
      res.end();
      return;
    }
    const index = path.join(target, 'index.html');
    if (existsSync(index)) {
      send(res, 200, index);
      return;
    }
  } else if (existsSync(target)) {
    send(res, 200, target);
    return;
  }
  send(res, 404, path.join(root, '404.html'));
}).listen(port, () => {
  console.log(`dist/ http://localhost:${port} adresinde sunuluyor`);
});
