/**
 * Sitenin dilleri. Türkçe varsayılan dildir ve adreslerde ön ek almaz;
 * İngilizce sayfalar /en/ altında üretilir. Ziyaretçinin hangi dili göreceğine
 * DesktopLayout'taki küçük betik karar verir: önce kayıtlı tercih, yoksa cihaz dili.
 */
export const LOCALES = ['tr', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'tr';

/** Intl ve JSON-LD için dil etiketleri. */
export const LOCALE_TAGS: Record<Locale, string> = { tr: 'tr-TR', en: 'en-US' };

/** Open Graph biçimi. */
export const OG_LOCALES: Record<Locale, string> = { tr: 'tr_TR', en: 'en_US' };

/** Dil seçicide her dil kendi adıyla görünür. */
export const LANGUAGE_NAMES: Record<Locale, string> = { tr: 'Türkçe', en: 'English' };

/** Menü çubuğundaki giriş kaynağı göstergesi (macOS'taki gibi). */
export const LANGUAGE_CODES: Record<Locale, string> = { tr: 'TR', en: 'EN' };

/** Ziyaretçinin dil tercihi bu anahtarla localStorage'da saklanır. */
export const LANGUAGE_KEY = 'dil';

export function isLocale(value: unknown): value is Locale {
  return value === 'tr' || value === 'en';
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'tr' ? 'en' : 'tr';
}

/** Yeni sekmede açılan dil bağlantıları da seçilen dili kaydeder. */
export function languageHref(path: string, locale: Locale): string {
  const url = new URL(path, 'https://language.local');
  url.searchParams.set(LANGUAGE_KEY, locale);
  return `${url.pathname}${url.search}${url.hash}`;
}
