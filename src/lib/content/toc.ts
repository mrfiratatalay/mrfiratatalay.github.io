import type { MarkdownHeading } from 'astro';

/** İçindekilerde h2 ve h3 başlıkları gösterilir (h1 sayfa başlığıdır). */
export function tocItems(headings: readonly MarkdownHeading[]): MarkdownHeading[] {
  return headings.filter((heading) => heading.depth === 2 || heading.depth === 3);
}

/** Uzun yazılarda (en az 3 başlık) içindekiler bölümü gösterilir. */
export function hasToc(headings: readonly MarkdownHeading[]): boolean {
  return tocItems(headings).length >= 3;
}
