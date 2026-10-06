/**
 * Yayın kuralları: neyin yayınlanacağına ve yayınlanan içerikte hangi
 * bilgilerin zorunlu olduğuna tek yerden karar verilir.
 *
 * - Taslak (published: false) eksik bilgiyle kaydedilebilir; sayfası üretilmez.
 * - Yayına açılmış içerikte eksik bilgi varsa build durur, önceki canlı sürüm kalır.
 */
import type { BlogData, LocalNoteData, ProjectData } from './schemas.ts';

export interface RuleContext {
  categoryIds: ReadonlySet<string>;
}

export function isPublished(data: { published?: boolean }): boolean {
  return data.published === true;
}

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function checkCategory(category: string | undefined, ctx: RuleContext, issues: string[]): void {
  if (!category) {
    issues.push('Kategori seçilmemiş.');
  } else if (!ctx.categoryIds.has(category)) {
    issues.push(`"${category}" kategorisi src/data/taxonomy.json içinde tanımlı değil.`);
  }
}

/** Yayına açılmış makalenin eksiklerini döndürür. Taslak için boş liste döner. */
export function blogPostIssues(data: BlogData, body: string, ctx: RuleContext): string[] {
  if (!isPublished(data)) return [];
  const issues: string[] = [];
  if (!data.description?.trim()) issues.push('Kısa açıklama eksik.');
  if (!isValidDate(data.publishedAt)) issues.push('Yayın tarihi eksik.');
  checkCategory(data.category, ctx, issues);
  if (!body.trim()) issues.push('Yazının içeriği boş.');
  if (data.cover && !data.coverAlt?.trim()) {
    issues.push('Kapak görseli var ama görselin açıklaması (alternatif metin) eksik.');
  }
  if (isValidDate(data.publishedAt) && isValidDate(data.updatedAt) && data.updatedAt < data.publishedAt) {
    issues.push('Son düzenleme tarihi yayın tarihinden önce olamaz.');
  }
  return issues;
}

/** Yayına açılmış yerel notun eksiklerini döndürür. */
export function localNoteIssues(data: LocalNoteData, body: string, ctx: RuleContext): string[] {
  if (!isPublished(data)) return [];
  const issues: string[] = [];
  checkCategory(data.category, ctx, issues);
  if (!body.trim()) issues.push('Notun içeriği boş.');
  return issues;
}

/** Yayına açılmış projenin eksiklerini döndürür. */
export function projectIssues(data: ProjectData, _body: string): string[] {
  if (!isPublished(data)) return [];
  const issues: string[] = [];
  if (!data.summary?.trim()) issues.push('Kısa açıklama eksik.');
  if (data.cover && !data.coverAlt?.trim()) {
    issues.push('Kapak görseli var ama görselin açıklaması (alternatif metin) eksik.');
  }
  data.gallery.forEach((item, index) => {
    if (!item.alt?.trim()) issues.push(`${index + 1}. galeri görselinin açıklaması eksik.`);
  });
  return issues;
}

/** Aynı adresin iki içerik tarafından kullanılmasını yakalar. */
export function findDuplicates<T>(items: readonly T[], keyOf: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return new Map([...groups].filter(([, group]) => group.length > 1));
}

/** Okuma süresi (dakika). Kod blokları da okunduğu için metinle birlikte sayılır. */
export function readingMinutes(markdown: string): number {
  const words = markdown
    .replace(/^---[\s\S]*?---/, ' ')
    .replace(/[#>*_`~[\]()!|-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
