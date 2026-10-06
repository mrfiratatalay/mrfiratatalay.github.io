import type { APIContext } from 'astro';
import { paths } from '../lib/content/urls.ts';

/**
 * Site haritasının tam adresi `site` ayarından üretilir; yanlış hesap adı kalmaz.
 * Arama sayfası robots.txt ile engellenmez; `noindex` etiketiyle dizin dışı tutulur.
 */
export function GET(context: APIContext) {
  const sitemap = new URL(paths.sitemap, context.site ?? 'https://mrfiratatalay.github.io');
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
