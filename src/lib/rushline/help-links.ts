/** Rushline'ın destek ve gizlilik sayfalarının adresleri; oyun Türkçe ve İngilizce. */
export type RushlineLocale = 'tr' | 'en';
export type RushlineHelpPage = 'support' | 'privacy';

export function helpPath(locale: RushlineLocale, page: RushlineHelpPage): string {
  return locale === 'tr' ? `/rushline/${page}/` : `/rushline/en/${page}/`;
}

export function productPath(locale: RushlineLocale): string {
  return locale === 'tr' ? '/rushline/' : '/rushline/en/';
}
