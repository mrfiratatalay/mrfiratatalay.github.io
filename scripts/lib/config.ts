/**
 * `config/note-sources.json` dosyasını okur ve doğrular.
 */
import { readFileSync } from 'node:fs';
import { z } from 'astro/zod';
import { SLUG_PATTERN, isValidNoteSlug } from '../../src/lib/content/slug.ts';
import { taxonomySchema } from '../../src/lib/content/schemas.ts';
import { LOCAL_NOTE_SOURCE_ID } from '../../src/lib/content/urls.ts';

/** GitHub kullanıcı/repo adı: `kullanici/repo`. */
const REPOSITORY_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9._-]{1,100}$/;
/** Branch adı: tire ile başlamaz, `..` içermez. */
const BRANCH_PATTERN = /^(?!-)(?!.*\.\.)[A-Za-z0-9._/-]{1,200}$/;

const repoRelativePath = z
  .string()
  .refine(
    (value) => !value.startsWith('/') && !value.includes('\\') && !value.split('/').includes('..'),
    { error: 'Yol göreli olmalı ve repo dışına çıkmamalı ("..", "/" ile başlama veya "\\" kullanılamaz).' },
  );

export const sourceSchema = z.object({
  id: z
    .string()
    .regex(SLUG_PATTERN, { error: 'Kaynak kimliği küçük harf, rakam ve tire içermeli.' })
    .refine((id) => id !== LOCAL_NOTE_SOURCE_ID, {
      error: `"${LOCAL_NOTE_SOURCE_ID}" kimliği editörden eklenen yeni notlar için ayrılmıştır.`,
    }),
  label: z.string().min(1),
  description: z.string().optional(),
  repository: z.string().regex(REPOSITORY_PATTERN, { error: 'Repo "kullanici/repo" biçiminde olmalı.' }),
  branch: z.string().regex(BRANCH_PATTERN, { error: 'Branch adı geçersiz.' }),
  enabled: z.boolean(),
  category: z.string().regex(SLUG_PATTERN),
  root: repoRelativePath.default(''),
  include: z.array(repoRelativePath.pipe(z.string().min(1))).min(1, { error: 'En az bir include deseni gerekli.' }),
  exclude: z.array(repoRelativePath).default([]),
  order: z.number().default(100),
  /** Dosya taşındığında eski adresi korumak veya çakışmayı çözmek için: { "kök-içi/yol.md": "adres/parcasi" } */
  addressMap: z.record(z.string(), z.string()).default({}),
});

const limitsSchema = z.object({
  maxMarkdownBytes: z.number().int().positive().default(2 * 1024 * 1024),
  maxAssetBytes: z.number().int().positive().default(4 * 1024 * 1024),
  maxImageWidth: z.number().int().positive().default(1600),
  timeoutSeconds: z.number().positive().default(120),
  retries: z.number().int().min(0).max(5).default(2),
});

const configSchema = z.preprocess(
  (value) => (Array.isArray(value) ? { sources: value } : value),
  z.object({
    concurrency: z.number().int().min(1).max(3).default(2),
    limits: limitsSchema.prefault({}),
    sources: z.array(sourceSchema),
  }),
);

export type NoteSource = z.infer<typeof sourceSchema>;
export type NoteSourcesConfig = z.infer<typeof configSchema>;

export class ConfigError extends Error {
  readonly problems: string[];
  constructor(problems: string[]) {
    super(`Not kaynakları ayarı geçersiz:\n- ${problems.join('\n- ')}`);
    this.problems = problems;
  }
}

function formatZodIssues(error: z.ZodError, prefix: string): string[] {
  return error.issues.map((issue) => `${prefix}${issue.path.length ? issue.path.join('.') + ': ' : ''}${issue.message}`);
}

export function readCategoryIds(taxonomyPath: string): Set<string> {
  const taxonomy = taxonomySchema.parse(JSON.parse(readFileSync(taxonomyPath, 'utf8')));
  return new Set(taxonomy.categories.map((category) => category.id));
}

export function loadNoteSourcesConfig(configPath: string, categoryIds: ReadonlySet<string>): NoteSourcesConfig {
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(configPath, 'utf8'));
  } catch (error) {
    throw new ConfigError([`${configPath} okunamadı: ${(error as Error).message}`]);
  }
  const parsed = configSchema.safeParse(raw);
  if (!parsed.success) throw new ConfigError(formatZodIssues(parsed.error, ''));

  const problems: string[] = [];
  const seen = new Set<string>();
  for (const source of parsed.data.sources) {
    if (seen.has(source.id)) problems.push(`"${source.id}" kaynak kimliği birden fazla kez kullanılmış.`);
    seen.add(source.id);
    if (!categoryIds.has(source.category)) {
      problems.push(`"${source.id}": "${source.category}" kategorisi src/data/taxonomy.json içinde yok.`);
    }
    for (const [file, slug] of Object.entries(source.addressMap)) {
      if (!isValidNoteSlug(slug)) {
        problems.push(`"${source.id}": addressMap içindeki "${file}" için verilen "${slug}" adresi geçersiz.`);
      }
    }
  }
  if (problems.length > 0) throw new ConfigError(problems);
  return parsed.data;
}
