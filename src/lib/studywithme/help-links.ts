export const helpLanguages = {
  tr: 'Türkçe',
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
  'pt-BR': 'Português (Brasil)',
  ja: '日本語',
  ko: '한국어',
  'zh-Hans': '简体中文',
  'zh-Hant': '繁體中文',
  ar: 'العربية',
} as const;

export type HelpLocale = keyof typeof helpLanguages;
export type HelpPage = 'support' | 'privacy';

export const helpLocales = Object.keys(helpLanguages) as HelpLocale[];

export function helpPath(locale: HelpLocale, page: HelpPage): string {
  return locale === 'tr' ? `/studywithme/${page}/` : `/studywithme/${locale}/${page}/`;
}

export function productPath(locale: HelpLocale): string {
  return locale === 'tr' ? '/studywithme/' : '/studywithme/en/';
}
