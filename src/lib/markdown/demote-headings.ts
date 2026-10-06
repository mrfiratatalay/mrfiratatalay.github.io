import type { Root } from 'hast';
import { EXIT, visit } from 'unist-util-visit';

/**
 * Sayfanın tek ana başlığı (H1) içerik başlığıdır. Markdown metninde de `#`
 * başlıklar varsa bütün başlıklar bir seviye aşağı kaydırılır (h1 -> h2,
 * h2 -> h3 ...). Başlıkların birbirine göre sırası bozulmaz.
 */
export function rehypeDemoteHeadings() {
  return (tree: Root) => {
    let hasH1 = false;
    visit(tree, 'element', (node) => {
      if (node.tagName === 'h1') {
        hasH1 = true;
        return EXIT;
      }
      return undefined;
    });
    if (!hasH1) return;
    visit(tree, 'element', (node) => {
      const match = /^h([1-6])$/.exec(node.tagName);
      if (match) node.tagName = `h${Math.min(6, Number(match[1]) + 1)}`;
    });
  };
}
