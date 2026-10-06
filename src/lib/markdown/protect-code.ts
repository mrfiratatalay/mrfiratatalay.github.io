import { randomBytes } from 'node:crypto';
import type { Element, Root } from 'hast';
import { SKIP, visit } from 'unist-util-visit';

/**
 * Shiki'nin ürettiği `<pre class="astro-code">` blokları güvenilir çıktıdır
 * (kod metni kaçışlanmıştır) ama renkler için `style` özniteliği kullanır.
 * HTML temizleyici `style` özniteliğini kaldırdığı için bu bloklar temizlemeden
 * önce yer tutucuyla değiştirilir, temizlemeden sonra geri konur.
 *
 * Yer tutucu her dosya için rastgele bir anahtar taşır; Markdown içine elle
 * yazılmış sahte bir yer tutucu hiçbir kod bloğunu geri getiremez.
 */
export const HIGHLIGHTED_CODE_PLACEHOLDER = 'site-highlighted-code';

interface ProtectedCode {
  nonce: string;
  nodes: Array<Element | undefined>;
}

interface FileWithData {
  data: Record<string, unknown>;
}

export function isHighlightedPre(node: Element): boolean {
  if (node.tagName !== 'pre') return false;
  const value = node.properties?.class ?? node.properties?.className;
  const classes = Array.isArray(value)
    ? value.map(String)
    : typeof value === 'string'
      ? value.split(/\s+/)
      : [];
  return classes.includes('astro-code');
}

export function rehypeProtectHighlightedCode() {
  return (tree: Root, file: FileWithData) => {
    const state: ProtectedCode = { nonce: randomBytes(12).toString('hex'), nodes: [] };
    file.data.protectedHighlightedCode = state;
    visit(tree, 'element', (node, index, parent) => {
      if (!parent || index === undefined || !isHighlightedPre(node)) return;
      parent.children[index] = {
        type: 'element',
        tagName: HIGHLIGHTED_CODE_PLACEHOLDER,
        properties: { dataCodeIndex: String(state.nodes.length), dataCodeNonce: state.nonce },
        children: [],
      };
      state.nodes.push(node);
      return SKIP;
    });
  };
}

export function rehypeRestoreHighlightedCode() {
  return (tree: Root, file: FileWithData) => {
    const state = file.data.protectedHighlightedCode as ProtectedCode | undefined;
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== HIGHLIGHTED_CODE_PLACEHOLDER || !parent || index === undefined) return;
      const position = Number(node.properties?.dataCodeIndex);
      const original =
        state && node.properties?.dataCodeNonce === state.nonce ? state.nodes[position] : undefined;
      if (original) {
        parent.children[index] = original;
        // Aynı kod bloğu ikinci kez kullanılamaz.
        if (state) state.nodes[position] = undefined;
        return SKIP;
      }
      parent.children.splice(index, 1);
      return index;
    });
  };
}
