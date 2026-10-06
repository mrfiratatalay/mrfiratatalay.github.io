import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedPosts } from '../lib/content/collections.ts';
import { categoryLabel, profile } from '../lib/content/site-data.ts';
import { paths } from '../lib/content/urls.ts';

/** Yalnızca yayınlanmış blog yazıları akışa girer; not güncellemeleri akışı doldurmaz. */
export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  return rss({
    title: `${profile.name} · Blog`,
    description: profile.siteDescription,
    site: context.site ?? 'https://mrfiratatalay.github.io',
    trailingSlash: true,
    items: posts.map((post) => {
      const label = categoryLabel(post.data.category);
      return {
        title: post.data.title,
        description: post.data.description ?? '',
        pubDate: post.data.publishedAt,
        link: paths.blogPost(post.data.urlSlug),
        categories: [...(label ? [label] : []), ...post.data.tags],
      };
    }),
    customData: '<language>tr-TR</language>',
  });
}
