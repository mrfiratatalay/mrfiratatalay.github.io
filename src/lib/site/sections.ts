import { localePaths } from '../content/urls.ts';
import { DEFAULT_LOCALE, type Locale } from '../i18n/locales.ts';
import { useTranslations } from '../i18n/ui.ts';

/** Masaüstündeki klasörler, dock ve menü çubuğu aynı listeden üretilir. */
export type SectionId =
  | 'home'
  | 'about'
  | 'projects'
  | 'blog'
  | 'notes'
  | 'series'
  | 'contact'
  | 'search'
  | 'notfound';

export type IconName =
  | 'home'
  | 'about'
  | 'projects'
  | 'blog'
  | 'notes'
  | 'series'
  | 'contact'
  | 'search';

export interface Section {
  id: SectionId;
  /** Masaüstü klasörü ve pencere başlığında görünen ad. */
  label: string;
  /** Dock'ta görünen kısa ad. */
  shortLabel: string;
  href: string;
  icon: IconName;
}

const ORDER = ['about', 'projects', 'blog', 'notes', 'series', 'contact'] as const;

/** Bölümler, istenen dildeki adları ve adresleriyle. */
export function sectionsFor(locale: Locale): Section[] {
  const labels = useTranslations(locale).sections;
  const target = localePaths(locale);
  return ORDER.map((id) => ({ id, label: labels[id].label, shortLabel: labels[id].short, href: target[id], icon: id }));
}

export function homeSection(locale: Locale): Section {
  const label = useTranslations(locale).sections.home;
  return { id: 'home', label: label.label, shortLabel: label.short, href: localePaths(locale).home, icon: 'home' };
}

export const SECTIONS: readonly Section[] = sectionsFor(DEFAULT_LOCALE);
export const HOME_SECTION: Section = homeSection(DEFAULT_LOCALE);
