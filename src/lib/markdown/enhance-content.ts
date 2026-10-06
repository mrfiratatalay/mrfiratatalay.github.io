import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import type { Element, ElementContent, Parent, Root } from 'hast';
import sharp from 'sharp';
import { visit } from 'unist-util-visit';
import { languageLabel } from './languages.ts';
import { MISSING_IMAGE_URL } from './markers.ts';
import { isHighlightedPre } from './protect-code.ts';

export interface EnhanceContentOptions {
  /** `public/` klasörünün mutlak yolu. Yerel görsellerin ölçüleri buradan okunur. */
  publicDir: string;
  /** İçe aktarılan görsellerin özgün adlarını ve ölçülerini tutan dosya. */
  assetManifestPath?: string;
  /** Sitenin kendi alan adı; dış bağlantıları ayırt etmek için. */
  siteHost: string;
}

interface ImageSize {
  width: number;
  height: number;
}

interface ManifestEntry extends ImageSize {
  original: string;
}

const sizeCache = new Map<string, Promise<ImageSize | null>>();
let manifestCache: { mtimeMs: number; entries: Record<string, ManifestEntry> } | null = null;

function readManifest(manifestPath: string | undefined): Record<string, ManifestEntry> {
  if (!manifestPath) return {};
  try {
    const { mtimeMs } = statSync(manifestPath);
    if (manifestCache?.mtimeMs !== mtimeMs) {
      manifestCache = { mtimeMs, entries: JSON.parse(readFileSync(manifestPath, 'utf8')) };
    }
    return manifestCache.entries;
  } catch {
    return {};
  }
}

function readImageSize(publicDir: string, src: string): Promise<ImageSize | null> {
  let decoded: string;
  try {
    decoded = decodeURI(src.split(/[?#]/)[0] ?? '');
  } catch {
    return Promise.resolve(null);
  }
  const filePath = path.join(publicDir, decoded);
  if (!filePath.startsWith(publicDir + path.sep)) return Promise.resolve(null);
  let cached = sizeCache.get(filePath);
  if (!cached) {
    cached = sharp(filePath)
      .metadata()
      .then(({ width, height }) => (width && height ? { width, height } : null))
      .catch(() => null);
    sizeCache.set(filePath, cached);
  }
  return cached;
}

/** Görselin açıklaması yoksa dosya adından okunabilir bir açıklama çıkarır. */
export function altFromFileName(fileName: string): string {
  let base = fileName.split('/').pop() ?? '';
  try {
    base = decodeURIComponent(base);
  } catch {
    // Kodlaması bozuk ad olduğu gibi kullanılır.
  }
  const text = base.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  return text || 'Görsel';
}

function classList(node: Element): string[] {
  const value: unknown = node.properties?.className;
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') return value.split(/\s+/);
  return [];
}

function codeLanguage(pre: Element): string {
  const value = pre.properties?.dataLanguage;
  return typeof value === 'string' ? value : 'plaintext';
}

function wrapCodeBlock(pre: Element): Element {
  const language = codeLanguage(pre);
  return {
    type: 'element',
    tagName: 'figure',
    properties: { className: ['code-block'], dataLanguage: language },
    children: [
      {
        type: 'element',
        tagName: 'figcaption',
        properties: { className: ['code-block__bar'], dataPagefindIgnore: '' },
        children: [
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['code-block__lang'] },
            children: [{ type: 'text', value: languageLabel(language) }],
          },
          {
            type: 'element',
            tagName: 'button',
            properties: {
              type: 'button',
              className: ['code-block__copy'],
              dataCopyCode: '',
              hidden: true,
            },
            children: [{ type: 'text', value: 'Kopyala' }],
          },
        ],
      },
      pre,
    ],
  };
}

function wrapTable(table: Element): Element {
  return {
    type: 'element',
    tagName: 'div',
    properties: {
      className: ['table-scroll'],
      role: 'region',
      tabIndex: 0,
      ariaLabel: 'Tablo (yatay kaydırılabilir)',
    },
    children: [table],
  };
}

function missingImageNotice(image: Element): Element {
  const alt = typeof image.properties?.alt === 'string' ? image.properties.alt.trim() : '';
  return {
    type: 'element',
    tagName: 'span',
    properties: { className: ['missing-image'], role: 'note' },
    children: [
      { type: 'text', value: alt ? `Görsel bulunamadı: ${alt}` : 'Görsel bulunamadı' },
    ],
  };
}

function isExternal(href: string, siteHost: string): boolean {
  if (!/^https?:\/\//i.test(href)) return false;
  try {
    return new URL(href).host !== siteHost;
  } catch {
    return false;
  }
}

/**
 * Okuma görünümü için içerik düzenlemeleri:
 * - Kod blokları: dil adı ve kopyalama düğmesi
 * - Tablolar: kendi alanında yatay kaydırma
 * - Görseller: geç yükleme, ölçü (sayfa sıçramasını azaltır) ve açıklama
 * - Bulunamayan görseller: kırık görsel yerine anlaşılır not
 * - Dış bağlantılar: görsel işaret için sınıf
 */
export function rehypeEnhanceContent(options: EnhanceContentOptions) {
  return async (tree: Root) => {
    const manifest = readManifest(options.assetManifestPath);
    const replacements: Array<{ parent: Parent; node: Element; replacement: Element }> = [];
    const sizeTasks: Array<Promise<void>> = [];

    visit(tree, 'element', (node, _index, parent) => {
      if (!parent) return;
      if (isHighlightedPre(node)) {
        replacements.push({ parent, node, replacement: wrapCodeBlock(node) });
        return;
      }
      if (node.tagName === 'table') {
        replacements.push({ parent, node, replacement: wrapTable(node) });
        return;
      }
      if (node.tagName === 'img') {
        const src = typeof node.properties.src === 'string' ? node.properties.src : '';
        if (!src || src === MISSING_IMAGE_URL) {
          replacements.push({ parent, node, replacement: missingImageNotice(node) });
          return;
        }
        node.properties.loading = 'lazy';
        node.properties.decoding = 'async';
        const fromManifest = manifest[src];
        const alt = typeof node.properties.alt === 'string' ? node.properties.alt.trim() : '';
        if (!alt) node.properties.alt = altFromFileName(fromManifest?.original ?? src);
        if (node.properties.width === undefined && node.properties.height === undefined) {
          if (fromManifest) {
            node.properties.width = fromManifest.width;
            node.properties.height = fromManifest.height;
          } else if (src.startsWith('/') && !src.startsWith('//')) {
            sizeTasks.push(
              readImageSize(options.publicDir, src).then((size) => {
                if (!size) return;
                node.properties.width = size.width;
                node.properties.height = size.height;
              }),
            );
          }
        }
        return;
      }
      if (node.tagName === 'a' && typeof node.properties.href === 'string') {
        if (isExternal(node.properties.href, options.siteHost)) {
          node.properties.className = [...classList(node), 'external-link'];
        }
      }
    });

    for (const { parent, node, replacement } of replacements) {
      const index = parent.children.indexOf(node as ElementContent);
      if (index !== -1) parent.children[index] = replacement;
    }
    await Promise.all(sizeTasks);
  };
}
