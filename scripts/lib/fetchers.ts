/**
 * Not kaynaklarını geçici bir klasöre indirme yöntemleri.
 *
 * Güvenlik kuralları:
 * - `git` kabuk (shell) kullanılmadan, argüman dizisiyle çalıştırılır.
 * - Yalnızca public GitHub repoları yazma yetkisi olmadan, sığ (depth=1) alınır.
 * - Repo içindeki hiçbir program, paket kurulumu veya workflow çalıştırılmaz.
 * - Sembolik bağlantılar düz dosya olarak alınır (repo dışına çıkamaz).
 */
import { execFile, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, readFile, readdir, realpath, rm } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

export interface FetchRequest {
  repository: string;
  branch: string;
  destination: string;
  timeoutMs: number;
}

export interface FetchResult {
  /** Gerçekte alınan commit kimliği. */
  commit: string;
  /** Yerel kopyadan alındıysa açıklama (ör. "yerel çalışma kopyası"). */
  note?: string;
}

export type SourceFetcher = (request: FetchRequest) => Promise<FetchResult>;

function run(command: string, args: string[], timeoutMs: number, env: NodeJS.ProcessEnv): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);
    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (timedOut) reject(new Error(`zaman aşımı (${Math.round(timeoutMs / 1000)} sn)`));
      else if (code === 0) resolve(stdout);
      else reject(new Error(stderr.trim().split('\n').slice(-3).join(' ') || `git çıkış kodu ${code}`));
    });
  });
}

/** Public GitHub reposunu sığ clone ile indirir. */
export function createGitFetcher(): SourceFetcher {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    GIT_TERMINAL_PROMPT: '0',
    GIT_LFS_SKIP_SMUDGE: '1',
    GCM_INTERACTIVE: 'never',
  };
  return async ({ repository, branch, destination, timeoutMs }) => {
    await run(
      'git',
      [
        '-c',
        'core.symlinks=false',
        '-c',
        'advice.detachedHead=false',
        'clone',
        '--depth=1',
        '--single-branch',
        '--no-tags',
        '--branch',
        branch,
        '--',
        `https://github.com/${repository}.git`,
        destination,
      ],
      timeoutMs,
      env,
    );
    const commit = (await run('git', ['-C', destination, 'rev-parse', 'HEAD'], 15_000, env)).trim();
    return { commit };
  };
}

const execFileAsync = promisify(execFile);

async function hashDirectory(directory: string): Promise<string> {
  const hash = createHash('sha1');
  const walk = async (dir: string): Promise<void> => {
    const entries = (await readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (entry.name === '.git') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile()) {
        hash.update(path.relative(directory, full));
        hash.update(await readFile(full));
      }
    }
  };
  await walk(directory);
  return hash.digest('hex');
}

/**
 * Yerel klasörü kaynak gibi kullanır (örnek içerikler, testler ve özel bir
 * reponun yalnızca bilgisayarda önizlenmesi için). Production build'i bunu kullanmaz.
 */
export function createLocalFetcher(directories: Readonly<Record<string, string>>): SourceFetcher {
  return async ({ repository, destination }) => {
    const directory = directories[repository];
    if (!directory) throw new Error(`"${repository}" için yerel klasör tanımlı değil.`);
    await cp(directory, destination, {
      recursive: true,
      verbatimSymlinks: true,
      filter: (source) => !source.split(path.sep).includes('.git'),
    });
    try {
      // Klasör bir git deposunun kökü değilse (ör. başka bir deponun alt klasörü) commit kullanılmaz.
      const { stdout: topLevel } = await execFileAsync('git', ['-C', directory, 'rev-parse', '--show-toplevel']);
      if ((await realpath(topLevel.trim())) !== (await realpath(directory))) throw new Error('alt klasör');
      const { stdout } = await execFileAsync('git', ['-C', directory, 'rev-parse', 'HEAD']);
      return { commit: stdout.trim(), note: 'yerel çalışma kopyası' };
    } catch {
      return { commit: `yerel-${(await hashDirectory(directory)).slice(0, 12)}`, note: 'yerel klasör' };
    }
  };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Sınırlı tekrar deneme: her denemeden önce hedef klasör temizlenir. */
export async function fetchWithRetry(
  fetcher: SourceFetcher,
  request: FetchRequest,
  retries: number,
  log: (message: string) => void,
): Promise<FetchResult> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    await rm(request.destination, { recursive: true, force: true });
    try {
      return await fetcher(request);
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        log(`  ${request.repository} (${request.branch}) alınamadı, tekrar deneniyor (${attempt + 2}/${retries + 1})…`);
        await sleep(1500 * (attempt + 1));
      }
    }
  }
  throw lastError;
}

/** En fazla `limit` işi aynı anda çalıştırır. */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  task: (item: T) => Promise<R>,
): Promise<Array<PromiseSettledResult<R>>> {
  const results: Array<PromiseSettledResult<R>> = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      try {
        results[index] = { status: 'fulfilled', value: await task(items[index] as T) };
      } catch (reason) {
        results[index] = { status: 'rejected', reason };
      }
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, worker));
  return results;
}
