/**
 * İçerik ve veri dosyalarının şemaları.
 *
 * `src/content.config.ts` (Astro) ve `scripts/validate-content.mjs` (Node) aynı
 * şemaları kullanır; böylece editörün kaydettiği dosya iki yerde farklı
 * yorumlanmaz.
 */
import { z } from 'astro/zod';
import { SLUG_PATTERN } from './slug.ts';

const emptyToUndefined = (value: unknown) => (value === null || value === '' ? undefined : value);

/** Boş metin ve `null` değerini "girilmemiş" kabul eder. */
export const optionalText = z.preprocess(emptyToUndefined, z.string().optional());

/**
 * Boş tarih ve `null` değerini "girilmemiş" kabul eder.
 * Geçersiz bir tarih (ör. 2026-13-45) sessizce düzeltilmez; hata verir.
 */
export const optionalDate = z.preprocess(emptyToUndefined, z.coerce.date().optional());

/** Liste alanı boş bırakılmışsa boş liste kabul edilir. */
export const stringList = z.preprocess(
  (value) => (value == null ? [] : value),
  z.array(z.string()),
);

export const urlSlug = z
  .string()
  .regex(SLUG_PATTERN, {
    error: 'Adres yalnızca küçük harf, rakam ve tire içerebilir (örnek: spring-boot-controller).',
  });

/** Yalnızca http/https bağlantıları kabul edilir; `javascript:` gibi adresler reddedilir. */
export const httpUrl = z.url({ protocol: /^https?$/, error: 'Bağlantı http:// veya https:// ile başlamalı.' });
const optionalHttpUrl = z.preprocess(emptyToUndefined, httpUrl.optional());

const optionalNumber = z.preprocess(emptyToUndefined, z.coerce.number().optional());

export const blogSchema = z.object({
  title: z.string().min(1, { error: 'Başlık boş olamaz.' }),
  urlSlug,
  description: optionalText,
  publishedAt: optionalDate,
  updatedAt: optionalDate,
  category: optionalText,
  tags: stringList,
  cover: optionalText,
  coverAlt: optionalText,
  published: z.boolean().default(false),
});

export const localNoteSchema = z.object({
  title: z.string().min(1, { error: 'Başlık boş olamaz.' }),
  urlSlug,
  description: optionalText,
  category: optionalText,
  publishedAt: optionalDate,
  updatedAt: optionalDate,
  tags: stringList,
  published: z.boolean().default(false),
});

/** `scripts/import-notes.mjs` çıktısı. Bu dosyalar elle düzenlenmez. */
export const importedNoteSchema = z.object({
  title: z.string().min(1),
  sourceId: z.string().min(1),
  noteSlug: z.string().min(1),
  category: z.string().min(1),
  published: z.boolean(),
  description: optionalText,
  publishedAt: optionalDate,
  updatedAt: optionalDate,
  tags: stringList,
  order: z.number().int(),
  folder: z.string(),
  source: z.object({
    repository: z.string(),
    branch: z.string(),
    path: z.string(),
    commit: z.string(),
    url: z.string(),
  }),
});

export const PROJECT_STATUSES = {
  tamamlandi: 'Tamamlandı',
  gelistiriliyor: 'Geliştiriliyor',
  arsiv: 'Arşiv',
} as const;

export const projectSchema = z.object({
  title: z.string().min(1, { error: 'Proje adı boş olamaz.' }),
  urlSlug,
  summary: optionalText,
  problem: optionalText,
  benefit: optionalText,
  role: optionalText,
  technologies: stringList,
  status: z.preprocess(emptyToUndefined, z.enum(['tamamlandi', 'gelistiriliyor', 'arsiv']).optional()),
  cover: optionalText,
  coverAlt: optionalText,
  gallery: z.preprocess(
    (value) => (value == null ? [] : value),
    z.array(z.object({ image: z.string().min(1), alt: optionalText })),
  ),
  repoUrl: optionalHttpUrl,
  demoUrl: optionalHttpUrl,
  videoUrl: optionalHttpUrl,
  startedAt: optionalDate,
  endedAt: optionalDate,
  featured: z.boolean().default(false),
  order: optionalNumber,
  published: z.boolean().default(false),
});

export const LINK_KINDS = ['github', 'linkedin', 'medium', 'youtube', 'x', 'instagram', 'website', 'diger'] as const;

export const profileSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  shortBio: z.string().min(1),
  bio: z.string().min(1),
  location: optionalText,
  email: z.preprocess(emptyToUndefined, z.email({ error: 'E-posta adresi geçersiz.' }).optional()),
  avatar: optionalText,
  avatarAlt: optionalText,
  cv: optionalText,
  languages: stringList,
  education: z.preprocess(
    (value) => (value == null ? [] : value),
    z.array(z.object({ school: z.string().min(1), program: optionalText, period: optionalText })),
  ),
  experience: z.preprocess(
    (value) => (value == null ? [] : value),
    z.array(
      z.object({
        role: z.string().min(1),
        organization: z.string().min(1),
        period: optionalText,
        description: optionalText,
      }),
    ),
  ),
  skills: z.preprocess(
    (value) => (value == null ? [] : value),
    z.array(z.object({ group: z.string().min(1), items: stringList })),
  ),
  links: z.preprocess(
    (value) => (value == null ? [] : value),
    z.array(z.object({ label: z.string().min(1), url: httpUrl, kind: z.enum(LINK_KINDS) })),
  ),
  siteDescription: z.string().min(1),
  googleSiteVerification: optionalText,
});

export const taxonomySchema = z.object({
  categories: z
    .array(
      z.object({
        id: urlSlug,
        label: z.string().min(1),
        description: optionalText,
      }),
    )
    .min(1),
});

export const seriesSchema = z.object({
  series: z.preprocess(
    (value) => (value == null ? [] : value),
    z.array(
      z.object({
        id: urlSlug,
        title: z.string().min(1),
        description: optionalText,
        published: z.boolean().default(false),
        chapters: z.array(
          z.object({
            title: z.string().min(1),
            parts: z.array(
              z.object({
                ref: z.string().min(1),
                title: optionalText,
              }),
            ),
          }),
        ),
      }),
    ),
  ),
});

export type BlogData = z.infer<typeof blogSchema>;
export type LocalNoteData = z.infer<typeof localNoteSchema>;
export type ImportedNoteData = z.infer<typeof importedNoteSchema>;
export type ProjectData = z.infer<typeof projectSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Taxonomy = z.infer<typeof taxonomySchema>;
export type SeriesData = z.infer<typeof seriesSchema>;
export type Series = SeriesData['series'][number];
