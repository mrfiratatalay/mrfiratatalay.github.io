#!/usr/bin/env node
/**
 * Not repolarını içe aktarır: `npm run sync:notes`
 *
 * Kullanım:
 *   npm run sync:notes                         # config/note-sources.json, GitHub'dan alır (production)
 *   npm run sync:notes -- --ornek              # tests/fixtures içindeki örnek repolar (internet gerekmez)
 *   npm run sync:notes -- --kaynak java-notlari --yerel-depo mrfiratatalay/java-spring=/yol/klasor
 *                                              # kapalı bir kaynağı yalnızca bu bilgisayarda önizler
 *
 * Herhangi bir sorun olursa çıkış kodu 1 olur ve önceki içe aktarma değişmez.
 */
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { createPublishedSourceFetcher, createLocalFetcher } from './lib/fetchers.ts';
import { ImportError, importNotes } from './lib/importer.ts';
import { formatReportMarkdown, formatReportText, writeGithubSummary } from './lib/report.ts';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const { values } = parseArgs({
  options: {
    ornek: { type: 'boolean', default: false },
    config: { type: 'string' },
    kaynak: { type: 'string', multiple: true, default: [] },
    'yerel-depo': { type: 'string', multiple: true, default: [] },
  },
});

const fixturesMode = values.ornek || process.env.NOTES_MODE === 'ornek';
const localRepos = Object.fromEntries(
  values['yerel-depo'].map((entry) => {
    const separator = entry.indexOf('=');
    if (separator === -1) {
      console.error(`--yerel-depo "kullanici/repo=/klasor/yolu" biçiminde olmalı: ${entry}`);
      process.exit(1);
    }
    return [entry.slice(0, separator), path.resolve(entry.slice(separator + 1))];
  }),
);

let configPath = path.join(projectRoot, 'config', 'note-sources.json');
let fetcher = createPublishedSourceFetcher(projectRoot);
let mode = 'production';

if (fixturesMode) {
  configPath = path.join(projectRoot, 'tests', 'fixtures', 'note-sources.ornek.json');
  fetcher = createLocalFetcher({
    'ornek-kullanici/java-notlari': path.join(projectRoot, 'tests', 'fixtures', 'repos', 'java-notlari'),
    'ornek-kullanici/docker-notlari': path.join(projectRoot, 'tests', 'fixtures', 'repos', 'docker-notlari'),
  });
  mode = 'ornek';
} else if (Object.keys(localRepos).length > 0 || values.kaynak.length > 0) {
  const gitFetcher = fetcher;
  const localFetcher = createLocalFetcher(localRepos);
  fetcher = (request) => (localRepos[request.repository] ? localFetcher(request) : gitFetcher(request));
  mode = 'yerel-onizleme';
}
if (values.config) configPath = path.resolve(values.config);

try {
  const report = await importNotes({
    projectRoot,
    configPath,
    taxonomyPath: path.join(projectRoot, 'src', 'data', 'taxonomy.json'),
    fetcher,
    mode,
    forceEnable: values.kaynak,
    log: (message) => console.log(message),
  });
  console.log(formatReportText(report));
  writeGithubSummary(formatReportMarkdown(report));
} catch (error) {
  if (error instanceof ImportError) {
    console.error(`\n✗ ${error.message}`);
    for (const problem of error.problems) console.error(`  - ${problem}`);
    writeGithubSummary(
      ['## Not kaynakları', '', `**İçe aktarma başarısız:** ${error.message}`, '', ...error.problems.map((p) => `- ${p}`)].join('\n'),
    );
  } else {
    console.error(error);
  }
  process.exit(1);
}
