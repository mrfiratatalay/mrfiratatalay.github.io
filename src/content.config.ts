import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { blogSchema, importedNoteSchema, localNoteSchema, projectSchema } from './lib/content/schemas.ts';

/** Pages CMS'nin "Makaleler" bölümünden yazılan blog yazıları. */
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: blogSchema,
});

/** Pages CMS'nin "Öğrenme Notları" bölümünden eklenen yeni notlar (kaynak kimliği: yerel). */
const notes = defineCollection({
  loader: glob({ base: './src/content/notes', pattern: '**/*.md' }),
  schema: localNoteSchema,
});

/**
 * Not repolarından build sırasında içe aktarılan notlar.
 * `npm run sync:notes` üretir; bu klasör Git'e eklenmez ve elle düzenlenmez.
 */
const importedNotes = defineCollection({
  loader: glob({ base: './generated/notes', pattern: '**/*.md' }),
  schema: importedNoteSchema,
});

/** Pages CMS'nin "Projeler" bölümü. */
const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: projectSchema,
});

export const collections = { blog, notes, importedNotes, projects };
