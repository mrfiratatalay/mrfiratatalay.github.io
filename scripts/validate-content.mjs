#!/usr/bin/env node
/**
 * İçerik ve adres kontrolü: `npm run validate:content`
 * Hata varsa çıkış kodu 1 olur; build (ve yayınlama) durur, canlı site değişmez.
 */
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { validateContent } from './lib/validate.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { errors, warnings, counts } = validateContent(root);

for (const warning of warnings) console.warn(`! ${warning}`);
for (const error of errors) console.error(`✗ ${error}`);

if (errors.length > 0) {
  console.error(`\nİçerik kontrolü başarısız: ${errors.length} hata. Site yayınlanmadı; son başarılı sürüm açık kalır.`);
  process.exit(1);
}
console.log(
  `İçerik kontrolü başarılı: ${counts.blogPublished}/${counts.blog} yazı yayında, ${counts.notes} not ` +
    `(${counts.imported} içe aktarılmış), ${counts.projects} proje.${warnings.length ? ` ${warnings.length} uyarı.` : ''}`,
);
