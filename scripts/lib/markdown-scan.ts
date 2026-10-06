/**
 * Markdown'ı yapısını anlayarak tarar.
 *
 * Bağlantı ve görsel adresleri micromark'ın token akışından (kaynak metindeki
 * kesin konumlarıyla) bulunur. Böylece kod blokları, satır içi kod ve düz
 * metin hiçbir zaman değiştirilmez; yalnızca gerçek bağlantı hedefleri
 * yeniden yazılır. Metnin geri kalanı karakteri karakterine korunur.
 */
import GithubSlugger from 'github-slugger';
import type { Heading, Paragraph, Root, RootContent } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { toString } from 'mdast-util-to-string';
import { parse, postprocess, preprocess } from 'micromark';
import { frontmatter } from 'micromark-extension-frontmatter';
import { gfm } from 'micromark-extension-gfm';
import { decodeString } from 'micromark-util-decode-string';
import { parse as parseYaml } from 'yaml';

export interface FrontmatterResult {
  data: Record<string, unknown>;
  body: string;
  /** Ön bilgi bloğu okunamadıysa açıklama. */
  warning?: string;
}

const FRONTMATTER = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;

/** Dosyanın başındaki YAML ön bilgisini (frontmatter) ayırır. */
export function splitFrontmatter(source: string): FrontmatterResult {
  const match = FRONTMATTER.exec(source);
  if (!match) return { data: {}, body: source };
  try {
    const parsed: unknown = parseYaml(match[1] ?? '');
    if (parsed === null || parsed === undefined) {
      return { data: {}, body: source.slice(match[0].length) };
    }
    if (typeof parsed !== 'object' || Array.isArray(parsed)) {
      // `---` ile başlayan sıradan bir metin; ön bilgi sayılmaz.
      return { data: {}, body: source };
    }
    return { data: parsed as Record<string, unknown>, body: source.slice(match[0].length) };
  } catch (error) {
    return {
      data: {},
      body: source.slice(match[0].length),
      warning: `Ön bilgi (frontmatter) okunamadı, yok sayıldı: ${(error as Error).message.split('\n')[0]}`,
    };
  }
}

export type UrlContext = 'image' | 'link' | 'definition' | 'html';

export interface UrlOccurrence {
  /** Kaynak metindeki başlangıç konumu (dahil). */
  start: number;
  /** Kaynak metindeki bitiş konumu (hariç). */
  end: number;
  /** Kaçış karakterleri çözülmüş adres. */
  url: string;
  context: UrlContext;
}

interface MicromarkPoint {
  offset: number;
}
interface MicromarkToken {
  type: string;
  start: MicromarkPoint;
  end: MicromarkPoint;
}
type MicromarkEvent = ['enter' | 'exit', MicromarkToken, unknown];

const HTML_URL_ATTRIBUTE = /\b(src|href)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi;

