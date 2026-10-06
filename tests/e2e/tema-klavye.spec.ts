/**
 * Görev belgesi 8 ve 22.2: tema tercihi, klavye ile kullanım ve erişilebilirlik denetimi (axe).
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('tema değişir, okunabilir kalır ve tercih korunur', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  const before = await html.getAttribute('data-theme');
  await page.getByRole('button', { name: /temaya geç/ }).click();
  const after = await html.getAttribute('data-theme');
  expect(after).not.toBe(before);
  await page.reload();
  await expect(html).toHaveAttribute('data-theme', after ?? '');
});

test('tema kaydedilemese de site kullanılabilir', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error('depolama kapalı');
    };
  });
  await page.goto('/');
  const html = page.locator('html');
  const before = await html.getAttribute('data-theme');
  await page.getByRole('button', { name: /temaya geç/ }).click();
  await expect(html).not.toHaveAttribute('data-theme', before ?? '');
});

test('klavye: "İçeriğe geç" bağlantısı görünür, içeriğe götürür; odak görünür', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', "Safari varsayılan ayarında Tab bağlantılara gitmez.");
  await page.goto('/blog/ornek-yazi-nasil-gorunur/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'İçeriğe geç' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page.locator('#icerik')).toBeFocused();
  await page.keyboard.press('Tab');
  const outline = await page.evaluate(() => {
    const element = document.activeElement as HTMLElement | null;
    return element ? getComputedStyle(element).outlineStyle : 'none';
  });
  expect(outline).not.toBe('none');
});

test('pencere düğmelerinin anlamlı adları vardır', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) < 900, 'Masaüstü düzeni');
  await page.goto('/blog/');
  await expect(page.getByRole('link', { name: 'Pencereyi kapat ve masaüstüne dön' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pencereyi küçült' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pencereyi büyüt' })).toBeVisible();
});

for (const theme of ['light', 'dark'] as const) {
  test.describe(`erişilebilirlik denetimi (${theme === 'light' ? 'açık' : 'koyu'} tema)`, () => {
    test.use({ colorScheme: theme });

    for (const route of ['/', '/blog/', '/blog/ornek-yazi-nasil-gorunur/', '/notlar/ornek-java/notes/02-nesneler/interface/', '/projeler/', '/hakkimda/']) {
      test(`${route} axe denetiminden geçer`, async ({ page }) => {
        await page.goto(route);
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
        const summary = results.violations.map(
          (violation) =>
            `${violation.id} (${violation.impact}): ${violation.help}\n    ${violation.nodes
              .slice(0, 4)
              .map((node) => node.target.join(' '))
              .join('\n    ')}`,
        );
        expect(summary, summary.join('\n')).toEqual([]);
      });
    }
  });
}
