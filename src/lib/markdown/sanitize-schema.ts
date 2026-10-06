import { defaultSchema, type Schema } from 'hast-util-sanitize';
import { HIGHLIGHTED_CODE_PLACEHOLDER } from './protect-code.ts';

/**
 * İçeriklerdeki ham HTML, GitHub'ın Markdown temizleme kurallarına göre süzülür.
 * `<script>`, olay öznitelikleri (`onclick`), `javascript:` bağlantıları ve
 * `style` gibi kontrolsüz alanlar kaldırılır. Notlar GitHub'da nasıl
 * görünüyorsa sitede de güvenli biçimde öyle görünür.
 *
 * Shiki'nin ürettiği renkli kod blokları temizlemeden önce bir yer tutucuya
 * alınır ve temizlemeden sonra geri konur (bkz. protect-code.ts).
 */
export const contentSanitizeSchema: Schema = {
  ...defaultSchema,
  // GFM dipnot kimlikleri remark-rehype tarafından zaten `user-content-` ile
  // öneklendiği için `id` ikinci kez öneklenmez. `name` öneklenmeye devam eder.
  clobber: ['name'],
  tagNames: [...(defaultSchema.tagNames ?? []), HIGHLIGHTED_CODE_PLACEHOLDER, 'mark', 'abbr', 'figure', 'figcaption'],
  attributes: {
    ...defaultSchema.attributes,
    [HIGHLIGHTED_CODE_PLACEHOLDER]: ['dataCodeIndex', 'dataCodeNonce'],
    img: [...(defaultSchema.attributes?.img ?? []), 'title'],
  },
};
