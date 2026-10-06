/**
 * Profil, kategori ve seri verileri (src/data/*.json). Pages CMS bu dosyaları düzenler.
 * Dosyalar build sırasında aynı şemalarla doğrulanır.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import profileJson from '../../data/profile.json';
import seriesJson from '../../data/series.json';
import taxonomyJson from '../../data/taxonomy.json';
import { profileSchema, seriesSchema, taxonomySchema } from './schemas.ts';

export const profile = profileSchema.parse(profileJson);
export const taxonomy = taxonomySchema.parse(taxonomyJson);
export const seriesList = seriesSchema.parse(seriesJson).series;

export const categoryIds: ReadonlySet<string> = new Set(taxonomy.categories.map((category) => category.id));

export function categoryLabel(id: string | undefined): string | undefined {
  if (!id) return undefined;
  return taxonomy.categories.find((category) => category.id === id)?.label ?? id;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase('tr'))
    .join('');
}

export interface ImportedSourceInfo {
  id: string;
  label: string;
  description?: string;
  category: string;
  order: number;
  repository: string;
  noteCount: number;
}

/**
 * Not içe aktarma raporundan kaynak adları okunur (generated/source-status.json).
 * Rapor yoksa (ör. içe aktarma hiç çalışmadıysa) liste boş döner.
 */
export function readImportedSources(): ImportedSourceInfo[] {
  try {
    const raw = readFileSync(path.resolve('generated/source-status.json'), 'utf8');
    const report = JSON.parse(raw) as { sources?: ImportedSourceInfo[] };
    return (report.sources ?? []).map((source) => {
      const info: ImportedSourceInfo = {
        id: source.id,
        label: source.label,
        category: source.category,
        order: source.order,
        repository: source.repository,
        noteCount: source.noteCount,
      };
      if (source.description) info.description = source.description;
      return info;
    });
  } catch {
    return [];
  }
}
