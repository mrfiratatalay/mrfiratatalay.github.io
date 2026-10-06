/**
 * Not repolarını içe aktarma.
 *
 * Akış (bkz. görev belgesi 13.3):
 *  1. Kaynak ayarını doğrula, açık kaynakları çıkar.
 *  2. Her repoyu geçici klasöre indir, gerçek commit kimliğini kaydet.
 *  3. Seçilen Markdown dosyalarını bul, başlık ve ön bilgiyi oku.
 *  4. Kararlı not adreslerini üret; çakışma varsa dur.
 *  5. Görsel ve not bağlantılarını düzelt, görselleri kopyala.
 *  6. Sonucu geçici bir hazırlık (staging) alanına yaz.
 *  7. Bütün kaynaklar başarılıysa önceki çıktıyla tek seferde değiştir.
 *
 * Herhangi bir adım başarısız olursa önceki içe aktarma ve canlı site olduğu gibi kalır.
 */
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { copyFile, lstat, mkdir, mkdtemp, readFile, readdir, realpath, rename, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { glob } from 'tinyglobby';
import { stringify as stringifyYaml } from 'yaml';
import { isMarkdownPath, notePathToSlug, slugify } from '../../src/lib/content/slug.ts';
import { paths } from '../../src/lib/content/urls.ts';
import { MISSING_IMAGE_URL } from '../../src/lib/markdown/markers.ts';
import { ConfigError, loadNoteSourcesConfig, readCategoryIds, type NoteSource, type NoteSourcesConfig } from './config.ts';
import { fetchWithRetry, mapWithConcurrency, type SourceFetcher } from './fetchers.ts';
import {
  analyzeMarkdown,
  findUrlOccurrences,
  headingIdForText,
  headingIds,
  looseHeadingId,
  promoteSectionHeadings,
  removeRange,
  replaceOccurrences,
  splitFrontmatter,
  type UrlOccurrence,
} from './markdown-scan.ts';

export class ImportError extends Error {
  readonly problems: string[];
  constructor(message: string, problems: string[]) {
    super(message);
    this.problems = problems;
  }
}

export type ImportMode = 'production' | 'ornek' | 'yerel-onizleme';

export interface ImportOptions {
  projectRoot: string;
  configPath: string;
  taxonomyPath: string;
  fetcher: SourceFetcher;
  mode: ImportMode;
  /** Ayarda kapalı olsa da bu kaynakları içe aktar (yalnızca yerel önizleme için). */
  forceEnable?: readonly string[];
  log?: (message: string) => void;
  now?: () => Date;
}

export interface SkippedFile {
  path: string;
  reason: string;
}

export interface SourceReport {
  id: string;
  label: string;
  labelEn?: string;
  description?: string;
  descriptionEn?: string;
  lang?: 'tr' | 'en';
  category: string;
  order: number;
  repository: string;
  branch: string;
  root: string;
  commit: string;
  fetchNote?: string;
  checkedAt: string;
  noteCount: number;
  assetCount: number;
  skipped: SkippedFile[];
  warnings: string[];
}

export interface ImportReport {
  generatedAt: string;
  mode: ImportMode;
  sources: SourceReport[];
}

interface Checkout {
  repository: string;
  branch: string;
  dir: string;
  realDir: string;
  commit: string;
  note?: string;
  mirror?: { repository: string; root: string; ref: string };
}

interface PlannedNote {
  source: NoteSource;
  checkout: Checkout;
  repoPath: string;
  rootRelative: string;
  slug: string;
  url: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  excerpt?: string;
  headingIds: Set<string>;
  /** Sayfa başlığına dönüştürülen H1'in GitHub'daki kimliği. */
  titleId?: string;
}

interface ImageInfo {
  url: string;
}

interface AssetManifestEntry {
  original: string;
  width: number;
  height: number;
}

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg']);
const naturalCompare = new Intl.Collator('tr', { numeric: true, sensitivity: 'base' }).compare;

/** Repo sırası: önce üst klasör, klasör içinde önce README/index, sonra diğer dosyalar (doğal sıra). */
function compareNotePaths(a: string, b: string): number {
  const dirA = path.posix.dirname(a);
  const dirB = path.posix.dirname(b);
  if (dirA !== dirB) return naturalCompare(dirA, dirB);
  const indexA = /^(readme|index)\.(md|markdown)$/i.test(path.posix.basename(a)) ? 0 : 1;
  const indexB = /^(readme|index)\.(md|markdown)$/i.test(path.posix.basename(b)) ? 0 : 1;
  return indexA - indexB || naturalCompare(path.posix.basename(a), path.posix.basename(b));
}

export function shortHash(value: string, length = 6): string {
  return createHash('sha1').update(value).digest('hex').slice(0, length);
}

function formatBytes(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}

function repoKey(repository: string, branch: string): string {
  return `${repository}#${branch}`;
}

function isImagePath(file: string): boolean {
  return IMAGE_EXTENSIONS.has(path.posix.extname(file).toLowerCase());
}

function encodePath(file: string): string {
  return file.split('/').map(encodeURIComponent).join('/');
}

function githubUrl(checkout: Checkout, kind: 'blob' | 'tree', file: string): string {
  if (checkout.mirror) {
    const mirror = checkout.mirror;
    return `https://github.com/${mirror.repository}/${kind}/${encodePath(mirror.ref)}/${encodePath(path.posix.join(mirror.root, file))}`.replace(/\/$/, '');
  }
  const ref = /^[0-9a-f]{40}$/.test(checkout.commit) ? checkout.commit : checkout.branch;
  return `https://github.com/${checkout.repository}/${kind}/${encodePath(ref)}/${encodePath(file)}`.replace(/\/$/, '');
}

function titleFromFileName(file: string): string {
  const base = path.posix.basename(file).replace(/\.(md|markdown)$/i, '');
  return base.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim() || base;
}

function sameText(a: string, b: string): boolean {
  const normalize = (value: string) => value.replace(/\s+/g, ' ').trim().toLocaleLowerCase('tr');
  return normalize(a) === normalize(b);
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function readDate(data: Record<string, unknown>, keys: string[], warnings: string[], file: string): string | undefined {
  for (const key of keys) {
    const value = data[key];
    if (value === undefined || value === null || value === '') continue;
    const date = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(date.getTime())) {
      warnings.push(`${file}: "${key}" tarihi geçersiz (${String(value)}); tarih gösterilmeyecek.`);
      return undefined;
    }
    return date.toISOString().slice(0, 10);
  }
  return undefined;
}

function readTags(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((tag): tag is string => typeof tag === 'string' && tag.trim() !== '');
  if (typeof value === 'string') return value.split(',').map((tag) => tag.trim()).filter(Boolean);
  return [];
}

function describeFetchError(reason: unknown): string {
  const message = reason instanceof Error ? reason.message : String(reason);
  if (/could not read Username|Authentication failed|Repository not found|not found/i.test(message)) {
    return `${message} (Repo veya branch adı yanlış ya da repo özel olabilir. İlk sürüm yalnızca public repoları destekler.)`;
  }
  return message;
}

class ImportRun {
  private readonly problems: string[] = [];
  private readonly reports = new Map<string, SourceReport>();
  private readonly notesByKey = new Map<string, PlannedNote>();
  private readonly directoryCache = new Map<string, Promise<string[] | null>>();
  private readonly assets = new Map<string, ImageInfo | null>();
  private readonly assetOwners = new Map<string, string>();
  private readonly manifest: Record<string, AssetManifestEntry> = {};
  private readonly config: NoteSourcesConfig;
  private readonly sources: NoteSource[];
  private readonly staging: string;
  private readonly options: ImportOptions;
  private readonly log: (message: string) => void;

  constructor(
    config: NoteSourcesConfig,
    sources: NoteSource[],
    staging: string,
    options: ImportOptions,
    log: (message: string) => void,
  ) {
    this.config = config;
    this.sources = sources;
    this.staging = staging;
    this.options = options;
    this.log = log;
  }

  private fail(message: string): never {
    throw new ImportError(message, this.problems);
  }

  async run(workDir: string): Promise<ImportReport> {
    const checkouts = await this.fetchSources(workDir);
    const planned = await this.planNotes(checkouts);
    if (this.problems.length > 0) this.fail('Not kaynaklarında düzeltilmesi gereken sorunlar var.');

    await mkdir(path.join(this.staging, 'notes'), { recursive: true });
    await mkdir(path.join(this.staging, 'assets'), { recursive: true });
    for (const note of planned) await this.writeNote(note);
    if (this.problems.length > 0) this.fail('Not kaynaklarında düzeltilmesi gereken sorunlar var.');

    const report: ImportReport = {
      generatedAt: (this.options.now?.() ?? new Date()).toISOString(),
      mode: this.options.mode,
      sources: [...this.reports.values()].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id)),
    };
    await writeFile(path.join(this.staging, 'source-status.json'), `${JSON.stringify(report, null, 2)}\n`);
    await writeFile(path.join(this.staging, 'asset-manifest.json'), `${JSON.stringify(this.manifest, null, 2)}\n`);
    return report;
  }

  private async fetchSources(workDir: string): Promise<Map<string, Checkout>> {
    const unique = [...new Map(this.sources.map((source) => [repoKey(source.repository, source.branch), source])).values()];
    const { limits } = this.config;
    const results = await mapWithConcurrency(unique, this.config.concurrency, async (source) => {
      const destination = path.join(workDir, `repo-${shortHash(repoKey(source.repository, source.branch), 10)}`);
      this.log(`→ ${source.repository} (${source.branch}) alınıyor…`);
      const result = await fetchWithRetry(
        this.options.fetcher,
        { repository: source.repository, branch: source.branch, destination, timeoutMs: limits.timeoutSeconds * 1000 },
        limits.retries,
        this.log,
      );
      this.log(`  ✓ ${source.repository} @ ${result.commit.slice(0, 12)}${result.note ? ` (${result.note})` : ''}`);
      const checkout: Checkout = {
        repository: source.repository,
        branch: source.branch,
        dir: destination,
        realDir: await realpath(destination),
        commit: result.commit,
      };
      if (result.note) checkout.note = result.note;
      if (result.mirror) checkout.mirror = result.mirror;
      return checkout;
    });

    const checkouts = new Map<string, Checkout>();
    results.forEach((result, index) => {
      const source = unique[index] as NoteSource;
      const key = repoKey(source.repository, source.branch);
      if (result.status === 'fulfilled') {
        checkouts.set(key, result.value);
      } else {
        const users = this.sources.filter((item) => repoKey(item.repository, item.branch) === key).map((item) => item.id);
        this.problems.push(
          `${source.repository} (${source.branch}) alınamadı: ${describeFetchError(result.reason)} — etkilenen kaynaklar: ${users.join(', ')}`,
        );
      }
    });
    if (this.problems.length > 0) {
      this.fail('Bazı not kaynakları alınamadı. Önceki içe aktarma ve canlı site değiştirilmedi.');
    }
    return checkouts;
  }

  private async listDirectory(dir: string): Promise<string[] | null> {
    let cached = this.directoryCache.get(dir);
    if (!cached) {
      cached = readdir(dir).catch(() => null);
      this.directoryCache.set(dir, cached);
    }
    return cached;
  }

  /**
   * Repo içi yolu gerçek dosya adına çözer. Önce birebir, sonra Unicode
   * normalleştirmesiyle, en son büyük/küçük harf farkını yok sayarak arar.
   */
  private async resolveRepoPath(
    checkout: Checkout,
    repoPath: string,
  ): Promise<{ path: string; isDirectory: boolean; caseMismatch: boolean } | null> {
    const segments = repoPath.split('/').filter(Boolean);
    let current = checkout.dir;
    const actual: string[] = [];
    let caseMismatch = false;
    for (const segment of segments) {
      const entries = await this.listDirectory(current);
      if (!entries) return null;
      const nfc = segment.normalize('NFC');
      let match = entries.find((entry) => entry === segment) ?? entries.find((entry) => entry.normalize('NFC') === nfc);
      if (!match) {
        const lower = nfc.toLocaleLowerCase('tr');
        match = entries.find((entry) => entry.normalize('NFC').toLocaleLowerCase('tr') === lower);
        if (!match) return null;
        caseMismatch = true;
      }
      actual.push(match);
      current = path.join(current, match);
    }
    const info = await lstat(current).catch(() => null);
    if (!info) return null;
    if (info.isSymbolicLink()) {
      const real = await realpath(current).catch(() => null);
      if (!real || !real.startsWith(checkout.realDir + path.sep)) return null;
    }
    return { path: actual.join('/'), isDirectory: info.isDirectory(), caseMismatch };
  }

  private report(source: NoteSource, checkout: Checkout): SourceReport {
    let report = this.reports.get(source.id);
    if (!report) {
      report = {
        id: source.id,
        label: source.label,
        category: source.category,
        order: source.order,
        repository: source.repository,
        branch: source.branch,
        root: source.root,
        commit: checkout.commit,
        checkedAt: (this.options.now?.() ?? new Date()).toISOString(),
        noteCount: 0,
        assetCount: 0,
        skipped: [],
        warnings: [],
      };
      if (source.description) report.description = source.description;
      if (source.labelEn) report.labelEn = source.labelEn;
      if (source.descriptionEn) report.descriptionEn = source.descriptionEn;
      report.lang = source.lang;
      if (checkout.note) report.fetchNote = checkout.note;
      this.reports.set(source.id, report);
    }
    return report;
  }

  private async planNotes(checkouts: Map<string, Checkout>): Promise<PlannedNote[]> {
    const planned: PlannedNote[] = [];
    const { limits } = this.config;

    for (const source of this.sources) {
      const checkout = checkouts.get(repoKey(source.repository, source.branch));
      if (!checkout) continue;
      const report = this.report(source, checkout);
      const rootDir = path.join(checkout.dir, ...source.root.split('/').filter(Boolean));
      const rootInfo = await stat(rootDir).catch(() => null);
      if (!rootInfo?.isDirectory()) {
        this.problems.push(`"${source.id}": kök klasör repoda bulunamadı: "${source.root}"`);
        continue;
      }

      const matches = (
        await glob([...source.include], {
          cwd: rootDir,
          ignore: [...source.exclude],
          onlyFiles: true,
          dot: false,
          followSymbolicLinks: false,
          caseSensitiveMatch: false,
          expandDirectories: false,
        })
      ).sort(compareNotePaths);

      const bySlug = new Map<string, string>();
      let markdownCount = 0;
      for (const rootRelative of matches) {
        const repoPath = path.posix.join(source.root, rootRelative);
        if (/\.mdx$/i.test(rootRelative)) {
          report.skipped.push({ path: repoPath, reason: 'MDX dosyaları güvenlik nedeniyle içe aktarılmaz.' });
          continue;
        }
        if (!isMarkdownPath(rootRelative)) {
          report.skipped.push({ path: repoPath, reason: 'Markdown dosyası değil.' });
          continue;
        }
        markdownCount += 1;
        const absolute = path.join(rootDir, ...rootRelative.split('/'));
        const info = await lstat(absolute);
        if (info.isSymbolicLink()) {
          const real = await realpath(absolute).catch(() => null);
          if (!real || !real.startsWith(checkout.realDir + path.sep)) {
            this.problems.push(`"${source.id}": "${repoPath}" repo dışını gösteren bir sembolik bağlantı.`);
            continue;
          }
        }
        const size = (await stat(absolute)).size;
        if (size > limits.maxMarkdownBytes) {
          this.problems.push(
            `"${source.id}": "${repoPath}" ${formatBytes(size)}; tek Markdown dosyası sınırı ${formatBytes(limits.maxMarkdownBytes)}. Dosyayı böl veya limits.maxMarkdownBytes değerini artır.`,
          );
          continue;
        }

        const raw = (await readFile(absolute, 'utf8')).replace(/^﻿/, '');
        const { data: originalData, body: sourceBody, warning } = splitFrontmatter(raw);
        const originalBody = source.normalizeSectionHeadings ? promoteSectionHeadings(sourceBody) : sourceBody;
        const metadata = Object.entries(source.noteMetadata).find(
          ([file]) => file.toLowerCase() === rootRelative.toLowerCase(),
        )?.[1];
        const data: Record<string, unknown> = { ...originalData, ...metadata };
        if (warning) report.warnings.push(`${repoPath}: ${warning}`);
        if (data.published === false || data.draft === true) {
          report.skipped.push({ path: repoPath, reason: 'Taslak olarak işaretli (published: false veya draft: true).' });
          continue;
        }
        if (!originalBody.trim()) {
          report.skipped.push({ path: repoPath, reason: 'Boş dosya.' });
          continue;
        }

        const analysis = analyzeMarkdown(originalBody);
        const frontmatterTitle = typeof data.title === 'string' && data.title.trim() ? data.title.trim() : undefined;
        const title = frontmatterTitle ?? analysis.firstH1?.text ?? titleFromFileName(rootRelative);
        let body = originalBody;
        let titleId: string | undefined;
        if (
          analysis.startsWithH1 &&
          analysis.firstH1 &&
          (!frontmatterTitle || sameText(frontmatterTitle, analysis.firstH1.text))
        ) {
          body = removeRange(body, analysis.firstH1.start, analysis.firstH1.end);
          titleId = headingIdForText(analysis.firstH1.text);
        }
        if (!body.trim()) {
          report.skipped.push({ path: repoPath, reason: 'Başlık dışında içerik yok.' });
          continue;
        }

        const slug =
          source.addressMap[rootRelative] ?? notePathToSlug(rootRelative, (segment) => `bolum-${shortHash(segment)}`);
        const existing = bySlug.get(slug);
        if (existing) {
          this.problems.push(
            `"${source.id}": "${existing}" ve "${repoPath}" aynı adrese dönüşüyor (${paths.note(source.id, slug)}). ` +
              `config/note-sources.json içinde bu dosyalardan birine "addressMap" ile açık adres ver.`,
          );
          continue;
        }
        bySlug.set(slug, repoPath);

        const note: PlannedNote = {
          source,
          checkout,
          repoPath,
          rootRelative,
          slug,
          url: paths.note(source.id, slug),
          title,
          body,
          data,
          headingIds: headingIds(body),
        };
        if (analysis.excerpt) note.excerpt = analysis.excerpt;
        if (titleId) note.titleId = titleId;
        planned.push(note);
        this.notesByKey.set(`${repoKey(source.repository, source.branch)}:${repoPath}`, note);
      }

      if (markdownCount === 0) {
        this.problems.push(
          `"${source.id}": include seçimine uyan Markdown dosyası bulunamadı (kök: "${source.root || '/'}", include: ${JSON.stringify(source.include)}). Seçimi kontrol et.`,
        );
      }
    }
    return planned;
  }

  private lookupNote(checkout: Checkout, repoPath: string): PlannedNote | undefined {
    return this.notesByKey.get(`${repoKey(checkout.repository, checkout.branch)}:${repoPath}`);
  }

  private async findIndexNote(checkout: Checkout, directory: string): Promise<PlannedNote | undefined> {
    const entries = (await this.listDirectory(path.join(checkout.dir, ...directory.split('/').filter(Boolean)))) ?? [];
    for (const candidate of ['readme.md', 'index.md', 'readme.markdown', 'index.markdown']) {
      const name = entries.find((entry) => entry.toLowerCase() === candidate);
      if (name) {
        const note = this.lookupNote(checkout, directory ? `${directory}/${name}` : name);
        if (note) return note;
      }
    }
    return undefined;
  }

  /**
   * Bağlantıdaki `#başlık` parçasını hedef notun gerçek başlık kimliğiyle eşleştirir.
   * - Birebir eşleşme: olduğu gibi kalır.
   * - Sayfa başlığına (kaldırılan H1) verilen bağlantı: sayfanın başına gider.
   * - Yalnızca büyük/küçük harf veya Türkçe "İ" farkı: gerçek kimliğe düzeltilir, uyarı verilir.
   */
  private matchFragment(
    target: PlannedNote,
    fragmentRaw: string,
    url: string,
    sameNote: boolean,
  ): { suffix: string; warning?: string } {
    if (!fragmentRaw) return { suffix: '' };
    const fragment = safeDecode(fragmentRaw);
    if (target.headingIds.has(fragment)) return { suffix: `#${fragmentRaw}` };
    const loose = looseHeadingId(fragment);
    if (target.titleId && looseHeadingId(target.titleId) === loose) return { suffix: '' };
    const candidates = [...target.headingIds].filter((id) => looseHeadingId(id) === loose);
    if (candidates.length === 1 && candidates[0]) {
      return {
        suffix: `#${encodeURIComponent(candidates[0])}`,
        warning: `"${url}" bağlantısındaki "#${fragment}" başlığı "#${candidates[0]}" olarak düzeltildi (GitHub'da bu bağlantı çalışmayabilir).`,
      };
    }
    return {
      suffix: `#${fragmentRaw}`,
      warning: url.startsWith('#')
        ? `"#${fragment}" başlığı bu notta bulunamadı.`
        : `"${url}" bağlantısındaki "#${fragment}" başlığı ${sameNote ? 'bu notta' : 'hedef notta'} bulunamadı.`,
    };
  }

  private async resolveOccurrence(
    occurrence: UrlOccurrence,
    note: PlannedNote,
  ): Promise<{ value?: string; warning?: string }> {
    const url = occurrence.url.trim();
    const isImage = occurrence.context === 'image';
    if (!url) return {};
    if (url.startsWith('#')) {
      const { suffix, warning } = this.matchFragment(note, url.slice(1), url, true);
      const result: { value?: string; warning?: string } = {};
      if (suffix !== url) result.value = suffix || '#';
      if (warning) result.warning = warning;
      return result;
    }
    if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//') || url.startsWith('?')) return {};

    const hashIndex = url.indexOf('#');
    const fragmentRaw = hashIndex === -1 ? '' : url.slice(hashIndex + 1);
    const pathPart = (hashIndex === -1 ? url : url.slice(0, hashIndex)).split('?')[0] ?? '';
    const decodedPath = safeDecode(pathPart);
    const joined = decodedPath.startsWith('/')
      ? decodedPath.slice(1)
      : path.posix.join(path.posix.dirname(note.repoPath), decodedPath);
    const normalized = path.posix.normalize(joined || '.');
    if (normalized === '..' || normalized.startsWith('../')) {
      return isImage
        ? { value: MISSING_IMAGE_URL, warning: `Görsel repo dışını gösteriyor ve atlandı: "${url}"` }
        : { warning: `Bağlantı repo dışını gösteriyor: "${url}"` };
    }
    const target = normalized === '.' ? '' : normalized.replace(/\/+$/, '');
    const resolved =
      target === '' ? { path: '', isDirectory: true, caseMismatch: false } : await this.resolveRepoPath(note.checkout, target);

    if (!resolved) {
      if (isImage) return { value: MISSING_IMAGE_URL, warning: `Görsel bulunamadı: "${url}"` };
      return { warning: `Bağlantı hedefi bulunamadı: "${url}"` };
    }
    const warnings: string[] = [];
    if (resolved.caseMismatch) {
      warnings.push(
        `"${url}" yalnızca büyük/küçük harf farkıyla bulundu ("${resolved.path}"). GitHub'da bu bağlantı çalışmaz; kaynakta düzeltmen önerilir.`,
      );
    }
    const fragmentSuffix = fragmentRaw ? `#${fragmentRaw}` : '';
    const withWarnings = (value: string | undefined) => {
      const result: { value?: string; warning?: string } = {};
      if (value !== undefined) result.value = value;
      if (warnings.length > 0) result.warning = warnings.join(' ');
      return result;
    };

    if (resolved.isDirectory) {
      const indexNote = await this.findIndexNote(note.checkout, resolved.path);
      if (indexNote) return withWarnings(indexNote.url + fragmentSuffix);
      return withWarnings(githubUrl(note.checkout, 'tree', resolved.path));
    }
    if (isMarkdownPath(resolved.path)) {
      const targetNote = this.lookupNote(note.checkout, resolved.path);
      if (targetNote) {
        const { suffix, warning } = this.matchFragment(targetNote, fragmentRaw, url, targetNote === note);
        if (warning) warnings.push(warning);
        return withWarnings(targetNote.url + suffix);
      }
      // Hedef not yayınlanmıyor: kaynak dosyaya açık dış bağlantı verilir.
      return withWarnings(githubUrl(note.checkout, 'blob', resolved.path) + fragmentSuffix);
    }
    if (isImagePath(resolved.path)) {
      const asset = await this.copyImage(note, resolved.path);
      return withWarnings(asset ? asset.url : isImage ? MISSING_IMAGE_URL : undefined);
    }
    if (path.posix.extname(resolved.path).toLowerCase() === '.pdf') {
      const asset = await this.copyDocument(note, resolved.path);
      return withWarnings(asset?.url);
    }
    // Diğer dosyalar kaynak repoda açılır.
    return withWarnings(githubUrl(note.checkout, 'blob', resolved.path));
  }

  private async copyDocument(note: PlannedNote, repoPath: string): Promise<ImageInfo | null> {
    const key = `${note.source.id}:${repoPath}`;
    if (this.assets.has(key)) return this.assets.get(key) ?? null;
    const absolute = path.join(note.checkout.dir, ...repoPath.split('/'));
    const size = (await stat(absolute)).size;
    if (size > this.config.limits.maxAssetBytes) {
      this.problems.push(`"${note.source.id}": "${repoPath}" ${formatBytes(size)}; ek dosya sınırı aşıldı.`);
      this.assets.set(key, null);
      return null;
    }
    const relative = repoPath.startsWith(note.source.root + '/')
      ? repoPath.slice(note.source.root.length + 1)
      : `_repo/${repoPath}`;
    const file = relative.split('/').map((segment) => slugify(segment.replace(/\.pdf$/i, '')) || `dosya-${shortHash(segment)}`).join('/') + '.pdf';
    const destination = path.join(this.staging, 'assets', note.source.id, ...file.split('/'));
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(absolute, destination);
    const info = { url: `/imported-assets/${note.source.id}/${file}` };
    this.assets.set(key, info);
    this.report(note.source, note.checkout).assetCount += 1;
    return info;
  }

  /** Markdown içinde bağlantı verilmemiş tekrar materyalleri de okunabilir. */
  private async reviewAssets(note: PlannedNote): Promise<string> {
    if (!note.source.includeReviewAssets || !/^(?:\d+|readme|index)\.(?:md|markdown)$/i.test(path.posix.basename(note.repoPath))) return '';
    const directory = path.posix.join(path.posix.dirname(note.repoPath), 'TEKRAR');
    const entries = (await this.listDirectory(path.join(note.checkout.dir, ...directory.split('/')))) ?? [];
    const parts: string[] = [];
    for (const name of entries.sort(naturalCompare)) {
      if (!isImagePath(name) && !/\.pdf$/i.test(name)) continue;
      const repoPath = path.posix.join(directory, name);
      const resolved = await this.resolveRepoPath(note.checkout, repoPath);
      if (!resolved || resolved.isDirectory) continue;
      const asset = isImagePath(name) ? await this.copyImage(note, repoPath) : await this.copyDocument(note, repoPath);
      if (!asset) continue;
      const label = name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/[\[\]\\]/g, '').trim();
      parts.push(isImagePath(name)
        ? `### ${label}\n\n![${label}](${asset.url})\n\n[${note.source.lang === 'en' ? 'Open full image' : 'Görseli aç'}](${asset.url})`
        : `- [${label} (PDF)](${asset.url})`);
    }
    return parts.length ? `\n\n## ${note.source.lang === 'en' ? 'Visual summaries and attachments' : 'Görsel özetler ve ekler'}\n\n${parts.join('\n\n')}\n` : '';
  }

  private async copyImage(note: PlannedNote, repoPath: string): Promise<ImageInfo | null> {
    const key = `${note.source.id}:${repoPath}`;
    if (this.assets.has(key)) return this.assets.get(key) ?? null;
    const report = this.report(note.source, note.checkout);
    const absolute = path.join(note.checkout.dir, ...repoPath.split('/'));
    const size = (await stat(absolute)).size;
    if (size > this.config.limits.maxAssetBytes) {
      this.problems.push(
        `"${note.source.id}": "${repoPath}" görseli ${formatBytes(size)}; tek görsel sınırı ${formatBytes(this.config.limits.maxAssetBytes)}. Görseli küçült veya limits.maxAssetBytes değerini artır.`,
      );
      this.assets.set(key, null);
      return null;
    }

    // Görsel kaynak kökünün içindeyse yol kökten başlar; dışındaysa `_repo/` altında tutulur.
    const rootPrefix = note.source.root ? `${note.source.root.replace(/\/+$/, '')}/` : '';
    const relative = !rootPrefix
      ? repoPath
      : repoPath.startsWith(rootPrefix)
        ? repoPath.slice(rootPrefix.length)
        : `_repo/${repoPath}`;
    const extension = path.posix.extname(relative).toLowerCase();
    const outputExtension = extension === '.svg' ? '.png' : extension === '.jpeg' ? '.jpg' : extension;
    let slugPath =
      relative
        .slice(0, relative.length - extension.length)
        .split('/')
        .map((segment) => slugify(segment) || `dosya-${shortHash(segment)}`)
        .join('/') + outputExtension;
    const ownerKey = `${note.source.id}/${slugPath}`;
    const owner = this.assetOwners.get(ownerKey);
    if (owner && owner !== repoPath) {
      slugPath = slugPath.replace(/(\.[a-z0-9]+)$/, `-${shortHash(repoPath)}$1`);
    }
    this.assetOwners.set(`${note.source.id}/${slugPath}`, repoPath);

    const url = `/imported-assets/${note.source.id}/${slugPath}`;
    const destination = path.join(this.staging, 'assets', note.source.id, ...slugPath.split('/'));
    await mkdir(path.dirname(destination), { recursive: true });
    try {
      const { width, height } = await processImage(absolute, destination, extension, this.config.limits.maxImageWidth);
      this.manifest[url] = { original: repoPath, width, height };
    } catch (error) {
      if (extension === '.svg') {
        report.warnings.push(`${repoPath}: SVG görseli güvenli biçime dönüştürülemedi ve atlandı (${(error as Error).message}).`);
        this.assets.set(key, null);
        return null;
      }
      report.warnings.push(`${repoPath}: görsel ölçüleri okunamadı, olduğu gibi kopyalandı.`);
      await copyFile(absolute, destination);
    }
    report.assetCount += 1;
    const info = { url };
    this.assets.set(key, info);
    return info;
  }

  private async writeNote(note: PlannedNote): Promise<void> {
    const report = this.report(note.source, note.checkout);
    const replacements: Array<{ occurrence: UrlOccurrence; value: string }> = [];
    for (const occurrence of findUrlOccurrences(note.body)) {
      const { value, warning } = await this.resolveOccurrence(occurrence, note);
      if (warning) report.warnings.push(`${note.repoPath}: ${warning}`);
      if (value !== undefined && value !== occurrence.url) replacements.push({ occurrence, value });
    }
    let body = replaceOccurrences(note.body, replacements).replace(/^\s+/, '');
    body += await this.reviewAssets(note);
    const resources = Array.isArray(note.data.resources) ? note.data.resources as Array<{ label: string; path: string }> : [];
    if (resources.length) {
      const links: string[] = [];
      for (const resource of resources) {
        const resolved = await this.resolveRepoPath(note.checkout, resource.path);
        if (!resolved) {
          this.problems.push(`${note.repoPath}: Ek kaynak bulunamadı: ${resource.path}`);
          continue;
        }
        links.push(`- [${resource.label.replace(/[\[\]\\]/g, '')}](${githubUrl(note.checkout, resolved.isDirectory ? 'tree' : 'blob', resolved.path)})`);
      }
      if (links.length) body += `\n\n## ${note.source.lang === 'en' ? 'Source code' : 'Kod örnekleri'}\n\n${links.join('\n')}\n`;
    }

    const warnings = report.warnings;
    const publishedAt = readDate(note.data, ['publishedAt', 'date', 'published_at'], warnings, note.repoPath);
    const updatedAt = readDate(note.data, ['updatedAt', 'updated', 'lastmod', 'updated_at'], warnings, note.repoPath);
    const description =
      typeof note.data.description === 'string' && note.data.description.trim()
        ? note.data.description.trim()
        : note.excerpt;
    const folder = path.posix.dirname(note.rootRelative);

    const frontmatter: Record<string, unknown> = {
      title: note.title,
      sourceId: note.source.id,
      noteSlug: note.slug,
      category: typeof note.data.category === 'string' ? note.data.category : note.source.category,
      // Kaynak ayarında seçilmiş ve taslak işaretlenmemiş eski notlar yayındadır.
      published: true,
    };
    if (description) frontmatter.description = description;
    // Kaynakta tarih yoksa tarih uydurulmaz.
    if (publishedAt) frontmatter.publishedAt = publishedAt;
    if (updatedAt) frontmatter.updatedAt = updatedAt;
    frontmatter.tags = readTags(note.data.tags);
    frontmatter.order = report.noteCount;
    frontmatter.folder = folder === '.' ? '' : folder;
    frontmatter.lang = note.source.lang;
    frontmatter.source = {
      repository: note.checkout.repository,
      branch: note.checkout.branch,
      path: note.repoPath,
      commit: note.checkout.commit,
      url: githubUrl(note.checkout, 'blob', note.repoPath),
    };

    const destination = path.join(this.staging, 'notes', note.source.id, ...note.slug.split('/')) + '.md';
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, `---\n${stringifyYaml(frontmatter, { lineWidth: 0 })}---\n\n${body}`);
    report.noteCount += 1;
  }
}

