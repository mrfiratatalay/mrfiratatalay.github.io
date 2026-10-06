import { paths } from '../content/urls.ts';

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

export const SECTIONS: readonly Section[] = [
  { id: 'about', label: 'Hakkımda', shortLabel: 'Hakkımda', href: paths.about, icon: 'about' },
  { id: 'projects', label: 'Projelerim', shortLabel: 'Projeler', href: paths.projects, icon: 'projects' },
  { id: 'blog', label: 'Blog', shortLabel: 'Blog', href: paths.blog, icon: 'blog' },
  { id: 'notes', label: 'Öğrenme Notları', shortLabel: 'Notlar', href: paths.notes, icon: 'notes' },
  { id: 'series', label: 'Çalışmalarım', shortLabel: 'Çalışmalar', href: paths.series, icon: 'series' },
  { id: 'contact', label: 'İletişim', shortLabel: 'İletişim', href: paths.contact, icon: 'contact' },
];

export const HOME_SECTION: Section = { id: 'home', label: 'Masaüstü', shortLabel: 'Masaüstü', href: paths.home, icon: 'home' };

export function sectionById(id: SectionId): Section | undefined {
  return [HOME_SECTION, ...SECTIONS].find((section) => section.id === id);
}
