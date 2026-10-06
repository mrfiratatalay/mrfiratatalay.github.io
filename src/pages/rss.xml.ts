import type { APIContext } from 'astro';
import { contentFeed } from '../views/content-feed.ts';

export async function GET(context: APIContext) {
  return contentFeed(context, 'tr');
}