/** Görseli kopyalar; çok genişse küçültür. SVG'ler betik içerebileceği için PNG'ye çevrilir. */
async function processImage(
  input: string,
  output: string,
  extension: string,
  maxWidth: number,
): Promise<{ width: number; height: number }> {
  if (extension === '.svg') {
    const image = sharp(input, { density: 144 });
    const meta = await image.metadata();
    const pipeline = meta.width && meta.width > maxWidth ? image.resize({ width: maxWidth }) : image;
    const info = await pipeline.png().toFile(output);
    return { width: info.width, height: info.height };
  }
  const meta = await sharp(input).metadata();
  if (extension !== '.gif' && meta.width && meta.width > maxWidth) {
    const info = await sharp(input).rotate().resize({ width: maxWidth, withoutEnlargement: true }).toFile(output);
    return { width: info.width, height: info.height };
  }
  await copyFile(input, output);
  return { width: meta.width ?? 0, height: meta.pageHeight ?? meta.height ?? 0 };
}

async function removeStaleStaging(generatedDir: string): Promise<void> {
  const entries = await readdir(generatedDir).catch(() => []);
  await Promise.all(
    entries
      .filter((entry) => entry.startsWith('.staging-'))
      .map((entry) => rm(path.join(generatedDir, entry), { recursive: true, force: true })),
  );
}

