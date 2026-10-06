/**
 * Yayınlanmış içerik listeleri. Sayfalar, RSS, site haritası ve arama aynı
 * fonksiyonları kullanır; böylece taslaklar hiçbir çıktıya karışmaz.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { DEFAULT_LOCALE, type Locale } from '../i18n/locales.ts';
import { text } from '../i18n/text.ts';
import { useTranslations } from '../i18n/ui.ts';
import { blogPostIssues, findDuplicates, isPublished, localNoteIssues, projectIssues, readingMinutes } from './rules.ts';
import { categoryIds, readImportedSources, seriesList } from './site-data.ts';
import { LOCAL_NOTE_SOURCE_ID, contentRefToPath, localePaths, parseContentPath, paths } from './urls.ts';

const ctx = { categoryIds };

export type BlogPost = CollectionEntry<'blog'> & { data: { publishedAt: Date } };
export type ProjectEntry = CollectionEntry<'projects'>;

function failOnIssues(kind: string, problems: Array<[string, string[]]>): void {
  const lines = problems.flatMap(([file, issues]) => issues.map((issue) => `${file}: ${issue}`));
  if (lines.length > 0) {
    throw new Error(`Yayındaki ${kind} içinde eksik bilgi var:\n- ${lines.join('\n- ')}`);
  }
}

function failOnDuplicates<T>(kind: string, items: T[], keyOf: (item: T) => string): void {
  const duplicates = [...findDuplicates(items, keyOf).keys()];
  if (duplicates.length > 0) throw new Error(`Aynı ${kind} adresi birden fazla kez kullanılmış: ${duplicates.join(', ')}`);
}

// Build sırasında listeler bir kez hesaplanır; geliştirme sunucusunda her istekte tazelenir.
const cache = new Map<string, Promise<unknown>>();
function memo<T>(key: string, load: () => Promise<T>): Promise<T> {
  if (!import.meta.env.PROD) return load();
  let value = cache.get(key) as Promise<T> | undefined;
  if (!value) {
    value = load();
    cache.set(key, value);
  }
  return value;
}

export function getPublishedPosts(): Promise<BlogPost[]> {
  return memo('posts', async () => {
    const posts = (await getCollection('blog')).filter((post) => isPublished(post.data));
    failOnIssues(
      'yazılar',
      posts.map((post) => [post.filePath ?? post.id, blogPostIssues(post.data, post.body ?? '', ctx)]),
    );
    failOnDuplicates('yazı', posts, (post) => post.data.urlSlug);
    return (posts as BlogPost[]).sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
  });
}

export interface NoteItem {
  key: string;
  sourceId: string;
  slug: string;
  /** Türkçe adres; içeriğin dilden bağımsız kimliği olarak da kullanılır. */
  url: string;
  /** Notun yazıldığı dil. */
  lang: Locale;
  title: string;
  description?: string;
  category?: string;
  publishedAt?: Date;
  updatedAt?: Date;
  tags: string[];
  folder: string;
  order: number;
  readingMinutes: number;
  source?: { repository: string; branch: string; path: string; url: string };
  entry: CollectionEntry<'notes'> | CollectionEntry<'importedNotes'>;
}

