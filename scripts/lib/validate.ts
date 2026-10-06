/**
 * Build öncesi içerik ve adres kontrolü.
 *
 * Editörün (Pages CMS) kaydettiği dosyalar, Astro'nun kullandığı şemalar ve
 * yayın kurallarıyla aynı şekilde okunur. Yayına açılmış bir içerikte eksik
 * bilgi varsa hata verilir; build durur ve önceki canlı sürüm yayında kalır.
 * Taslaklar eksik bilgiyle kaydedilebilir.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import type { z } from 'astro/zod';
import { parse as parseYaml } from 'yaml';
import { blogPostIssues, findDuplicates, isPublished, localNoteIssues, projectIssues } from '../../src/lib/content/rules.ts';
import {
  blogSchema,
  importedNoteSchema,
  localNoteSchema,
  profileSchema,
  projectSchema,
  seriesSchema,
  taxonomySchema,
} from '../../src/lib/content/schemas.ts';
import { LOCAL_NOTE_SOURCE_ID, parseContentPath, paths } from '../../src/lib/content/urls.ts';
import { splitFrontmatter } from './markdown-scan.ts';

export interface ValidationResult {
  errors: string[];
  warnings: string[];
  counts: { blog: number; blogPublished: number; notes: number; imported: number; projects: number };
}

interface MarkdownFile {
  file: string;
  data: Record<string, unknown>;
  body: string;
}

function listMarkdown(root: string, dir: string): MarkdownFile[] {
  const absolute = path.join(root, dir);
  if (!existsSync(absolute)) return [];
  const files: MarkdownFile[] = [];
  const walk = (current: string) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.md')) {
        const { data, body } = splitFrontmatter(readFileSync(full, 'utf8').replace(/^﻿/, ''));
        files.push({ file: path.relative(root, full).split(path.sep).join('/'), data, body });
      }
    }
  };
  walk(absolute);
  return files.sort((a, b) => a.file.localeCompare(b.file));
}

function zodMessages(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.length ? `"${issue.path.join('.')}" alanı: ` : ''}${issue.message}`)
    .join('; ');
}

function publicFileExists(root: string, url: string): boolean {
  if (!url.startsWith('/') || url.startsWith('//')) return true;
  let decoded: string;
  try {
    decoded = decodeURI(url.split(/[?#]/)[0] ?? '');
  } catch {
    return false;
  }
  return existsSync(path.join(root, 'public', decoded));
}

const MARKDOWN_IMAGE = /!\[[^\]]*\]\(\s*<?([^)\s>]+)>?/g;

export function validateContent(root: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const readJson = (file: string): unknown => JSON.parse(readFileSync(path.join(root, file), 'utf8'));

  // Kategoriler
  const taxonomyResult = taxonomySchema.safeParse(readJson('src/data/taxonomy.json'));
  if (!taxonomyResult.success) {
    errors.push(`src/data/taxonomy.json: ${zodMessages(taxonomyResult.error)}`);
  }
  const categoryIds = new Set(taxonomyResult.success ? taxonomyResult.data.categories.map((c) => c.id) : []);
  const ctx = { categoryIds };

  // Pages CMS kategori seçenekleri taxonomy.json ile aynı olmalı.
  const pagesConfigPath = path.join(root, '.pages.yml');
  if (existsSync(pagesConfigPath)) {
    const pagesConfig = parseYaml(readFileSync(pagesConfigPath, 'utf8')) as {
      content?: Array<{ name: string; fields?: Array<{ name: string; type: string; options?: { values?: Array<{ name: string }> } }> }>;
    };
    for (const entry of pagesConfig.content ?? []) {
      const field = entry.fields?.find((item) => item.name === 'category' && item.type === 'select');
      if (!field) continue;
      const options = new Set((field.options?.values ?? []).map((value) => value.name));
      const missing = [...categoryIds].filter((id) => !options.has(id));
      const extra = [...options].filter((id) => !categoryIds.has(id));
      if (missing.length || extra.length) {
        errors.push(
          `.pages.yml "${entry.name}" kategori seçenekleri src/data/taxonomy.json ile aynı değil` +
            `${missing.length ? ` (eksik: ${missing.join(', ')})` : ''}${extra.length ? ` (fazla: ${extra.join(', ')})` : ''}.`,
        );
      }
    }
  }

  const published = {
    blog: new Set<string>(),
    notes: new Set<string>(),
    projects: new Set<string>(),
  };

  // Blog yazıları
  const blogFiles = listMarkdown(root, 'src/content/blog');
  const blogEntries: Array<{ file: string; slug: string }> = [];
  for (const { file, data, body } of blogFiles) {
    const parsed = blogSchema.safeParse(data);
    if (!parsed.success) {
      errors.push(`${file}: ${zodMessages(parsed.error)}`);
      continue;
    }
    if (!isPublished(parsed.data)) continue;
    for (const issue of blogPostIssues(parsed.data, body, ctx)) errors.push(`${file}: Yayında ama ${lowerFirst(issue)}`);
    if (parsed.data.cover && !publicFileExists(root, parsed.data.cover)) {
      errors.push(`${file}: Kapak görseli bulunamadı (${parsed.data.cover}).`);
    }
    for (const match of body.matchAll(MARKDOWN_IMAGE)) {
      const src = match[1] ?? '';
      if (!publicFileExists(root, src)) warnings.push(`${file}: Yazıdaki görsel bulunamadı (${src}).`);
    }
    blogEntries.push({ file, slug: parsed.data.urlSlug });
    published.blog.add(parsed.data.urlSlug);
  }
  for (const [slug, group] of findDuplicates(blogEntries, (entry) => entry.slug)) {
    errors.push(`Aynı yazı adresi (${paths.blogPost(slug)}) birden fazla yazıda kullanılmış: ${group.map((g) => g.file).join(', ')}`);
  }

  // Yerel notlar
  const noteEntries: Array<{ file: string; key: string }> = [];
  for (const { file, data, body } of listMarkdown(root, 'src/content/notes')) {
    const parsed = localNoteSchema.safeParse(data);
    if (!parsed.success) {
      errors.push(`${file}: ${zodMessages(parsed.error)}`);
      continue;
    }
    if (!isPublished(parsed.data)) continue;
    for (const issue of localNoteIssues(parsed.data, body, ctx)) errors.push(`${file}: Yayında ama ${lowerFirst(issue)}`);
    const key = `${LOCAL_NOTE_SOURCE_ID}/${parsed.data.urlSlug}`;
    noteEntries.push({ file, key });
    published.notes.add(key);
  }

  // İçe aktarılan notlar
  const importedFiles = listMarkdown(root, 'generated/notes');
  for (const { file, data } of importedFiles) {
    const parsed = importedNoteSchema.safeParse(data);
    if (!parsed.success) {
      errors.push(`${file}: ${zodMessages(parsed.error)} (bu dosya üretilir; npm run sync:notes ile yeniden üret)`);
      continue;
    }
    if (parsed.data.sourceId === LOCAL_NOTE_SOURCE_ID) {
      errors.push(`${file}: "${LOCAL_NOTE_SOURCE_ID}" kaynak kimliği içe aktarılan notlarda kullanılamaz.`);
    }
    const key = `${parsed.data.sourceId}/${parsed.data.noteSlug}`;
    noteEntries.push({ file, key });
    published.notes.add(key);
  }
  for (const [key, group] of findDuplicates(noteEntries, (entry) => entry.key)) {
    errors.push(`Aynı not adresi (/notlar/${key}/) birden fazla notta kullanılmış: ${group.map((g) => g.file).join(', ')}`);
  }

  // Projeler
  const projectEntries: Array<{ file: string; slug: string }> = [];
  const projectFiles = listMarkdown(root, 'src/content/projects');
  for (const { file, data, body } of projectFiles) {
    const parsed = projectSchema.safeParse(data);
    if (!parsed.success) {
      errors.push(`${file}: ${zodMessages(parsed.error)}`);
      continue;
    }
    if (!isPublished(parsed.data)) continue;
    for (const issue of projectIssues(parsed.data, body)) errors.push(`${file}: Yayında ama ${lowerFirst(issue)}`);
    for (const image of [parsed.data.cover, ...parsed.data.gallery.map((item) => item.image)]) {
      if (image && !publicFileExists(root, image)) errors.push(`${file}: Görsel bulunamadı (${image}).`);
    }
    projectEntries.push({ file, slug: parsed.data.urlSlug });
    published.projects.add(parsed.data.urlSlug);
  }
  for (const [slug, group] of findDuplicates(projectEntries, (entry) => entry.slug)) {
    errors.push(`Aynı proje adresi (${paths.project(slug)}) birden fazla projede kullanılmış: ${group.map((g) => g.file).join(', ')}`);
  }

  // Profil
  const profileResult = profileSchema.safeParse(readJson('src/data/profile.json'));
  if (!profileResult.success) {
    errors.push(`src/data/profile.json: ${zodMessages(profileResult.error)}`);
  } else {
    for (const file of [profileResult.data.avatar, profileResult.data.cv]) {
      if (file && !publicFileExists(root, file)) errors.push(`src/data/profile.json: Dosya bulunamadı (${file}).`);
    }
  }

  // Çalışma serileri
  const seriesResult = seriesSchema.safeParse(readJson('src/data/series.json'));
  if (!seriesResult.success) {
    errors.push(`src/data/series.json: ${zodMessages(seriesResult.error)}`);
  } else {
    for (const [id] of findDuplicates(seriesResult.data.series, (series) => series.id)) {
      errors.push(`src/data/series.json: "${id}" seri kimliği birden fazla kez kullanılmış.`);
    }
    for (const series of seriesResult.data.series.filter((item) => item.published)) {
      series.chapters.forEach((chapter) => {
        chapter.parts.forEach((part) => {
          const ref = parseContentPath(part.ref);
          const found =
            ref &&
            ((ref.kind === 'blog' && published.blog.has(ref.slug)) ||
              (ref.kind === 'project' && published.projects.has(ref.slug)) ||
              (ref.kind === 'note' && published.notes.has(`${ref.sourceId}/${ref.slug}`)));
          if (!found) {
            errors.push(
              `src/data/series.json: "${series.title}" serisindeki "${part.ref}" adresi yayınlanmış bir içeriğe karşılık gelmiyor.`,
            );
          }
        });
      });
    }
  }

  return {
    errors,
    warnings,
    counts: {
      blog: blogFiles.length,
      blogPublished: published.blog.size,
      notes: published.notes.size,
      imported: importedFiles.length,
      projects: published.projects.size,
    },
  };
}

function lowerFirst(value: string): string {
  return value.charAt(0).toLocaleLowerCase('tr') + value.slice(1);
}
