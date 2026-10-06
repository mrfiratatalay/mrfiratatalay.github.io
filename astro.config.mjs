// @ts-check
import { fileURLToPath } from 'node:url';
import { unified } from '@astrojs/markdown-remark';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { contentRehypePlugins } from './src/lib/markdown/pipeline.ts';

/**
 * Kullanıcı sitesi deposu (`mrfiratatalay.github.io`) kök adreste yayınlanır;
 * bu yüzden `base` ayarı gerekmez.
 */
const SITE = 'https://mrfiratatalay.github.io';

/** Arama motorlarına bildirilmeyecek yardımcı sayfalar. */
const SITEMAP_EXCLUDED_PATHS = ['/arama/', '/404/', '/404.html', '/en/search/', '/en/404/'];

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'always',
  // HTML boşluk kuralları (Astro 7 varsayılanı olan JSX kuralları yerine).
  compressHTML: true,
  integrations: [
    react(),
    sitemap({
      filter: (page) => !SITEMAP_EXCLUDED_PATHS.some((path) => new URL(page).pathname === path),
    }),
  ],
  markdown: {
    // Astro 7'nin varsayılan işlemcisi Sätteri'dir. Ham HTML'i GitHub kurallarıyla
    // temizleyen rehype-sanitize gibi olgun eklentiler için resmî unified işlemcisi seçildi.
    processor: unified({
      // Metin yazıldığı gibi kalır (tırnak ve tireler otomatik değiştirilmez); başlık
      // kimlikleri de GitHub'daki kimliklerle aynı olur.
      smartypants: false,
      remarkRehype: {
        footnoteLabel: 'Dipnotlar',
        footnoteBackLabel: 'İçeriğe geri dön',
      },
      rehypePlugins: contentRehypePlugins({
        publicDir: fileURLToPath(new URL('./public', import.meta.url)),
        assetManifestPath: fileURLToPath(new URL('./generated/asset-manifest.json', import.meta.url)),
        siteHost: new URL(SITE).host,
      }),
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    },
  },
});
