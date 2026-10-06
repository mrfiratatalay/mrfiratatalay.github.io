import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedNotes, getPublishedPosts } from '../lib/content/collections.ts';
import { categoryLabel, profile } from '../lib/content/site-data.ts';
import { localePaths } from '../lib/content/urls.ts';
import { LOCALE_TAGS, type Locale } from '../lib/i18n/locales.ts';
import { text } from '../lib/i18n/text.ts';

/** Blog ve gerçek öğrenme notları aynı akışta; bilinmeyen tarihler eklenmez. */
export async function contentFeed(context: APIContext, locale: Locale) {
  const paths = localePaths(locale);
  const [posts, notes] = await Promise.all([getPublishedPosts(), getPublishedNotes()]);
  const items = [
    ...posts.map((post) => {
      const label = categoryLabel(post.data.category, locale);
      return {
        title: post.data.title,
        description: post.data.description ?? '',
        pubDate: post.data.publishedAt,
        link: paths.blogPost(post.data.urlSlug),
        categories: [...(label ? [label] : []), ...post.data.tags],
      };
    }),
    ...notes.map((note) => {
      const label = categoryLabel(note.category, locale);
      return {
        title: note.title,
        description: note.description ?? '',
        ...(note.publishedAt ? { pubDate: note.publishedAt } : {}),
        link: paths.note(note.sourceId, note.slug),
        categories: [...(label ? [label] : []), ...note.tags],
      };
    }),
  ];
  return rss({
    title: `${profile.name} · Blog`,
    description: text(profile.siteDescription, locale),
    site: context.site ?? 'https://mrfiratatalay.github.io',
    trailingSlash: true,
    items,
    customData: `<language>${LOCALE_TAGS[locale]}</language>`,
  });
}
