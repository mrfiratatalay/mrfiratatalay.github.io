import type { RehypePlugins } from '@astrojs/markdown-remark';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { rehypeDemoteHeadings } from './demote-headings.ts';
import { rehypeEnhanceContent, type EnhanceContentOptions } from './enhance-content.ts';
import { rehypeProtectHighlightedCode, rehypeRestoreHighlightedCode } from './protect-code.ts';
import { contentSanitizeSchema } from './sanitize-schema.ts';

/**
 * Astro'nun Markdown hattına eklenen rehype eklentileri (sırası önemlidir).
 * Astro bunları kod renklendirmeden (Shiki) sonra, başlık kimliklerinden önce çalıştırır.
 */
export function contentRehypePlugins(options: EnhanceContentOptions): RehypePlugins {
  return [
    rehypeProtectHighlightedCode,
    rehypeRaw,
    [rehypeSanitize, contentSanitizeSchema],
    rehypeRestoreHighlightedCode,
    rehypeDemoteHeadings,
    [rehypeEnhanceContent, options],
  ] as unknown as RehypePlugins;
}
