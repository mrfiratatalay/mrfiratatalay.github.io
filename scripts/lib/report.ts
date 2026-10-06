/**
 * İçe aktarma sonucunu terminale ve (GitHub Actions'ta) iş özetine yazar.
 * Bu teknik rapor ziyaretçiye gösterilmez.
 */
import { appendFileSync } from 'node:fs';
import type { ImportReport } from './importer.ts';

const MAX_LISTED = 15;

export function formatReportText(report: ImportReport): string {
  const lines = [`Not kaynakları içe aktarıldı (mod: ${report.mode}, zaman: ${report.generatedAt})`];
  if (report.sources.length === 0) {
    lines.push('  Etkin kaynak yok.');
    return lines.join('\n');
  }
  for (const source of report.sources) {
    lines.push(
      `  • ${source.id} — ${source.repository}@${source.branch} (${source.commit.slice(0, 12)}${source.fetchNote ? `, ${source.fetchNote}` : ''}): ` +
        `${source.noteCount} not, ${source.assetCount} görsel, ${source.skipped.length} atlanan dosya, ${source.warnings.length} uyarı`,
    );
    for (const skipped of source.skipped.slice(0, MAX_LISTED)) lines.push(`      atlandı: ${skipped.path} — ${skipped.reason}`);
    if (source.skipped.length > MAX_LISTED) lines.push(`      … ve ${source.skipped.length - MAX_LISTED} dosya daha`);
    for (const warning of source.warnings.slice(0, MAX_LISTED)) lines.push(`      uyarı: ${warning}`);
    if (source.warnings.length > MAX_LISTED) {
      lines.push(`      … ve ${source.warnings.length - MAX_LISTED} uyarı daha (tamamı: generated/source-status.json)`);
    }
  }
  return lines.join('\n');
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

export function formatReportMarkdown(report: ImportReport): string {
  const lines = ['## Not kaynakları', '', `Mod: \`${report.mode}\` · Zaman: ${report.generatedAt}`, ''];
  if (report.sources.length === 0) {
    lines.push('Etkin not kaynağı yok.');
    return lines.join('\n');
  }
  lines.push('| Kaynak | Repo | Commit | Not | Görsel | Atlanan | Uyarı |', '| --- | --- | --- | --- | --- | --- | --- |');
  for (const source of report.sources) {
    lines.push(
      `| ${escapeCell(source.id)} | ${escapeCell(`${source.repository}@${source.branch}`)} | \`${source.commit.slice(0, 12)}\` | ${source.noteCount} | ${source.assetCount} | ${source.skipped.length} | ${source.warnings.length} |`,
    );
  }
  for (const source of report.sources.filter((item) => item.warnings.length || item.skipped.length)) {
    lines.push('', `<details><summary>${escapeCell(source.id)} ayrıntıları</summary>`, '');
    for (const skipped of source.skipped) lines.push(`- Atlandı: \`${escapeCell(skipped.path)}\` — ${escapeCell(skipped.reason)}`);
    for (const warning of source.warnings) lines.push(`- Uyarı: ${escapeCell(warning)}`);
    lines.push('', '</details>');
  }
  return lines.join('\n');
}

export function writeGithubSummary(markdown: string): void {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) return;
  try {
    appendFileSync(summaryPath, `${markdown}\n`);
  } catch {
    // Özet yazılamaması build'i durdurmaz.
  }
}
