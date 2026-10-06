/**
 * Test yardımcıları: geçici bir site kökü ve sahte not repoları oluşturur.
 * Testler gerçek GitHub'a bağlanmaz; repolar yerel klasörlerden "indirilir".
 */
import { mkdir, mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { createLocalFetcher, type SourceFetcher } from '../../scripts/lib/fetchers.ts';
import { importNotes, type ImportReport } from '../../scripts/lib/importer.ts';

export const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export type RepoFiles = Record<string, string | Buffer>;

export async function tinyPng(width = 4, height = 4, color = '#3b82f6'): Promise<Buffer> {
  return sharp({ create: { width, height, channels: 3, background: color } }).png().toBuffer();
}

export interface TestSite {
  root: string;
  repos: Record<string, string>;
  configPath: string;
  writeRepoFile: (repository: string, file: string, content: string | Buffer) => Promise<void>;
  setConfig: (sources: unknown[], limits?: Record<string, number>) => Promise<void>;
  run: (fetcher?: SourceFetcher) => Promise<ImportReport>;
  readGenerated: (file: string) => Promise<string>;
  listGenerated: () => Promise<string[]>;
  listAssets: () => Promise<string[]>;
}

async function walk(dir: string, base = dir): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full, base)));
    else files.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return files.sort();
}

export function source(id: string, repository: string, extra: Record<string, unknown> = {}) {
  return {
    id,
    label: `Kaynak ${id}`,
    repository,
    branch: 'main',
    enabled: true,
    category: 'java',
    include: ['**/*.md'],
    ...extra,
  };
}

export async function createTestSite(repoFiles: Record<string, RepoFiles>): Promise<TestSite> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'site-testi-'));
  await mkdir(path.join(root, 'src', 'data'), { recursive: true });
  await mkdir(path.join(root, 'config'), { recursive: true });
  await mkdir(path.join(root, 'public'), { recursive: true });
  await writeFile(
    path.join(root, 'src', 'data', 'taxonomy.json'),
    await readFile(path.join(PROJECT_ROOT, 'src', 'data', 'taxonomy.json')),
  );

  const repos: Record<string, string> = {};
  const writeRepoFile = async (repository: string, file: string, content: string | Buffer) => {
    const dir = repos[repository] ?? path.join(root, '..', `${path.basename(root)}-repos`, repository.replace('/', '__'));
    repos[repository] = dir;
    const target = path.join(dir, ...file.split('/'));
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
  };
  for (const [repository, files] of Object.entries(repoFiles)) {
    for (const [file, content] of Object.entries(files)) await writeRepoFile(repository, file, content);
  }

  const configPath = path.join(root, 'config', 'note-sources.json');
  const setConfig = async (sources: unknown[], limits: Record<string, number> = {}) => {
    await writeFile(configPath, JSON.stringify({ concurrency: 2, limits: { retries: 0, timeoutSeconds: 20, ...limits }, sources }));
  };

  return {
    root,
    repos,
    configPath,
    writeRepoFile,
    setConfig,
    run: (fetcher) =>
      importNotes({
        projectRoot: root,
        configPath,
        taxonomyPath: path.join(root, 'src', 'data', 'taxonomy.json'),
        fetcher: fetcher ?? createLocalFetcher(repos),
        mode: 'ornek',
        now: () => new Date('2026-10-06T10:00:00Z'),
      }),
    readGenerated: (file) => readFile(path.join(root, 'generated', file), 'utf8'),
    listGenerated: () => walk(path.join(root, 'generated', 'notes')),
    listAssets: () => walk(path.join(root, 'public', 'imported-assets')),
  };
}
