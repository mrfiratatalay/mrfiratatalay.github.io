/**
 * Astro'nun kullandığı Markdown hattı (unified + Shiki + eklentilerimiz) ile:
 * ham HTML temizliği, kod bloklarının korunması, başlık düzeni ve okuma eklemeleri.
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, test } from 'node:test';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { contentRehypePlugins } from '../../src/lib/markdown/pipeline.ts';
import { PROJECT_ROOT } from './helpers.ts';

const processor = await createMarkdownProcessor({
  smartypants: false,
  rehypePlugins: contentRehypePlugins({
    publicDir: path.join(PROJECT_ROOT, 'public'),
    siteHost: 'mrfiratatalay.github.io',
  }),
  shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false },
});

async function render(markdown: string) {
  return processor.render(markdown);
}

describe('Markdown hattı', () => {
  test('betik, olay öznitelikleri ve javascript: bağlantıları temizlenir; güvenli HTML kalır', async () => {
    const { code } = await render(
      [
        '<script>alert("x")</script>',
        '',
        '<details><summary>Aç</summary><kbd>Ctrl</kbd> <span onclick="alert(1)">tık</span> <img src="x" onerror="alert(1)"></details>',
        '',
        '[kötü](javascript:alert(1)) <a href="javascript:alert(2)">kötü2</a>',
        '',
        '<iframe src="https://example.com"></iframe>',
      ].join('\n'),
    );
    assert.doesNotMatch(code, /<script|onclick|onerror|javascript:|<iframe/i);
    assert.match(code, /<details><summary>Aç<\/summary><kbd>Ctrl<\/kbd>/);
  });

  test('kod blokları renkli kalır; dil adı ve kopyalama düğmesi eklenir', async () => {
    const { code } = await render('```java\nString ad = "<script>";\n```\n');
    assert.match(code, /<figure class="code-block" data-language="java">/);
    assert.match(code, /<span class="code-block__lang">Java<\/span>/);
    assert.match(code, /data-copy-code=""[^>]*hidden/);
    assert.match(code, /--shiki-light:/);
    assert.match(code, /&#x3C;script>|&lt;script&gt;/);
  });

  test('dil adı olmayan kod bloğunda "Kod" etiketi görünür', async () => {
    const { code } = await render('```\nJava\n  ↓\nSpring\n```\n');
    assert.match(code, /<span class="code-block__lang">Kod<\/span>/);
  });

  test('ham HTML içine yazılmış sahte yer tutucu kod bloğu getiremez', async () => {
    const { code } = await render(
      '```js\nconsole.log(1)\n```\n\n<site-highlighted-code data-code-index="0" data-code-nonce="tahmin"></site-highlighted-code>\n',
    );
    assert.equal(code.match(/<figure class="code-block"/g)?.length, 1);
    assert.doesNotMatch(code, /site-highlighted-code/);
  });

  test('metinde H1 varsa başlıklar bir seviye kaydırılır (sayfada tek H1 kalır)', async () => {
    const { code, metadata } = await render('# Bölüm\n\n## Alt bölüm\n\nmetin');
    assert.doesNotMatch(code, /<h1/);
    assert.match(code, /<h2 id="bölüm">Bölüm<\/h2>/);
    assert.match(code, /<h3 id="alt-bölüm">/);
    assert.deepEqual(
      metadata.headings.map((heading) => heading.depth),
      [2, 3],
    );
  });

  test('tablo kaydırılabilir alana alınır, dış bağlantı işaretlenir, kayıp görsel not olarak görünür', async () => {
    const { code } = await render(
      '| a | b |\n| - | - |\n| 1 | 2 |\n\n[dış](https://example.com) [iç](/blog/)\n\n![Eksik çizim](#gorsel-bulunamadi)\n',
    );
    assert.match(code, /<div class="table-scroll" role="region" tabindex="0" aria-label="[^"]+"><table>/);
    assert.match(code, /<a href="https:\/\/example.com" class="external-link">dış<\/a>/);
    assert.match(code, /<a href="\/blog\/">iç<\/a>/);
    assert.match(code, /<span class="missing-image" role="note">Görsel bulunamadı: Eksik çizim<\/span>/);
  });

  test('yerel görsele ölçü ve geç yükleme eklenir; açıklama yoksa dosya adından üretilir', async () => {
    const { code } = await render('![](/images/blog/ornek-istek-akisi.webp)');
    assert.match(code, /alt="ornek istek akisi"/);
    assert.match(code, /loading="lazy"/);
    assert.match(code, /width="1200" height="500"/);
  });

  test('Türkçe metin yazıldığı gibi kalır (akıllı tırnak dönüştürmesi yok)', async () => {
    const { code } = await render("Spring Boot'ta \"controller\" -- deneme");
    assert.match(code, /Spring Boot'ta "controller" -- deneme/);
  });
});
