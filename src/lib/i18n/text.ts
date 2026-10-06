/**
 * İki dilli içerik alanları. Bir alan ya düz metindir (iki dilde aynı, ör. özel
 * isimler) ya da { tr, en } nesnesidir. Bir dilde metin yoksa diğer dildeki
 * metin gösterilir; böylece çevirisi eksik alan sayfada boş kalmaz.
 */
import { otherLocale, type Locale } from './locales.ts';

export type LocalizedText = string | { tr?: string | undefined; en?: string | undefined };
export type LocalizedList = string[] | { tr?: string[] | undefined; en?: string[] | undefined };

export function text(value: LocalizedText | undefined, locale: Locale): string {
  if (value === undefined) return '';
  if (typeof value === 'string') return value;
  return value[locale]?.trim() || value[otherLocale(locale)]?.trim() || '';
}

export function list(value: LocalizedList | undefined, locale: Locale): string[] {
  if (value === undefined) return [];
  if (Array.isArray(value)) return value;
  const own = (value[locale] ?? []).filter((item) => item.trim());
  return own.length > 0 ? own : (value[otherLocale(locale)] ?? []).filter((item) => item.trim());
}

/** Metin bu dilde yazılmış mı (yoksa diğer dilden mi gösteriliyor)? */
export function writtenIn(value: LocalizedText | undefined, locale: Locale): boolean {
  if (value === undefined) return false;
  if (typeof value === 'string') return true;
  return Boolean(value[locale]?.trim());
}
