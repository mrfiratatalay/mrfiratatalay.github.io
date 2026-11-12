import type { Locale } from '../i18n/locales.ts';

export interface PortfolioApp {
  name: string;
  icon: string;
  platforms: readonly string[];
  href: Record<Locale, string>;
  description: Record<Locale, string>;
  /** App Store'a henüz çıkmadıysa kartta "Yakında" yazar. */
  comingSoon?: boolean;
}

/** Portfolyonun uygulama klasörü bu listedeki ürünleri gösterir. */
export const portfolioApps = [
  {
    name: 'Tao: Cozy Focus Timer',
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

/** Portfolyonun oyun klasörü bu listedeki oyunları gösterir. */
export const portfolioGames = [
  {
    name: 'Rushline',
    icon: '/rushline/images/app-icon.webp',
    platforms: ['iPhone'],
    href: {
      tr: '/rushline/',
      en: '/rushline/en/',
    },
    description: {
      tr: 'Telefonu eğ, gazı aç, trafiğin arasından süzül. Türkiye’nin altı yolunda çevrimdışı motor yarışı.',
      en: 'Tilt, throttle and split the traffic. An offline motorcycle racer on six roads across Türkiye.',
    },
    comingSoon: true,
  },
] as const satisfies readonly PortfolioApp[];
