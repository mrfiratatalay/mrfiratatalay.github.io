/**
 * Görev belgesi 22.1 senaryo 11–12: taslak eksik bilgiyle kaydedilebilir,
 * yayına açılmış eksik içerik yakalanır. Ayrıca adres çakışması ve seri kontrolü.
 */
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, test } from 'node:test';
import { validateContent } from '../../scripts/lib/validate.ts';
import { PROJECT_ROOT } from './helpers.ts';

async function createRoot(files: Record<string, string>, series: unknown = { series: [] }): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'icerik-kontrol-'));
  const profile = JSON.parse(await readFile(path.join(PROJECT_ROOT, 'src/data/profile.json'), 'utf8'));
  profile.avatar = '';
  const base: Record<string, string> = {
    'src/data/taxonomy.json': await readFile(path.join(PROJECT_ROOT, 'src/data/taxonomy.json'), 'utf8'),
    'src/data/profile.json': JSON.stringify(profile),
    'src/data/series.json': JSON.stringify(series),
  };
  for (const [file, content] of Object.entries({ ...base, ...files })) {
    const target = path.join(root, file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
  }
  return root;
}

const post = (frontmatter: string, body = '') => `---\n${frontmatter}\n---\n\n${body}`;

describe('içerik kontrolü', () => {
  test('11. eksik bilgi içeren taslak kaydedilebilir (hata vermez)', async () => {
    const root = await createRoot({
      'src/content/blog/taslak.md': post('title: Yarım kalan fikir\nurlSlug: yarim-kalan-fikir\npublished: false'),
      'src/content/notes/taslak-not.md': post('title: Taslak not\nurlSlug: taslak-not'),
    });
    const result = validateContent(root);
    assert.deepEqual(result.errors, []);
    assert.equal(result.counts.blogPublished, 0);
  });

  test('12. yayına açılmış fakat gerekli bilgisi eksik makale yakalanır', async () => {
    const root = await createRoot({
      'src/content/blog/eksik.md': post('title: Eksik yazı\nurlSlug: eksik-yazi\npublished: true\ncover: /images/blog/yok.png'),
    });
    const { errors } = validateContent(root);
    const text = errors.join('\n');
    assert.match(text, /kısa açıklama eksik/);
    assert.match(text, /yayın tarihi eksik/);
    assert.match(text, /kategori seçilmemiş/);
    assert.match(text, /yazının içeriği boş/);
    assert.match(text, /alternatif metin\) eksik/);
    assert.match(text, /Kapak görseli bulunamadı/);
  });

  test('geçersiz tarih ve tanımsız kategori sessizce düzeltilmez', async () => {
    const root = await createRoot({
      'src/content/blog/a.md': post(
        'title: A\nurlSlug: a\npublished: true\ndescription: Açıklama\npublishedAt: 2026-13-45\ncategory: java',
        'Metin',
      ),
      'src/content/blog/b.md': post(
        'title: B\nurlSlug: b\npublished: true\ndescription: Açıklama\npublishedAt: 2026-10-06\ncategory: olmayan',
        'Metin',
      ),
    });
    const text = validateContent(root).errors.join('\n');
    assert.match(text, /a\.md: .*publishedAt/);
    assert.match(text, /"olmayan" kategorisi/);
  });

  test('aynı yazı adresi iki yazıda kullanılırsa yakalanır', async () => {
    const full = (title: string) =>
      post(`title: ${title}\nurlSlug: ayni-adres\npublished: true\ndescription: Açıklama\npublishedAt: 2026-10-06\ncategory: genel`, 'Metin');
    const root = await createRoot({ 'src/content/blog/a.md': full('A'), 'src/content/blog/b.md': full('B') });
    assert.match(validateContent(root).errors.join('\n'), /Aynı yazı adresi \(\/blog\/ayni-adres\/\)/);
  });

  test('yayındaki seri, yayında olmayan içeriğe bağlanamaz', async () => {
    const root = await createRoot(
      { 'src/content/blog/taslak.md': post('title: Taslak\nurlSlug: taslak\npublished: false') },
      {
        series: [
          { id: 'seri', title: 'Seri', published: true, chapters: [{ title: 'C1', parts: [{ ref: '/blog/taslak/' }] }] },
        ],
      },
    );
    assert.match(validateContent(root).errors.join('\n'), /"\/blog\/taslak\/" adresi yayınlanmış bir içeriğe karşılık gelmiyor/);
  });

  test('Pages CMS kategori seçenekleri taxonomy.json ile aynı olmalı', async () => {
    const root = await createRoot({
      '.pages.yml': [
        'content:',
        '  - name: blog',
        '    fields:',
        '      - name: category',
        '        type: select',
        '        options:',
        '          values:',
        '            - name: java',
        '              label: Java',
      ].join('\n'),
    });
    assert.match(validateContent(root).errors.join('\n'), /kategori seçenekleri src\/data\/taxonomy\.json ile aynı değil \(eksik: spring-boot, docker, genel\)/);
  });

  test('projedeki javascript: bağlantısı reddedilir', async () => {
    const root = await createRoot({
      'src/content/projects/p.md': post('title: P\nurlSlug: p\nsummary: Özet\nrepoUrl: "javascript:alert(1)"\npublished: true', 'Metin'),
    });
    assert.match(validateContent(root).errors.join('\n'), /http:\/\/ veya https:\/\//);
  });

  test('gerçek site içeriği kontrolden geçer', () => {
    const result = validateContent(PROJECT_ROOT);
    assert.deepEqual(result.errors, []);
  });
});
