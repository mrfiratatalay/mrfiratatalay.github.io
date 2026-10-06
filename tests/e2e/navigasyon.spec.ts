/**
 * Görev belgesi 22.2: gezinme, doğrudan adres, yenileme, geri/ileri, 404 ve JavaScript kapalı okuma.
 */
import { expect, test } from '@playwright/test';

const ARTICLE = '/blog/ornek-yazi-nasil-gorunur/';

test('masaüstünden Blog klasörünü açmak doğru pencereyi ve listeyi açar', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Masaüstü klasörleri' }).getByRole('link', { name: 'Blog' }).click();
  await expect(page).toHaveURL(/\/blog\/$/);
  await expect(page.locator('.window--main .window__title')).toContainText('Blog');
  await expect(page.getByRole('heading', { level: 1, name: 'Blog' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Örnek yazı: Bu sitede bir makale/ })).toBeVisible();
});

test('doğrudan makale adresi yazıyı ilk açılışta gösterir; yenilemede 404 olmaz', async ({ page }) => {
  const response = await page.goto(ARTICLE);
  expect(response?.status()).toBe(200);
  const heading = page.getByRole('heading', { level: 1 });
  await expect(heading).toHaveText(/Örnek yazı: Bu sitede bir makale nasıl görünür\?/);
  const reload = await page.reload();
  expect(reload?.status()).toBe(200);
  await expect(heading).toBeVisible();
});

test('sondaki eğik çizgi olmadan açılan adres doğru sayfaya yönlenir', async ({ page }) => {
  const response = await page.goto('/notlar/ornek-docker/chapters/chapter-1/part-1');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/part-1\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Docker nedir?');
});

test('tarayıcı geri/ileri düğmeleri içerik ve adresle tutarlı kalır', async ({ page }) => {
  await page.goto('/blog/');
  await page.getByRole('link', { name: /Örnek yazı: Bu sitede/ }).click();
  await expect(page).toHaveURL(/ornek-yazi-nasil-gorunur\/$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/blog\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blog');
  await page.goForward();
  await expect(page).toHaveURL(/ornek-yazi-nasil-gorunur\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Örnek yazı/);
});

test('yanlış adres gerçek 404 ve çalışan dönüş bağlantısı gösterir', async ({ page }) => {
  const response = await page.goto('/boyle-bir-sayfa-yok/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bu sayfa bulunamadı');
  await page.getByRole('link', { name: 'Masaüstüne dön' }).click();
  await expect(page).toHaveURL(/localhost:\d+\/$/);
});

test('taslak yazı ve taslak proje için sayfa üretilmez', async ({ request }) => {
  expect((await request.get('/blog/taslak-ornegi/')).status()).toBe(404);
  expect((await request.get('/projeler/advanced-dom-bankist/')).status()).toBe(404);
  expect((await request.get('/notlar/ornek-java/notes/01-temeller/gizli-taslak/')).status()).toBe(404);
  expect((await request.get('/notlar/ornek-java/notes/taslaklar/yarim-not/')).status()).toBe(404);
});

test('içe aktarılan notlar arasındaki bağlantı sitedeki not adresini açar', async ({ page }) => {
  await page.goto('/notlar/ornek-java/notes/01-temeller/degiskenler/');
  await page.getByRole('link', { name: 'Koşullar notuna' }).click();
  await expect(page).toHaveURL(/\/notlar\/ornek-java\/notes\/01-temeller\/kosullar\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Koşullar');
});

test.describe('JavaScript kapalıyken', () => {
  test.use({ javaScriptEnabled: false });

  test('ana yazı, tablo ve kod okunabilir', async ({ page }) => {
    await page.goto('/notlar/ornek-java/notes/01-temeller/degiskenler/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Değişkenler ve tipler');
    await expect(page.locator('.prose')).toContainText("Java'da her değişkenin bir tipi vardır");
    await expect(page.locator('.prose table')).toBeVisible();
    await expect(page.locator('.prose pre').first()).toContainText('String sehir');
  });
});