/**
 * Hazırlık alanındaki sonucu kullanılacak yerlere taşır. Bir taşıma başarısız
 * olursa önceki çıktı geri konur.
 */
async function swapIntoPlace(staging: string, generatedDir: string, assetsTarget: string): Promise<void> {
  const moves = [
    { from: path.join(staging, 'notes'), to: path.join(generatedDir, 'notes') },
    { from: path.join(staging, 'source-status.json'), to: path.join(generatedDir, 'source-status.json') },
    { from: path.join(staging, 'asset-manifest.json'), to: path.join(generatedDir, 'asset-manifest.json') },
    { from: path.join(staging, 'assets'), to: assetsTarget },
  ];
  const backupDir = path.join(staging, '.onceki');
  await mkdir(backupDir, { recursive: true });
  await mkdir(path.dirname(assetsTarget), { recursive: true });
  const completed: Array<{ to: string; backup: string | null }> = [];
  try {
    for (const [index, move] of moves.entries()) {
      const backup = path.join(backupDir, String(index));
      const hadPrevious = existsSync(move.to);
      if (hadPrevious) await rename(move.to, backup);
      completed.push({ to: move.to, backup: hadPrevious ? backup : null });
      await rename(move.from, move.to);
    }
  } catch (error) {
    for (const item of completed.reverse()) {
      await rm(item.to, { recursive: true, force: true }).catch(() => undefined);
      if (item.backup) await rename(item.backup, item.to).catch(() => undefined);
    }
    throw error;
  }
}

