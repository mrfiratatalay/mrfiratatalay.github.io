/**
 * Tarihler içerik dosyalarında `yyyy-MM-dd` olarak saklanır ve UTC gece yarısı
 * olarak okunur. Gösterirken de UTC kullanılır; böylece build makinesinin saat
 * dilimi tarihi bir gün kaydırmaz.
 */
import { DEFAULT_LOCALE, LOCALE_TAGS, type Locale } from '../i18n/locales.ts';

const formats = new Map<Locale, Intl.DateTimeFormat>();

export function formatDate(date: Date, locale: Locale = DEFAULT_LOCALE): string {
  let format = formats.get(locale);
  if (!format) {
    format = new Intl.DateTimeFormat(LOCALE_TAGS[locale], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    formats.set(locale, format);
  }
  return format.format(date);
}

/** `<time datetime>` için `2026-10-06` biçimi. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