/** Markdown içindeki bütün bağlantı ve görsel hedeflerini kesin konumlarıyla bulur. */
export function findUrlOccurrences(markdown: string): UrlOccurrence[] {
  const events = postprocess(
    parse({ extensions: [gfm(), frontmatter(['yaml'])] })
      .document()
      .write(preprocess()(markdown, undefined, true)),
  ) as unknown as MicromarkEvent[];

  const occurrences: UrlOccurrence[] = [];
  const containers: Array<'image' | 'link'> = [];

  for (const [kind, token] of events) {
    if (token.type === 'image' || token.type === 'link') {
      if (kind === 'enter') containers.push(token.type);
      else containers.pop();
      continue;
    }
    if (kind !== 'enter') continue;
    if (token.type === 'resourceDestinationString' || token.type === 'definitionDestinationString') {
      const raw = markdown.slice(token.start.offset, token.end.offset);
      occurrences.push({
        start: token.start.offset,
        end: token.end.offset,
        url: decodeString(raw),
        context:
          token.type === 'definitionDestinationString' ? 'definition' : (containers.at(-1) ?? 'link'),
      });
    } else if (token.type === 'htmlFlow' || token.type === 'htmlText') {
      const html = markdown.slice(token.start.offset, token.end.offset);
      for (const match of html.matchAll(HTML_URL_ATTRIBUTE)) {
        const value = match[2] ?? match[3] ?? match[4] ?? '';
        const valueOffset = (match.index ?? 0) + match[0].length - value.length - (match[4] === undefined ? 1 : 0);
        occurrences.push({
          start: token.start.offset + valueOffset,
          end: token.start.offset + valueOffset + value.length,
          url: decodeHtmlEntities(value),
          context: match[1]?.toLowerCase() === 'src' ? 'image' : 'html',
        });
      }
    }
  }
  return occurrences.sort((a, b) => a.start - b.start);
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/** Bulunan adresleri sondan başa doğru değiştirir; metnin geri kalanı aynen kalır. */
export function replaceOccurrences(
  markdown: string,
  replacements: Array<{ occurrence: UrlOccurrence; value: string }>,
): string {
  let result = markdown;
  const ordered = [...replacements].sort((a, b) => b.occurrence.start - a.occurrence.start);
  for (const { occurrence, value } of ordered) {
    result = result.slice(0, occurrence.start) + value + result.slice(occurrence.end);
  }
  return result;
}

export interface MarkdownAnalysis {
  /** Belgedeki ilk H1 başlığı. */
  firstH1: { text: string; start: number; end: number } | null;
  /** İlk H1, belgenin ilk içeriği mi? */
  startsWithH1: boolean;
  /** İlk anlamlı paragraftan kısa açıklama. */
  excerpt: string | undefined;
}

function parseMdast(markdown: string): Root {
  return fromMarkdown(markdown, { extensions: [gfm()], mdastExtensions: [gfmFromMarkdown()] });
}

function isIgnorableLeadingNode(node: RootContent): boolean {
  return node.type === 'html' && /^<!--[\s\S]*-->$/.test(node.value.trim());
}

export function analyzeMarkdown(markdown: string): MarkdownAnalysis {
  const tree = parseMdast(markdown);
  const firstMeaningful = tree.children.find((node) => !isIgnorableLeadingNode(node));
  const h1 = tree.children.find(
    (node): node is Heading => node.type === 'heading' && node.depth === 1,
  );
  const firstH1 =
    h1 && h1.position?.start.offset !== undefined && h1.position.end.offset !== undefined
      ? { text: normalizeSpace(toString(h1)), start: h1.position.start.offset, end: h1.position.end.offset }
      : null;
  const paragraph = tree.children.find(
    (node): node is Paragraph => node.type === 'paragraph' && normalizeSpace(toString(node)).length > 0,
  );
  return {
    firstH1,
    startsWithH1: Boolean(h1 && firstMeaningful === h1),
    excerpt: paragraph ? truncate(normalizeSpace(toString(paragraph)), 160) : undefined,
  };
}

/**
 * Sitede üretilecek başlık kimlikleri (GitHub ile aynı kurallar).
 * Bağlantılardaki `#bolum` parçalarının gerçekten var olduğunu kontrol etmek için kullanılır.
 */
export function headingIds(markdown: string): Set<string> {
  const slugger = new GithubSlugger();
  const ids = new Set<string>();
  const visit = (node: Root | RootContent): void => {
    if (node.type === 'heading') ids.add(slugger.slug(toString(node)));
    if ('children' in node) node.children.forEach((child) => visit(child as RootContent));
  };
  visit(parseMdast(markdown));
  return ids;
}

/** Tek bir başlık metninin kimliği (yeni bir belgedeki ilk başlık gibi). */
export function headingIdForText(text: string): string {
  return new GithubSlugger().slug(text);
}

/**
 * Başlık kimliklerini karşılaştırmak için gevşek biçim: büyük/küçük harf ve
 * birleşik işaretler yok sayılır. Türkçe "İ" harfinden gelen `i̇` (i + nokta)
 * böylece düz `i` ile eşleşir.
 */
export function looseHeadingId(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('tr').replace(/ı/g, 'i');
}

/** Belirtilen aralığı ve hemen ardından gelen boş satırları siler. */
export function removeRange(markdown: string, start: number, end: number): string {
  return markdown.slice(0, start) + markdown.slice(end).replace(/^[ \t]*(\r?\n[ \t]*)*(\r?\n)?/, '');
}

function normalizeSpace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  const cut = value.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s.,;:!?-]+$/, '')}…`;
}
