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

const nullToArray = (value: unknown) => (value == null ? [] : value);

const isBlank = (value: unknown) => value == null || (typeof value === 'string' && value.trim() === '');

/**
 * İki dilli metin: düz metin (iki dilde aynı) ya da { tr, en } nesnesi.
 * Bir dil boş bırakılabilir; sayfada diğer dildeki metin gösterilir.
 */
export const localizedText = z.union([
  z.string().trim().min(1, { error: 'Metin boş olamaz.' }),
  z
    .object({ tr: optionalText, en: optionalText })
    .refine((value) => Boolean(value.tr?.trim() || value.en?.trim()), {
      error: 'Türkçe veya İngilizce metinden en az biri gerekli.',
    }),
]);

/** İki dili de boş bırakılmış alan "girilmemiş" sayılır. */
export const optionalLocalizedText = z.preprocess(
  (value) =>
    isBlank(value) ||
    (typeof value === 'object' && value !== null && isBlank((value as { tr?: unknown }).tr) && isBlank((value as { en?: unknown }).en))
      ? undefined
      : value,
  localizedText.optional(),
);

/** İki dilli liste: düz liste (iki dilde aynı) ya da { tr: [...], en: [...] }. */
export const localizedList = z.preprocess(
  nullToArray,
  z.union([z.array(z.string()), z.object({ tr: stringList, en: stringList })]),
);

export const CONTENT_LANGUAGES = ['tr', 'en'] as const;

/** İçeriğin yazıldığı dil; boş bırakılırsa Türkçe kabul edilir. */
const contentLanguage = z.preprocess(emptyToUndefined, z.enum(CONTENT_LANGUAGES).optional());

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
  lang: contentLanguage,
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
  lang: contentLanguage,
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
  lang: contentLanguage,
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

/** Kapak görseli olmayan projelerde cam karonun ikonu ve rengi. */
export const PROJECT_ICONS = [
  'shield',
  'sparkles',
  'graduation',
  'trophy',
  'campus',
  'construction',
  'document',
  'server',
  'database',
  'layers',
  'code',
  'globe',
  'cart',
  'chart',
  'mobile',
  'bot',
] as const;

export const PROJECT_COLORS = ['blue', 'purple', 'teal', 'orange', 'pink', 'green', 'indigo', 'red'] as const;

export const projectSchema = z.object({
  title: z.string().min(1, { error: 'Proje adı boş olamaz.' }),
  urlSlug,
  /** Projenin tek satırlık tanımı, ör. "Olay güdümlü dolandırıcılık operasyon platformu". */
  tagline: optionalLocalizedText,
  /** Yarışma, ödül veya destek bilgisi, ör. "Turkcell Code Night 2026 All-Star Finali". */
  context: optionalLocalizedText,
  summary: optionalLocalizedText,
  highlights: localizedList,
  problem: optionalLocalizedText,
  benefit: optionalLocalizedText,
  role: optionalLocalizedText,
  technologies: stringList,
  status: z.preprocess(emptyToUndefined, z.enum(['tamamlandi', 'gelistiriliyor', 'arsiv']).optional()),
  icon: z.preprocess(emptyToUndefined, z.enum(PROJECT_ICONS).optional()),
  color: z.preprocess(emptyToUndefined, z.enum(PROJECT_COLORS).optional()),
  cover: optionalText,
  coverAlt: optionalLocalizedText,
  gallery: z.preprocess(
    nullToArray,
    z.array(z.object({ image: z.string().min(1), alt: optionalLocalizedText })),
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

export const AWARD_ICONS = ['trophy', 'award', 'writing'] as const;

export const LINK_KINDS = ['github', 'linkedin', 'medium', 'youtube', 'x', 'instagram', 'website', 'diger'] as const;

export const profileSchema = z.object({
  name: z.string().min(1),
  title: localizedText,
  shortBio: localizedText,
  bio: localizedText,
  location: optionalLocalizedText,
  email: z.preprocess(emptyToUndefined, z.email({ error: 'E-posta adresi geçersiz.' }).optional()),
  phone: optionalText,
  avatar: optionalText,
  avatarAlt: optionalLocalizedText,
  cv: optionalText,
  experience: z.preprocess(
    nullToArray,
    z.array(
      z.object({
        role: localizedText,
        organization: localizedText,
        location: optionalLocalizedText,
        period: optionalLocalizedText,
        highlights: localizedList,
      }),
    ),
  ),
  education: z.preprocess(
    nullToArray,
    z.array(
      z.object({
        school: localizedText,
        program: optionalLocalizedText,
        location: optionalLocalizedText,
        period: optionalLocalizedText,
      }),
    ),
  ),
  skills: z.preprocess(nullToArray, z.array(z.object({ group: localizedText, items: stringList }))),
  awards: z.preprocess(
    nullToArray,
    z.array(
      z.object({
        title: localizedText,
        detail: optionalLocalizedText,
        description: optionalLocalizedText,
        icon: z.preprocess(emptyToUndefined, z.enum(AWARD_ICONS).optional()),
      }),
    ),
  ),
  links: z.preprocess(
    nullToArray,
    z.array(z.object({ label: z.string().min(1), url: httpUrl, kind: z.enum(LINK_KINDS) })),
  ),
  siteDescription: localizedText,
  googleSiteVerification: optionalText,
});

export const taxonomySchema = z.object({
  categories: z
    .array(
      z.object({
        id: urlSlug,
        label: localizedText,
        description: optionalLocalizedText,
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
        title: localizedText,
        description: optionalLocalizedText,
        published: z.boolean().default(false),
        chapters: z.array(
          z.object({
            title: localizedText,
            parts: z.array(
              z.object({
                ref: z.string().min(1),
                title: optionalLocalizedText,
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
