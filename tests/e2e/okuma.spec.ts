/**
 * Görev belgesi 7.3, 7.4 ve 22.2: telefonda okuma, taşma kontrolü, kod kopyalama ve bağlantı kopyalama.
 */
import { expect, test, type Page } from '@playwright/test';

const ROUTES = [
  '/',
  '/blog/',
  '/blog/ornek-yazi-nasil-gorunur/',
  '/notlar/',
  '/notlar/ornek-java/',
  '/notlar/ornek-docker/chapters/chapter-1/part-2/',
  '/projeler/',
  '/projeler/forkify/',
  '/hakkimda/',
  '/iletisim/',
  '/calismalar/',
  '/arama/',
];

async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

test('hiçbir sayfa yanlışlıkla yatay kaymaz', async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);
    expect(await horizontalOverflow(page), `${route} yatay taşıyor`).toBeLessThanOrEqual(0);
  }
});

test('geniş tablo ve kod bloğu kendi alanında kayar', async ({ page }) => {
  await page.goto('/notlar/ornek-docker/chapters/chapter-1/part-2/');
  const table = page.locator('.table-scroll').first();
  await expect(table).toHaveAttribute('role', 'region');
  const overflowX = await table.evaluate((element) => getComputedStyle(element).overflowX);
  expect(overflowX).toBe('auto');
  const pre = page.locator('.code-block pre').first();
  expect(await pre.evaluate((element) => getComputedStyle(element).overflowX)).toBe('auto');
});

test('telefonda dock yazının son satırını kapatmaz', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) >= 900, 'Telefon ve tablet düzeni');
  await page.goto('/blog/ornek-yazi-nasil-gorunur/');
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(150);
  const last = await page.locator('article.article > :last-child').boundingBox();
  const dock = await page.locator('.dock').boundingBox();
  if (!last || !dock) throw new Error('ölçü alınamadı');
  expect(last.y + last.height).toBeLessThanOrEqual(dock.y + 1);
});

test('kod kopyalama düğmesi kodu panoya kopyalar', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'Pano izni Chromium testinde verilir.');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/blog/ornek-yazi-nasil-gorunur/');
  const block = page.locator('figure.code-block').first();
  await expect(block.locator('.code-block__lang')).toHaveText('Java');
  const button = block.getByRole('button', { name: 'Kodu panoya kopyala' });
  await button.click();
  await expect(button).toHaveText('Kopyalandı');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('@RestController');
});

test('pano erişimi reddedilirse anlaşılır sonuç gösterilir', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('izin yok')) },
    });
    document.execCommand = () => false;
  });
  await page.goto('/blog/ornek-yazi-nasil-gorunur/');
  const button = page.locator('figure.code-block').first().getByRole('button', { name: 'Kodu panoya kopyala' });
  await button.click();
  await expect(button).toHaveText('Kopyalanamadı');
  await expect(page.getByRole('status').filter({ hasText: 'panoya erişime izin vermedi' })).toBeVisible();
});

test('yazının adresi kopyalanabilir', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'Pano izni Chromium testinde verilir.');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/blog/ornek-yazi-nasil-gorunur/');
  await page.getByRole('button', { name: 'Bağlantıyı kopyala' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'bağlantısı kopyalandı' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    'https://mrfiratatalay.github.io/blog/ornek-yazi-nasil-gorunur/',
  );
});

test('uzun yazıda içindekiler bulunur ve başlığa götürür', async ({ page, viewport }) => {
  await page.goto('/blog/ornek-yazi-nasil-gorunur/');
  const desktop = (viewport?.width ?? 0) >= 900;
  if (!desktop) await page.getByText(/İçindekiler \(\d+ başlık\)/).click();
  const toc = desktop
    ? page.getByRole('navigation', { name: 'İçindekiler', exact: true })
    : page.getByRole('navigation', { name: 'İçindekiler (kısa liste)' });
  await toc.getByRole('link', { name: 'Tablolar' }).click();
  await expect(page).toHaveURL(/#tablolar$/);
  await expect(page.getByRole('heading', { name: 'Tablolar' })).toBeInViewport();
});

test.describe('çok dar ekran ve büyük yazı', () => {
  test.use({ viewport: { width: 320, height: 640 } });

  test('320 px genişlikte ve büyük yazı ayarında taşma olmaz', async ({ page }) => {
    for (const route of ['/', '/blog/ornek-yazi-nasil-gorunur/', '/notlar/ornek-java/notes/01-temeller/degiskenler/', '/projeler/']) {
      await page.goto(route);
      expect(await horizontalOverflow(page), `${route} 320 px'te taşıyor`).toBeLessThanOrEqual(0);
      // Tarayıcıda varsayılan yazı boyutu %150 seçilmiş gibi
      await page.evaluate(() => {
        document.documentElement.style.fontSize = '150%';
      });
      expect(await horizontalOverflow(page), `${route} büyük yazıda taşıyor`).toBeLessThanOrEqual(0);
    }
  });
});
