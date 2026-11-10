import type { Locale } from '../i18n/locales.ts';

interface PortfolioApp {
  name: string;
  icon: string;
  platforms: readonly string[];
  href: Record<Locale, string>;
  description: Record<Locale, string>;
}

/** Portfolyonun uygulama klasörü bu listedeki ürünleri gösterir. */
export const portfolioApps = [
  {
    name: 'Study With Me',
    icon: '/studywithme/images/app-icon.webp',
    platforms: ['iPhone', 'iPad', 'Mac'],
    href: {
      tr: '/studywithme/',
      en: '/studywithme/en/',
    },
    description: {
      tr: 'Elle çizilmiş bir odada, küçük bir çalışma arkadaşıyla Pomodoro.',
      en: 'A Pomodoro timer with a little study companion in a hand-drawn room.',
    },
  },
] as const satisfies readonly PortfolioApp[];
