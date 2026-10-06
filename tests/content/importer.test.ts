/**
 * Görev belgesi 22.1 içerik/içe aktarma senaryoları (1–10) ve güvenlik kontrolleri.
 */
import assert from 'node:assert/strict';
import { readFile, rm, symlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, test } from 'node:test';
import { ImportError } from '../../scripts/lib/importer.ts';
import { MISSING_IMAGE_URL } from '../../src/lib/markdown/markers.ts';
import { createTestSite, source, tinyPng } from './helpers.ts';

async function expectImportError(promise: Promise<unknown>, pattern: RegExp): Promise<ImportError> {
  try {
    await promise;
  } catch (error) {
    assert.ok(error instanceof ImportError, `ImportError bekleniyordu: ${String(error)}`);
    const text = [error.message, ...error.problems].join('\n');
    assert.match(text, pattern);
    return error;
  }
  assert.fail('İçe aktarma hata vermeliydi.');
}

describe('not içe aktarma', () => {
  test('1. iki repoda aynı dosya adı çakışma oluşturmaz', async () => {
    const png = await tinyPng();
    const site = await createTestSite({
      'kisi/java': { 'notes/giris.md': '# Java girişi\n\nJava notu.\n\n![a](../img/ortak.png)\n', 'img/ortak.png': png },
      'kisi/docker': { 'notes/giris.md': '# Docker girişi\n\nDocker notu.\n\n![a](../img/ortak.png)\n', 'img/ortak.png': png },
    });
    await site.setConfig([source('java-kaynak', 'kisi/java'), source('docker-kaynak', 'kisi/docker', { category: 'docker' })]);
    await site.run();
    assert.deepEqual(await site.listGenerated(), ['docker-kaynak/notes/giris.md', 'java-kaynak/notes/giris.md']);
    assert.deepEqual(await site.listAssets(), ['docker-kaynak/img/ortak.png', 'java-kaynak/img/ortak.png']);
    assert.match(await site.readGenerated('notes/java-kaynak/notes/giris.md'), /title: Java girişi/);
    assert.match(await site.readGenerated('notes/docker-kaynak/notes/giris.md'), /title: Docker girişi/);
  });

  test('2 ve 5. Türkçe karakterli dosya ve görsel yolu işlenir, görsel siteye taşınır', async () => {
    const site = await createTestSite({
      'kisi/notlar': {
        'Haftalık Notlar/Değişkenler ve Tipler.md':
          '# Değişkenler\n\nMetin.\n\n![Şema](<görseller/şema 1.png>)\n\n[aç](g%C3%B6rseller/%C5%9Fema%201.png)\n',
        'Haftalık Notlar/görseller/şema 1.png': await tinyPng(),
      },
    });
    await site.setConfig([source('notlar', 'kisi/notlar')]);
    await site.run();
    const files = await site.listGenerated();
    assert.deepEqual(files, ['notlar/haftalik-notlar/degiskenler-ve-tipler.md']);
    const note = await site.readGenerated(`notes/${files[0]}`);
    assert.match(note, /!\[Şema\]\(<\/imported-assets\/notlar\/haftalik-notlar\/gorseller\/sema-1\.png>\)/);
    assert.match(note, /\[aç\]\(\/imported-assets\/notlar\/haftalik-notlar\/gorseller\/sema-1\.png\)/);
    assert.deepEqual(await site.listAssets(), ['notlar/haftalik-notlar/gorseller/sema-1.png']);
    const manifest = JSON.parse(await site.readGenerated('asset-manifest.json'));
    assert.equal(manifest['/imported-assets/notlar/haftalik-notlar/gorseller/sema-1.png'].original, 'Haftalık Notlar/görseller/şema 1.png');
  });

  test('3. iki dosyanın aynı adrese dönüşmesi yakalanır', async () => {
    const site = await createTestSite({
      'kisi/notlar': { 'notes/Ders 1.md': '# A\n\nbir', 'notes/ders-1.md': '# B\n\niki' },
    });
    await site.setConfig([source('notlar', 'kisi/notlar')]);
    await expectImportError(site.run(), /aynı adrese dönüşüyor.*addressMap/s);
  });

  test('3b. çakışma addressMap ile açıkça çözülebilir', async () => {
    const site = await createTestSite({
      'kisi/notlar': { 'notes/Ders 1.md': '# A\n\nbir', 'notes/ders-1.md': '# B\n\niki' },
    });
    await site.setConfig([source('notlar', 'kisi/notlar', { addressMap: { 'notes/Ders 1.md': 'notes/ders-bir' } })]);
    await site.run();
    assert.deepEqual(await site.listGenerated(), ['notlar/notes/ders-1.md', 'notlar/notes/ders-bir.md']);
  });

  test('4. göreli not bağlantısı doğru site adresine dönüşür', async () => {
    const site = await createTestSite({
      'kisi/notlar': {
        'chapters/chapter-1/part-1.md': '# Part 1\n\n[Sonraki](./part-2.md) ve [başlığa](part-2.md#kurulum-adımları)\n',
        'chapters/chapter-1/part-2.md': '# Part 2\n\n## Kurulum adımları\n\nmetin\n',
      },
    });
    await site.setConfig([source('docker-notlari', 'kisi/notlar')]);
    const report = await site.run();
    const note = await site.readGenerated('notes/docker-notlari/chapters/chapter-1/part-1.md');
    assert.match(note, /\[Sonraki\]\(\/notlar\/docker-notlari\/chapters\/chapter-1\/part-2\/\)/);
    // GitHub'ın ürettiği başlık kimliği (ı harfi korunur) olduğu gibi kalır.
    assert.match(note, /\[başlığa\]\(\/notlar\/docker-notlari\/chapters\/chapter-1\/part-2\/#kurulum-adımları\)/);
    assert.equal(report.sources[0]?.warnings.length, 0);
  });

  test('6. kod bloğundaki örnek metin bağlantı dönüştürmede değişmez', async () => {
    const body = [
      '# Kod',
      '',
      '[gerçek bağlantı](./diger.md)',
      '',
      '```markdown',
      '[örnek](./diger.md)',
      '![örnek](./yok.png)',
      '```',
      '',
      'Satır içi: `[x](./diger.md)` aynen kalır.',
      '',
    ].join('\n');
    const site = await createTestSite({ 'kisi/notlar': { 'a/kod.md': body, 'a/diger.md': '# Diğer\n\nmetin' } });
    await site.setConfig([source('notlar', 'kisi/notlar')]);
    await site.run();
    const note = await site.readGenerated('notes/notlar/a/kod.md');
    assert.match(note, /\[gerçek bağlantı\]\(\/notlar\/notlar\/a\/diger\/\)/);
    assert.ok(note.includes('```markdown\n[örnek](./diger.md)\n![örnek](./yok.png)\n```'), 'kod bloğu değişmemeli');
    assert.ok(note.includes('`[x](./diger.md)`'), 'satır içi kod değişmemeli');
  });

  test('7. hariç tutulan ve taslak işaretli dosya yayınlanmaz', async () => {
    const site = await createTestSite({
      'kisi/notlar': {
        'notes/acik.md': '# Açık\n\nyayında',
        'notes/private/gizli.md': '# Gizli\n\nyayınlanmamalı',
        'notes/taslak.md': '---\npublished: false\n---\n# Taslak\n\nyayınlanmamalı',
      },
    });
    await site.setConfig([source('notlar', 'kisi/notlar', { exclude: ['notes/private/**'] })]);
    const report = await site.run();
    assert.deepEqual(await site.listGenerated(), ['notlar/notes/acik.md']);
    assert.ok(report.sources[0]?.skipped.some((item) => item.path === 'notes/taslak.md'));
  });

  test('8. kaynak alınamadığında önceki içerik korunur, boş içerik yayınlanmaz', async () => {
    const site = await createTestSite({ 'kisi/notlar': { 'notes/a.md': '# A\n\nmetin' } });
    await site.setConfig([source('notlar', 'kisi/notlar')]);
    await site.run();
    const before = await site.listGenerated();
    const failing = async () => {
      throw new Error('ağ hatası: bağlantı kurulamadı');
    };
    await expectImportError(site.run(failing), /alınamadı.*ağ hatası.*notlar/s);
    assert.deepEqual(await site.listGenerated(), before);
    assert.match(await site.readGenerated('source-status.json'), /"noteCount": 1/);
  });

  test('9. başarılı tam taramada silinen not çıktıda kalmaz; ayardan çıkarılan kaynak temizlenir', async () => {
    const site = await createTestSite({
      'kisi/notlar': { 'notes/a.md': '# A\n\nmetin', 'notes/b.md': '# B\n\nmetin' },
      'kisi/diger': { 'x.md': '# X\n\nmetin', 'img.png': await tinyPng() },
    });
    await site.writeRepoFile('kisi/diger', 'x.md', '# X\n\n![g](img.png)');
    await site.setConfig([source('notlar', 'kisi/notlar'), source('diger', 'kisi/diger')]);
    await site.run();
    assert.equal((await site.listGenerated()).length, 3);
    assert.deepEqual(await site.listAssets(), ['diger/img.png']);

    await rm(path.join(site.repos['kisi/notlar'] ?? '', 'notes', 'b.md'));
    await site.setConfig([source('notlar', 'kisi/notlar')]);
    await site.run();
    assert.deepEqual(await site.listGenerated(), ['notlar/notes/a.md']);
    assert.deepEqual(await site.listAssets(), []);
  });

  test('10. metadata\'sız eski nota uydurma tarih verilmez', async () => {
    const site = await createTestSite({
      'kisi/notlar': { 'eski.md': 'Başlıksız eski bir not.\n', 'tarihli.md': '---\ndate: 2025-05-04\n---\n# Tarihli\n\nmetin' },
    });
    await site.setConfig([source('notlar', 'kisi/notlar')]);
    await site.run();
    const old = await site.readGenerated('notes/notlar/eski.md');
    assert.doesNotMatch(old, /publishedAt|updatedAt/);
    assert.match(old, /title: eski/);
    assert.match(old, /published: true/);
    assert.match(await site.readGenerated('notes/notlar/tarihli.md'), /publishedAt: 2025-05-04/);
  });

  test('include seçimi hiçbir dosyayla eşleşmezse sessizce başarılı olmaz', async () => {
    const site = await createTestSite({ 'kisi/notlar': { 'docs/a.md': '# A\n\nmetin' } });
    await site.setConfig([source('notlar', 'kisi/notlar', { include: ['notes/**/*.md'] })]);
    await expectImportError(site.run(), /include seçimine uyan Markdown dosyası bulunamadı/);
  });

  test('repo dışına çıkan ve bilgisayardaki mutlak yollar okunmaz', async () => {
    const site = await createTestSite({
      'kisi/notlar': {
        'notes/a.md': '# A\n\n![dışarı](../../../../etc/hosts.png)\n\n![indirilenler](/Users/birisi/Downloads/diyagram.png)\n',
      },
    });
    await site.setConfig([source('notlar', 'kisi/notlar')]);
    const report = await site.run();
    const note = await site.readGenerated('notes/notlar/notes/a.md');
    assert.equal(note.split(MISSING_IMAGE_URL).length - 1, 2);
    assert.deepEqual(await site.listAssets(), []);
    assert.equal(report.sources[0]?.warnings.length, 2);
  });

  test('repo dışını gösteren sembolik bağlantılar okunmaz', async () => {
    const site = await createTestSite({ 'kisi/notlar': { 'notes/a.md': '# A\n\n![g](gorsel.png)\n' } });
    const outsideNote = path.join(site.root, 'dis-dosya.md');
    const outsideImage = path.join(site.root, 'dis-gorsel.png');
    await writeFile(outsideNote, '# Gizli\n\nrepo dışı gizli metin');
    await writeFile(outsideImage, await tinyPng());
    const repo = site.repos['kisi/notlar'] ?? '';
    await symlink(outsideNote, path.join(repo, 'notes', 'b.md'));
    await symlink(outsideImage, path.join(repo, 'notes', 'gorsel.png'));
    await site.setConfig([source('notlar', 'kisi/notlar')]);
    await site.run();
    assert.deepEqual(await site.listGenerated(), ['notlar/notes/a.md']);
    assert.deepEqual(await site.listAssets(), []);
    assert.match(await site.readGenerated('notes/notlar/notes/a.md'), new RegExp(MISSING_IMAGE_URL));
  });

  test('boyut sınırı aşıldığında dosya sessizce atlanmaz, raporlanır', async () => {
    const site = await createTestSite({ 'kisi/notlar': { 'notes/buyuk.md': `# Büyük\n\n${'a'.repeat(5000)}` } });
    await site.setConfig([source('notlar', 'kisi/notlar')], { maxMarkdownBytes: 1000 });
    await expectImportError(site.run(), /tek Markdown dosyası sınırı/);
  });

  test('SVG görseller betik çalıştırılamasın diye PNG\'ye dönüştürülür; geniş görsel küçültülür', async () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"><script>alert(1)</script><rect width="40" height="20" fill="red"/></svg>';
    const site = await createTestSite({
      'kisi/notlar': {
        'a.md': '# A\n\n![svg](sema.svg)\n\n![geniş](genis.png)\n',
        'sema.svg': svg,
        'genis.png': await tinyPng(3000, 10),
      },
    });
    await site.setConfig([source('notlar', 'kisi/notlar')], { maxImageWidth: 1600 });
    await site.run();
    assert.deepEqual(await site.listAssets(), ['notlar/genis.png', 'notlar/sema.png']);
    const manifest = JSON.parse(await site.readGenerated('asset-manifest.json'));
    assert.equal(manifest['/imported-assets/notlar/genis.png'].width, 1600);
    const png = await readFile(path.join(site.root, 'public', 'imported-assets', 'notlar', 'sema.png'));
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
  });

  test('ilk H1 sayfa başlığı olur ve gövdeden çıkarılır; Türkçe "İ" başlık bağlantısı düzeltilir', async () => {
    const site = await createTestSite({
      'kisi/notlar': {
        'a.md': '# İlk not\n\n## İlkel tipler\n\nmetin\n\n[git](#ilkel-tipler) [başa](#ilk-not)\n',
      },
    });
    await site.setConfig([source('notlar', 'kisi/notlar')]);
    const report = await site.run();
    const note = await site.readGenerated('notes/notlar/a.md');
    assert.match(note, /title: İlk not/);
    assert.doesNotMatch(note, /^# İlk not/m);
    assert.match(note, /\[git\]\(#i%CC%87lkel-tipler\)/);
    assert.match(note, /\[başa\]\(#\)/);
    assert.equal(report.sources[0]?.warnings.length, 1);
  });

  test('geçersiz kaynak ayarı anlaşılır hata verir', async () => {
    const site = await createTestSite({});
    await site.setConfig([source('yerel', 'kisi/notlar'), source('iki', 'kötü repo adı')]);
    await expectImportError(site.run(), /yerel.*ayrılmıştır[\s\S]*kullanici\/repo/);
  });
});
