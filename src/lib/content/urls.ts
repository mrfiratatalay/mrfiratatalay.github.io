/**
 * Sitedeki bütün adresler tek yerden üretilir.
 * Sayfalar, RSS, arama, not içe aktarma ve seri kontrolü bu fonksiyonları kullanır.
 */

/** Pages CMS'den eklenen yeni notların ayrılmış kaynak kimliği. */
export const LOCAL_NOTE_SOURCE_ID = 'yerel';

export const paths = {
  home: '/',
  about: '/hakkimda/',
  projects: '/projeler/',
  project: (slug: string) => `/projeler/${slug}/`,
  blog: '/blog/',
  blogPost: (slug: string) => `/blog/${slug}/`,
  notes: '/notlar/',
  noteSource: (sourceId: string) => `/notlar/${sourceId}/`,
  note: (sourceId: string, noteSlug: string) => `/notlar/${sourceId}/${noteSlug}/`,
  series: '/calismalar/',
  contact: '/iletisim/',
  search: '/arama/',
  rss: '/rss.xml',
  sitemap: '/sitemap-index.xml',
} as const;

export type ContentRef =
  | { kind: 'blog'; slug: string }
  | { kind: 'note'; sourceId: string; slug: string }
  | { kind: 'project'; slug: string };

/**
 * Seri kayıtlarında kullanılan site adresini içerik referansına çevirir.
 * Kabul edilen biçimler: `/blog/x/`, `/notlar/kaynak/a/b/`, `/projeler/x/`.
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
  const parts = path.split(/[?#]/)[0]?.split('/').filter(Boolean) ?? [];
  const [section, ...rest] = parts;
  if (section === 'blog' && rest.length === 1 && rest[0]) {
    return { kind: 'blog', slug: rest[0] };
  }
  if (section === 'projeler' && rest.length === 1 && rest[0]) {
    return { kind: 'project', slug: rest[0] };
  }
  if (section === 'notlar' && rest.length >= 2 && rest[0]) {
    return { kind: 'note', sourceId: rest[0], slug: rest.slice(1).join('/') };
  }
  return null;
}

export function contentRefToPath(ref: ContentRef): string {
  switch (ref.kind) {
    case 'blog':
      return paths.blogPost(ref.slug);
    case 'project':
      return paths.project(ref.slug);
    case 'note':
      return paths.note(ref.sourceId, ref.slug);
  }
}

export function absoluteUrl(path: string, site: string | URL): string {
  return new URL(path, site).toString();
}