export function getPublishedNotes(): Promise<NoteItem[]> {
  return memo('notes', async () => {
    const local = (await getCollection('notes')).filter((note) => isPublished(note.data));
    failOnIssues(
      'notlar',
      local.map((note) => [note.filePath ?? note.id, localNoteIssues(note.data, note.body ?? '', ctx)]),
    );
    const localItems: NoteItem[] = local
      .sort(
        (a, b) =>
          (b.data.publishedAt?.getTime() ?? 0) - (a.data.publishedAt?.getTime() ?? 0) ||
          a.data.title.localeCompare(b.data.title, 'tr'),
      )
      .map((note, index) => {
        const item: NoteItem = {
          key: `${LOCAL_NOTE_SOURCE_ID}/${note.data.urlSlug}`,
          sourceId: LOCAL_NOTE_SOURCE_ID,
          slug: note.data.urlSlug,
          url: paths.note(LOCAL_NOTE_SOURCE_ID, note.data.urlSlug),
          lang: note.data.lang ?? DEFAULT_LOCALE,
          title: note.data.title,
          tags: note.data.tags,
          folder: '',
          order: index,
          readingMinutes: readingMinutes(note.body ?? ''),
          entry: note,
        };
        if (note.data.description) item.description = note.data.description;
        if (note.data.category) item.category = note.data.category;
        if (note.data.publishedAt) item.publishedAt = note.data.publishedAt;
        if (note.data.updatedAt) item.updatedAt = note.data.updatedAt;
        return item;
      });

    const imported = await getCollection('importedNotes');
    const importedItems: NoteItem[] = imported
      .filter((note) => isPublished(note.data))
      .map((note) => {
        const item: NoteItem = {
          key: `${note.data.sourceId}/${note.data.noteSlug}`,
          sourceId: note.data.sourceId,
          slug: note.data.noteSlug,
          url: paths.note(note.data.sourceId, note.data.noteSlug),
          lang: note.data.lang ?? DEFAULT_LOCALE,
          title: note.data.title,
          category: note.data.category,
          tags: note.data.tags,
          folder: note.data.folder,
          order: note.data.order,
          readingMinutes: readingMinutes(note.body ?? ''),
          source: {
            repository: note.data.source.repository,
            branch: note.data.source.branch,
            path: note.data.source.path,
            url: note.data.source.url,
          },
          entry: note,
        };
        if (note.data.description) item.description = note.data.description;
        if (note.data.publishedAt) item.publishedAt = note.data.publishedAt;
        if (note.data.updatedAt) item.updatedAt = note.data.updatedAt;
        return item;
      })
      .sort((a, b) => a.sourceId.localeCompare(b.sourceId) || a.order - b.order);

    const all = [...localItems, ...importedItems];
    failOnDuplicates('not', all, (note) => note.key);
    return all;
  });
}

export interface NoteSourceInfo {
  id: string;
  label: string;
  description?: string;
  category?: string;
  repository?: string;
  notes: NoteItem[];
}

/** Not koleksiyonları: önce editörden eklenen yeni notlar, sonra bağlı repolar. */
export async function getNoteSources(locale: Locale = DEFAULT_LOCALE): Promise<NoteSourceInfo[]> {
  const notes = await getPublishedNotes();
  const t = useTranslations(locale).notes;
  const local: NoteSourceInfo = {
    id: LOCAL_NOTE_SOURCE_ID,
    label: t.localLabel,
    description: t.localDescription,
    notes: notes.filter((note) => note.sourceId === LOCAL_NOTE_SOURCE_ID),
  };
  const imported = readImportedSources()
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
    .map((source) => {
      const english = locale === 'en';
      const info: NoteSourceInfo = {
        id: source.id,
        label: (english && source.labelEn) || source.label,
        category: source.category,
        repository: source.repository,
        notes: notes.filter((note) => note.sourceId === source.id),
      };
      const description = (english && source.descriptionEn) || source.description;
      if (description) info.description = description;
      return info;
    });
  return [local, ...imported].filter((source) => source.notes.length > 0);
}

/** Notun istenen dildeki adresi. */
export function noteUrl(note: Pick<NoteItem, 'sourceId' | 'slug'>, locale: Locale): string {
  return localePaths(locale).note(note.sourceId, note.slug);
}

export function getPublishedProjects(): Promise<ProjectEntry[]> {
  return memo('projects', async () => {
    const projects = (await getCollection('projects')).filter((project) => isPublished(project.data));
    failOnIssues(
      'projeler',
      projects.map((project) => [project.filePath ?? project.id, projectIssues(project.data, project.body ?? '')]),
    );
    failOnDuplicates('proje', projects, (project) => project.data.urlSlug);
    return projects.sort(
      (a, b) =>
        Number(b.data.featured) - Number(a.data.featured) ||
        (a.data.order ?? 999) - (b.data.order ?? 999) ||
        a.data.title.localeCompare(b.data.title, 'tr'),
    );
  });
}

