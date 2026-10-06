/**
 * Görev belgesi 8 ve 22.2: pencere düğmeleri, sürükleme, öne getirme ve okuma modu (masaüstü düzeni).
 */
import { expect, test, type Page } from '@playwright/test';

test.beforeEach(({ viewport }) => {
  test.skip((viewport?.width ?? 0) < 900, 'Pencere sürükleme ve küçültme masaüstü düzenine özeldir.');
});

const mainWindow = (page: Page) => page.locator('.window--main');

test('sarı düğme pencereyi küçültür, dock üzerinden geri açılır', async ({ page }) => {
  await page.goto('/blog/ornek-yazi-nasil-gorunur/');
  await page.getByRole('button', { name: 'Pencereyi küçült' }).click();
  await expect(mainWindow(page)).toBeHidden();
  const tile = page.getByRole('button', { name: 'Blog penceresini geri aç' });
  await expect(tile).toBeVisible();
  await expect(tile).toBeFocused();
  await tile.click();
  await expect(mainWindow(page)).toBeVisible();
  await expect(tile).toBeHidden();
});

test('yeşil düğme pencereyi büyütür ve önceki boyutuna döndürür', async ({ page }) => {
  await page.goto('/blog/');
  const before = await mainWindow(page).boundingBox();
  const zoom = page.getByRole('button', { name: 'Pencereyi büyüt' });
  await zoom.click();
  await expect(mainWindow(page)).toHaveAttribute('data-maximized', '');
  await expect(page.getByRole('button', { name: 'Pencereyi önceki boyutuna döndür' })).toHaveAttribute('aria-pressed', 'true');
  const workspace = await page.locator('[data-workspace]').boundingBox();
  const maximized = await mainWindow(page).boundingBox();
  expect(Math.round(maximized?.width ?? 0)).toBe(Math.round((workspace?.width ?? 0) - 16));
  await page.getByRole('button', { name: 'Pencereyi önceki boyutuna döndür' }).click();
  await expect(mainWindow(page)).not.toHaveAttribute('data-maximized', '');
  const restored = await mainWindow(page).boundingBox();
  expect(Math.round(restored?.width ?? 0)).toBe(Math.round(before?.width ?? 0));
});

test('kırmızı düğme ana pencereyi kapatıp masaüstüne döner', async ({ page }) => {
  await page.goto('/projeler/');
  await page.getByRole('link', { name: 'Pencereyi kapat ve masaüstüne dön' }).click();
  await expect(page).toHaveURL(/localhost:\d+\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Fırat Atalay' })).toBeVisible();
});

test('ana sayfadaki pencere kapatılınca dock üzerinden tekrar açılır', async ({ page }) => {
  await page.goto('/');
  const intro = page.locator('.window--intro');
  await page.getByRole('button', { name: 'Pencereyi kapat' }).click();
  await expect(intro).toBeHidden();
  await page.getByRole('navigation', { name: 'Dock' }).getByRole('link', { name: 'Masaüstü' }).click();
  await expect(intro).toBeVisible();
});

test('başlık çubuğu sürüklenir, ekran dışına kaçmaz; konum sayfalar arasında korunur', async ({ page }) => {
  await page.goto('/blog/');
  const bar = page.locator('.window--main .window__titlebar');
  const box = await bar.boundingBox();
  if (!box) throw new Error('başlık çubuğu bulunamadı');
  await page.mouse.move(box.x + box.width / 2, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 3000, box.y - 3000, { steps: 12 });
  await page.mouse.up();
  const after = await bar.boundingBox();
  const workspace = await page.locator('[data-workspace]').boundingBox();
  if (!after || !workspace) throw new Error('ölçü alınamadı');
  expect(after.y).toBeGreaterThanOrEqual(workspace.y - 1);
  expect(after.x + after.width).toBeGreaterThanOrEqual(workspace.x + 119);

  await page.getByRole('navigation', { name: 'Ana menü' }).getByRole('link', { name: 'Projeler' }).click();
  await expect(page).toHaveURL(/\/projeler\/$/);
  const moved = await page.locator('.window--main .window__titlebar').boundingBox();
  expect(Math.abs((moved?.x ?? 0) - after.x)).toBeLessThan(2);
  expect(Math.abs((moved?.y ?? 0) - after.y)).toBeLessThan(2);
});

test('pencere sağ alt köşeden boyutlandırılır ve çalışma alanına sığar', async ({ page }) => {
  await page.goto('/notlar/');
  const handle = page.locator('.window--main [data-window-resize]');
  const box = await handle.boundingBox();
  if (!box) throw new Error('boyutlandırma tutamacı bulunamadı');
  await page.mouse.move(box.x + 10, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(box.x - 300, box.y - 200, { steps: 8 });
  await page.mouse.up();
  const small = await mainWindow(page).boundingBox();
  expect(small?.width ?? 0).toBeGreaterThanOrEqual(360);
  await page.mouse.move((small?.x ?? 0) + (small?.width ?? 0) - 5, (small?.y ?? 0) + (small?.height ?? 0) - 5);
  await page.mouse.down();
  await page.mouse.move(5000, 5000, { steps: 8 });
  await page.mouse.up();
  const large = await mainWindow(page).boundingBox();
  const workspace = await page.locator('[data-workspace]').boundingBox();
  expect((large?.x ?? 0) + (large?.width ?? 0)).toBeLessThanOrEqual((workspace?.x ?? 0) + (workspace?.width ?? 0) + 1);
  expect((large?.y ?? 0) + (large?.height ?? 0)).toBeLessThanOrEqual((workspace?.y ?? 0) + (workspace?.height ?? 0) + 1);
});

test('aynı klasörü tekrar açmak mevcut pencereyi öne getirir, sayfayı yeniden yüklemez', async ({ page }) => {
  await page.goto('/blog/');
  await page.evaluate(() => {
    (window as unknown as { __isaret: string }).__isaret = 'ayni-sayfa';
  });
  await page.getByRole('button', { name: 'Pencereyi küçült' }).click();
  await expect(mainWindow(page)).toBeHidden();
  await page.getByRole('navigation', { name: 'Dock' }).getByRole('link', { name: 'Blog' }).click();
  await expect(mainWindow(page)).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { __isaret?: string }).__isaret)).toBe('ayni-sayfa');
});

test('okuma modu pencereyi büyütür ve tercih başka yazıda da korunur', async ({ page }) => {
  await page.goto('/blog/ornek-yazi-nasil-gorunur/');
  const toggle = page.getByRole('button', { name: 'Okuma modu' });
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-reading', '');
  await page.goto('/notlar/ornek-java/notes/01-temeller/degiskenler/');
  await expect(page.locator('html')).toHaveAttribute('data-reading', '');
  await expect(page.getByRole('button', { name: 'Okuma modu' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Okuma modu' }).click();
  await expect(page.locator('html')).not.toHaveAttribute('data-reading', '');
});
