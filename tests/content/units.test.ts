/**
 * Küçük birimler: adres üretimi, seri adresleri, pencere sınırları ve eşzamanlı indirme sınırı.
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { fetchWithRetry, mapWithConcurrency } from '../../scripts/lib/fetchers.ts';
import { isValidNoteSlug, notePathToSlug, slugify } from '../../src/lib/content/slug.ts';
import { contentRefToPath, parseContentPath } from '../../src/lib/content/urls.ts';
import { clampRect, maximizedRect, moveRect, resizeRect } from '../../src/lib/window-manager/bounds.ts';

describe('adres üretimi', () => {
  test('Türkçe harfler tutarlı dönüştürülür', () => {
    assert.equal(slugify('İstanbul’da Çalışma Şekli'), 'istanbul-da-calisma-sekli');
    assert.equal(slugify('ĞÜŞİÖÇ ğüşıöç'), 'gusioc-gusioc');
    assert.equal(slugify('Spring Boot & Docker'), 'spring-boot-ve-docker');
    assert.equal(slugify('  --- '), '');
  });

  test('dosya yolundan kararlı not adresi üretilir (büyük harfli uzantı dahil)', () => {
    const fallback = () => 'bolum';
    assert.equal(notePathToSlug('chapters/Chapter 2/Part-3.md', fallback), 'chapters/chapter-2/part-3');
    assert.equal(notePathToSlug('00-WEEK/00/00.MD', fallback), '00-week/00/00');
    assert.equal(notePathToSlug('notlar/—.md', fallback), 'notlar/bolum');
    assert.ok(isValidNoteSlug('a/b-c/d1'));
    assert.ok(!isValidNoteSlug('a//b'));
  });

  test('seri adresleri içerik referansına çevrilir', () => {
    assert.deepEqual(parseContentPath('/blog/spring-boot-controller/'), { kind: 'blog', slug: 'spring-boot-controller' });
    assert.deepEqual(parseContentPath('https://mrfiratatalay.github.io/notlar/docker-notlari/chapters/part-3/'), {
      kind: 'note',
      sourceId: 'docker-notlari',
      slug: 'chapters/part-3',
    });
    assert.equal(parseContentPath('/hakkimda/'), null);
    assert.equal(contentRefToPath({ kind: 'note', sourceId: 'yerel', slug: 'java-interface' }), '/notlar/yerel/java-interface/');
  });
});

describe('pencere sınırları', () => {
  const area = { width: 1200, height: 800 };

  test('başlık çubuğu ekran dışına kaçmaz', () => {
    assert.deepEqual(moveRect({ x: 100, y: 100, width: 600, height: 400 }, -2000, -2000, area), {
      x: 120 - 600,
      y: 0,
      width: 600,
      height: 400,
    });
    const low = moveRect({ x: 100, y: 100, width: 600, height: 400 }, 5000, 5000, area);
    assert.equal(low.x, 1200 - 120);
    assert.equal(low.y, 800 - 44);
  });

  test('ekran daralınca pencere boyutu yeniden sınırlanır', () => {
    const rect = clampRect({ x: 700, y: 300, width: 1100, height: 760 }, { width: 800, height: 600 });
    assert.equal(rect.width, 800);
    assert.equal(rect.height, 600);
    assert.ok(rect.x <= 800 - 120);
    assert.ok(rect.y <= 600 - 44);
  });

  test('boyutlandırma alanın dışına taşmaz ve en küçük ölçünün altına inmez', () => {
    const grown = resizeRect({ x: 200, y: 100, width: 600, height: 400 }, 5000, 5000, area);
    assert.equal(grown.width, 1000);
    assert.equal(grown.height, 700);
    const shrunk = resizeRect({ x: 0, y: 0, width: 600, height: 400 }, -5000, -5000, area);
    assert.equal(shrunk.width, 360);
    assert.equal(shrunk.height, 240);
  });

  test('büyütülmüş pencere kullanılabilir alanı doldurur', () => {
    assert.deepEqual(maximizedRect(area), { x: 8, y: 8, width: 1184, height: 784 });
  });
});

describe('kaynak indirme', () => {
  test('aynı anda en fazla belirtilen sayıda kaynak indirilir', async () => {
    let active = 0;
    let peak = 0;
    const results = await mapWithConcurrency([1, 2, 3, 4, 5, 6, 7], 2, async (value) => {
      active += 1;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, 10));
      active -= 1;
      if (value === 4) throw new Error('dört');
      return value * 2;
    });
    assert.equal(peak, 2);
    assert.equal(results.filter((result) => result.status === 'rejected').length, 1);
    assert.deepEqual(results[0], { status: 'fulfilled', value: 2 });
  });

  test('sınırlı tekrar denemeden sonra hata bildirilir', async () => {
    let attempts = 0;
    await assert.rejects(
      fetchWithRetry(
        async () => {
          attempts += 1;
          throw new Error('erişilemedi');
        },
        { repository: 'a/b', branch: 'main', destination: '/tmp/olmayan-klasor-testi', timeoutMs: 1000 },
        1,
        () => undefined,
      ),
      /erişilemedi/,
    );
    assert.equal(attempts, 2);
  });
});
