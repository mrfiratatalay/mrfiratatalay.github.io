#!/usr/bin/env node
/** Yerel Java/Docker notlarının seçilmiş yayın kopyasını günceller. */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.resolve(process.argv[2] ?? path.join(projectRoot, '../..'));
const sourceDirs = ['JAVA/FIRAT ATALAY/00-WEEK', 'DOCKER/FIRAT ATALAY/00-WEEK', 'JAVA/FIRAT ATALAY/CODING'];
for (const dir of sourceDirs) await readdir(path.join(sourceRoot, dir));
const targetRoot = path.join(projectRoot, 'content-sources/java-spring');
const files = [];
const hash = createHash('sha256');
const collect = async (relative) => {
  const entries = (await readdir(path.join(sourceRoot, relative), { withFileTypes: true })).sort((a,b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    if (['.git', '.idea', '.DS_Store', 'target', 'node_modules'].includes(entry.name)) continue;
    const file = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) await collect(file);
    else if (entry.isFile() && /\.(md|markdown|png|jpe?g|webp|gif|avif|svg|pdf|java|xml|properties|mustache)$/i.test(entry.name)) {
      files.push(file);
      hash.update(file);
      hash.update(await readFile(path.join(sourceRoot, file)));
    }
  }
};
for (const dir of sourceDirs) await collect(dir);
await rm(targetRoot, { recursive: true, force: true });
for (const file of files) {
  const target = path.join(targetRoot, file);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(path.join(sourceRoot, file), target);
}
const sourceCommit = execFileSync('git', ['-C', sourceRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const manifest = {
  'mrfiratatalay/java-spring#main': {
    path: 'content-sources/java-spring',
    commit: `snapshot-${hash.digest('hex').slice(0, 16)}`,
    sourceCommit,
    mirror: { repository: 'mrfiratatalay/mrfiratatalay.github.io', root: 'content-sources/java-spring', ref: 'main' },
  },
};
await writeFile(path.join(projectRoot, 'content-sources/manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`${files.length} kaynak dosyası yayın kopyasına aktarıldı.`);