export type SeriesPartKind = 'post' | 'note' | 'project';

export interface SeriesPart {
  title: string;
  /** İstenen dildeki adres. */
  url: string;
  /** İçeriğin dilden bağımsız kimliği (Türkçe adresi). */
  key: string;
  kind: SeriesPartKind;
}

export interface ResolvedSeries {
  id: string;
  title: string;
  description?: string;
  chapters: Array<{ title: string; parts: SeriesPart[] }>;
}

/** Seri kayıtlarını yayınlanmış içeriklere bağlar. Çözülemeyen kayıt build'i durdurur. */
export function getPublishedSeries(locale: Locale = DEFAULT_LOCALE): Promise<ResolvedSeries[]> {
  return memo(`series:${locale}`, async () => {
    const [posts, notes, projects] = await Promise.all([getPublishedPosts(), getPublishedNotes(), getPublishedProjects()]);
    const titles = new Map<string, { title: string; kind: SeriesPartKind }>();
    for (const post of posts) titles.set(paths.blogPost(post.data.urlSlug), { title: post.data.title, kind: 'post' });
    for (const note of notes) titles.set(note.url, { title: note.title, kind: 'note' });
    for (const project of projects) titles.set(paths.project(project.data.urlSlug), { title: project.data.title, kind: 'project' });

    const problems: string[] = [];
    const resolved = seriesList
      .filter((series) => series.published)
      .map((series) => {
        const item: ResolvedSeries = {
          id: series.id,
          title: text(series.title, locale),
          chapters: series.chapters.map((chapter) => ({
            title: text(chapter.title, locale),
            parts: chapter.parts.flatMap((part) => {
              const ref = parseContentPath(part.ref);
              const key = ref ? contentRefToPath(ref) : part.ref;
              const target = titles.get(key);
              if (!target || !ref) {
                problems.push(`"${text(series.title, DEFAULT_LOCALE)}" serisindeki "${part.ref}" yayınlanmış bir içerik değil.`);
                return [];
              }
              return [{ title: text(part.title, locale) || target.title, url: contentRefToPath(ref, locale), key, kind: target.kind }];
            }),
          })),
        };
        const description = text(series.description, locale);
        if (description) item.description = description;
        return item;
      });
    if (problems.length > 0) throw new Error(`Çalışma serilerinde sorun var:\n- ${problems.join('\n- ')}`);
    return resolved;
  });
}

export interface SeriesContext {
  series: ResolvedSeries;
  chapterTitle: string;
  position: number;
  total: number;
  previous?: SeriesPart;
  next?: SeriesPart;
}

/**
 * İçerik bir serinin parçasıysa önceki/sonraki part bilgisini döndürür.
 * `key` içeriğin Türkçe adresidir (ör. /blog/x/); sonuçtaki adresler istenen dildedir.
 */
export async function findSeriesContext(key: string, locale: Locale = DEFAULT_LOCALE): Promise<SeriesContext | null> {
  for (const series of await getPublishedSeries(locale)) {
    const parts = series.chapters.flatMap((chapter) => chapter.parts.map((part) => ({ part, chapter: chapter.title })));
    const index = parts.findIndex(({ part }) => part.key === key);
    if (index === -1) continue;
    const context: SeriesContext = {
      series,
      chapterTitle: parts[index]?.chapter ?? '',
      position: index + 1,
      total: parts.length,
    };
    const previous = parts[index - 1]?.part;
    const next = parts[index + 1]?.part;
    if (previous) context.previous = previous;
    if (next) context.next = next;
    return context;
  }
  return null;
}
