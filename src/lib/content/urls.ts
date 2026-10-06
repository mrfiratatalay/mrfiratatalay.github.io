/**
 * Sitedeki bütün adresler tek yerden üretilir.
 * Sayfalar, RSS, arama, not içe aktarma ve seri kontrolü bu fonksiyonları kullanır.
 *
 * Türkçe sayfalar kökte, İngilizce sayfalar /en/ altında ve İngilizce bölüm
 * adlarıyla üretilir (/hakkimda/ ↔ /en/about/). İçerik adresleri (yazı, not ve
 * proje kimlikleri) iki dilde aynıdır.
 */
import { DEFAULT_LOCALE, LOCALES, type Locale } from '../i18n/locales.ts';

/** Pages CMS'den eklenen yeni notların ayrılmış kaynak kimliği. */
export const LOCAL_NOTE_SOURCE_ID = 'yerel';

const SECTION_BASES = {
  tr: {
    home: '/',
    about: '/hakkimda/',
    projects: '/projeler/',
    blog: '/blog/',
    notes: '/notlar/',
    series: '/calismalar/',
    contact: '/iletisim/',
    search: '/arama/',
  },
  en: {
    home: '/en/',
    about: '/en/about/',
    projects: '/en/projects/',
    blog: '/en/blog/',
    notes: '/en/notes/',
    series: '/en/series/',
    contact: '/en/contact/',
    search: '/en/search/',
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type SectionKey = keyof (typeof SECTION_BASES)['tr'];

const SECTION_KEYS = Object.keys(SECTION_BASES.tr) as SectionKey[];

/** Bir dilin bütün adresleri. */
export function localePaths(locale: Locale) {
  const base = SECTION_BASES[locale];
  return {
    home: base.home,
    about: base.about,
    projects: base.projects,
    project: (slug: string) => `${base.projects}${slug}/`,
    blog: base.blog,
    blogPost: (slug: string) => `${base.blog}${slug}/`,
    notes: base.notes,
    noteSource: (sourceId: string) => `${base.notes}${sourceId}/`,
    note: (sourceId: string, noteSlug: string) => `${base.notes}${sourceId}/${noteSlug}/`,
    series: base.series,
    contact: base.contact,
    search: base.search,
    notFound: locale === DEFAULT_LOCALE ? '/404.html' : `/${locale}/404/`,
    rss: locale === DEFAULT_LOCALE ? '/rss.xml' : '/en/rss.xml',
    sitemap: '/sitemap-index.xml',
  };
}

export type SitePaths = ReturnType<typeof localePaths>;

/** Varsayılan dilin (Türkçe) adresleri. */
export const paths = localePaths(DEFAULT_LOCALE);

interface PathMatch {
  locale: Locale;
  section: SectionKey;
  /** Bölüm adresinden sonra kalan kısım, ör. "spring-boot-controller/". */
  rest: string;
}

function matchPath(pathname: string): PathMatch | null {
  const clean = pathname.split(/[?#]/)[0] ?? '';
  for (const locale of LOCALES) {
    const bases = SECTION_BASES[locale];
    for (const section of SECTION_KEYS) {
      const base: string = bases[section];
      const bare = base.length > 1 ? base.slice(0, -1) : base;
      if (clean === base || clean === bare) return { locale, section, rest: '' };
      // Ana sayfa yalnızca tam eşleşir; yoksa her adres onunla başlar.
      if (section !== 'home' && clean.startsWith(base)) return { locale, section, rest: clean.slice(base.length) };
    }
  }
  return null;
}

/** Adresin hangi dile ait olduğu (/en/ ile başlayanlar İngilizce). */
export function localeOfPath(pathname: string): Locale {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : DEFAULT_LOCALE;
}

/**
 * Bir sayfanın istenen dildeki karşılığı: /blog/x/ → /en/blog/x/, /en/about/ → /hakkimda/.
 * Sitenin bölümlerine ait olmayan adresler (RSS, görseller) olduğu gibi döner.
 */
export function localizePath(pathname: string, target: Locale): string {
  const match = matchPath(pathname);
  if (!match) return pathname;
  const suffix = pathname.slice((pathname.split(/[?#]/)[0] ?? '').length);
  return `${SECTION_BASES[target][match.section]}${match.rest}${suffix}`;
}

export type ContentRef =
  | { kind: 'blog'; slug: string }
  | { kind: 'note'; sourceId: string; slug: string }
  | { kind: 'project'; slug: string };

/**
 * Seri kayıtlarında kullanılan site adresini içerik referansına çevirir.
 * Kabul edilen biçimler: `/blog/x/`, `/notlar/kaynak/a/b/`, `/projeler/x/` ve
 * bunların İngilizce karşılıkları (`/en/blog/x/` ...).
 * Tam adres (https://...) verilirse yalnızca yol kısmı kullanılır.
 */
export function parseContentPath(input: string): ContentRef | null {
  let path = input.trim();
  if (/^https?:\/\//i.test(path)) {
    try {
      path = new URL(path).pathname;
    } catch {
      return null;
    }
  }
  const match = matchPath(path);
  if (!match) return null;
  const rest = match.rest.split('/').filter(Boolean);
  if (match.section === 'blog' && rest.length === 1 && rest[0]) {
    return { kind: 'blog', slug: rest[0] };
  }
  if (match.section === 'projects' && rest.length === 1 && rest[0]) {
    return { kind: 'project', slug: rest[0] };
  }
  if (match.section === 'notes' && rest.length >= 2 && rest[0]) {
    return { kind: 'note', sourceId: rest[0], slug: rest.slice(1).join('/') };
  }
  return null;
}

export function contentRefToPath(ref: ContentRef, locale: Locale = DEFAULT_LOCALE): string {
  const target = localePaths(locale);
  switch (ref.kind) {
    case 'blog':
      return target.blogPost(ref.slug);
    case 'project':
      return target.project(ref.slug);
    case 'note':
      return target.note(ref.sourceId, ref.slug);
  }
}

export function absoluteUrl(path: string, site: string | URL): string {
  return new URL(path, site).toString();
}
