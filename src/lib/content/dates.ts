/**
 * Tarihler içerik dosyalarında `yyyy-MM-dd` olarak saklanır ve UTC gece yarısı
 * olarak okunur. Gösterirken de UTC kullanılır; böylece build makinesinin saat
 * dilimi tarihi bir gün kaydırmaz.
 */
const longFormat = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatDate(date: Date): string {
  return longFormat.format(date);
}

/** `<time datetime>` için `2026-10-06` biçimi. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
