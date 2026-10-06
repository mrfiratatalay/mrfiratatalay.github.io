import { defineConfig, devices } from '@playwright/test';

/**
 * Tarayıcı testleri hazırlanmış siteyi (dist/) GitHub Pages benzeri bir sunucuyla dener.
 * Önce örnek içeriklerle build al: `npm run build:ornek`, sonra `npm run test:e2e`.
 */
const PORT = 4322;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'tr-TR',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `node tests/e2e/static-server.mjs`,
    env: { PORT: String(PORT) },
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    {
      name: 'masaustu',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'tablet',
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 }, hasTouch: true, isMobile: true },
    },
    {
      name: 'telefon-safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
});
