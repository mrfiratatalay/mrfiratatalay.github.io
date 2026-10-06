/**
 * Görev belgesi 18 ve 22.2: arama sonuçları, taslakların bulunmaması ve modal davranışı.
 */
import { expect, test, type Page } from '@playwright/test';

async function openSearch(page: Page) {
  const button = page.getByRole('button', { name: 'Sitede ara', exact: true });
  await button.click();
  const dialog = page.getByRole('dialog', { name: 'Sitede ara' });
  await expect(dialog).toBeVisible();
  return { button, dialog, input: dialog.getByRole('searchbox', { name: 'Aranacak kelime' }) };
}

test('arama makale ve notları bulur; sonuç gerçek adresi açar', async ({ page }) => {
  await page.goto('/');
  const { dialog, input } = await openSearch(page);
  await expect(input).toBeFocused();
  await input.fill('interface');
  await expect(dialog.getByRole('status')).toContainText('sonuç bulundu');
  await expect(dialog.getByRole('link', { name: /Örnek not: Java'da interface/ })).toBeVisible();
  await expect(dialog.getByRole('link', { name: /Interface: davranış sözleşmesi/ })).toBeVisible();

  await input.fill('controller');
  const result = dialog.getByRole('link', { name: /Örnek yazı: Bu sitede/ });
  await expect(result).toBeVisible();
  await expect(result).toContainText('Makale');
  await result.click();
  await expect(page).toHaveURL(/\/blog\/ornek-yazi-nasil-gorunur\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Örnek yazı/);
});

test('taslak, hariç tutulan ve yayınlanmamış metinler aramada bulunmaz', async ({ page }) => {
  for (const word of ['taslakdeneme', 'kirmizibalon', 'morkaplumbaga']) {
    await page.goto(`/arama/?q=${word}`);
    await expect(page.getByRole('status')).toContainText('sonuç bulunamadı');
  }
});

test('arama sayfası adres çubuğundaki sorguyu kullanır', async ({ page }) => {
  await page.goto('/arama/?q=docker');
  await expect(page.getByRole('searchbox', { name: 'Aranacak kelime' })).toHaveValue('docker');
  await expect(page.getByRole('status')).toContainText('sonuç bulundu');
  await expect(page.locator('.search-result').first()).toBeVisible();
});

test('arama penceresi: odak içeride kalır, Escape kapatır, odak açan düğmeye döner', async ({ page, browserName }) => {
  await page.goto('/blog/');
  const { button, dialog } = await openSearch(page);
  const steps = browserName === 'webkit' ? 3 : 6;
  for (let index = 0; index < steps; index += 1) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(button).toBeFocused();
});

test('arama kapatma düğmesi ve arka plana tıklama pencereyi kapatır', async ({ page }) => {
  await page.goto('/');
  const first = await openSearch(page);
  await first.dialog.getByRole('button', { name: 'Aramayı kapat' }).click();
  await expect(first.dialog).toBeHidden();
  const second = await openSearch(page);
  await page.mouse.click(5, 5);
  await expect(second.dialog).toBeHidden();
});