export async function importNotes(options: ImportOptions): Promise<ImportReport> {
  const log = options.log ?? (() => undefined);
  const categoryIds = readCategoryIds(options.taxonomyPath);
  let config: NoteSourcesConfig;
  try {
    config = loadNoteSourcesConfig(options.configPath, categoryIds);
  } catch (error) {
    if (error instanceof ConfigError) throw new ImportError('Not kaynakları ayarı geçersiz.', error.problems);
    throw error;
  }

  const forced = new Set(options.forceEnable ?? []);
  const unknownForced = [...forced].filter((id) => !config.sources.some((source) => source.id === id));
  if (unknownForced.length > 0) {
    throw new ImportError('Bilinmeyen kaynak kimliği istendi.', unknownForced.map((id) => `"${id}" ayarda yok.`));
  }
  const sources = config.sources
    .filter((source) => source.enabled || forced.has(source.id))
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  if (sources.length === 0) log('Etkin not kaynağı yok; içe aktarılan not bölümü boş olacak.');

  const generatedDir = path.join(options.projectRoot, 'generated');
  const assetsTarget = path.join(options.projectRoot, 'public', 'imported-assets');
  await mkdir(generatedDir, { recursive: true });
  await removeStaleStaging(generatedDir);
  const staging = await mkdtemp(path.join(generatedDir, '.staging-'));
  const workDir = await mkdtemp(path.join(os.tmpdir(), 'not-kaynaklari-'));
  try {
    const report = await new ImportRun(config, sources, staging, options, log).run(workDir);
    await swapIntoPlace(staging, generatedDir, assetsTarget);
    return report;
  } finally {
    await rm(workDir, { recursive: true, force: true });
    await rm(staging, { recursive: true, force: true });
  }
}
