/**
 * Görev belgesi 22.3: yayın çıktısı kontrolleri (dist/ klasörü).
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const DIST = path.resolve('dist');
const SITE = 'https://mrfiratatalay.github.io';

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const htmlFiles = () => walk(DIST).filter((file) => file.endsWith('.html'));

test.describe('yayın çıktısı', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Çıktı kontrolü bir kez çalışır.');
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 900, 'Çıktı kontrolü bir kez çalışır.');

  test('yayınlanmış makale var, taslak için HTML yok', () => {
    expect(existsSync(path.join(DIST, 'blog/ornek-yazi-nasil-gorunur/index.html'))).toBe(true);
    expect(existsSync(path.join(DIST, 'blog/taslak-ornegi'))).toBe(false);
    expect(existsSync(path.join(DIST, 'projeler/advanced-dom-bankist'))).toBe(false);
  });

  test('site haritası, RSS ve arama aynı yayın filtresini kullanır', async ({ request }) => {
    const sitemapIndex = await (await request.get('/sitemap-index.xml')).text();
    expect(sitemapIndex).toContain(`${SITE}/sitemap-0.xml`);
    const sitemap = await (await request.get('/sitemap-0.xml')).text();
    expect(sitemap).toContain(`${SITE}/blog/ornek-yazi-nasil-gorunur/`);
    expect(sitemap).toContain(`${SITE}/notlar/yerel/ornek-java-interface/`);
    for (const hidden of ['taslak-ornegi', 'advanced-dom-bankist', '/arama/', '404']) {
      expect(sitemap).not.toContain(hidden);
    }
    const rss = await (await request.get('/rss.xml')).text();
    expect(rss).toContain(`${SITE}/blog/ornek-yazi-nasil-gorunur/`);
    expect(rss).not.toContain('taslak');
    expect(rss).not.toContain('/notlar/');

    const indexed = htmlFiles().filter((file) => readFileSync(file, 'utf8').includes('data-pagefind-body'));
    expect(indexed.some((file) => file.includes('taslak'))).toBe(false);
    expect((await request.get('/pagefind/pagefind.js')).status()).toBe(200);
  });

  test('robots.txt gerçek site haritası adresini gösterir', async ({ request }) => {
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toContain(`Sitemap: ${SITE}/sitemap-index.xml`);
  });

  test('canonical ve paylaşım adresleri gerçek hesap adını taşır; her sayfada tek H1 var', () => {
    for (const file of htmlFiles()) {
      const html = readFileSync(file, 'utf8');
      const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1] ?? '';
      expect(canonical.startsWith(`${SITE}/`), `${file}: ${canonical}`).toBe(true);
      expect(html).not.toContain('GITHUB_KULLANICI_ADI');
      expect(html).toMatch(/<meta property="og:url" content="https:\/\/mrfiratatalay\.github\.io\//);
      expect(html.match(/<h1[\s>]/g)?.length, `${file} tek H1 içermeli`).toBe(1);
    }
  });

  test('çıktıda gizli anahtar, token veya özel telefon numarası yok', () => {
    const SECRET_PATTERNS = [
      /gh[pousr]_[A-Za-z0-9]{36,}/,
      /github_pat_[A-Za-z0-9_]{60,}/,
      /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
      /AKIA[0-9A-Z]{16}/,
      /xox[baprs]-[A-Za-z0-9-]{10,}/,
      /\+90[\s-]?5\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/,
    ];
    const textFiles = walk(DIST).filter((file) => /\.(html|js|css|json|xml|txt)$/.test(file));
    for (const file of textFiles) {
      const text = readFileSync(file, 'utf8');
      for (const pattern of SECRET_PATTERNS) expect(pattern.test(text), `${file} içinde ${pattern}`).toBe(false);
    }
  });

  test('sayfalardaki yerel görseller gerçekten var', () => {
    for (const file of htmlFiles()) {
      const html = readFileSync(file, 'utf8');
      for (const match of html.matchAll(/<img[^>]+src="(\/[^"]+)"/g)) {
        const src = decodeURI(match[1] ?? '');
        expect(existsSync(path.join(DIST, src)), `${file}: ${src}`).toBe(true);
      }
    }
  });

  test('normal sayfa 200, bulunamayan adres 404 döndürür', async ({ request }) => {
    expect((await request.get('/notlar/ornek-java/notes/01-temeller/kosullar/')).status()).toBe(200);
    expect((await request.get('/notlar/ornek-java/olmayan-not/')).status()).toBe(404);
  });
});
