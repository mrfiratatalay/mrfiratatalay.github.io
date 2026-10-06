/**
 * Adres (URL) parçası üretme kuralları.
 *
 * Bu dosya hem Astro sayfaları hem de Node betikleri (not içe aktarma,
 * içerik kontrolü) tarafından kullanılır. Aynı kural iki yerde yazılmasın diye
 * adres üretimiyle ilgili her şey burada durur.
 */

/** Kullanıcıya açık adres parçaları için izin verilen biçim: `spring-boot-controller`. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const TURKISH_LETTERS: Readonly<Record<string, string>> = {
  ç: 'c',
  Ç: 'c',
  ğ: 'g',
  Ğ: 'g',
  ı: 'i',
  I: 'i',
  İ: 'i',
  ö: 'o',
  Ö: 'o',
  ş: 's',
  Ş: 's',
  ü: 'u',
  Ü: 'u',
  â: 'a',
  Â: 'a',
  î: 'i',
  Î: 'i',
  û: 'u',
  Û: 'u',
};

/** Türkçe harfleri tutarlı biçimde dönüştürerek adres parçası üretir. */
export function slugify(input: string): string {
  const transliterated = Array.from(input, (char) => TURKISH_LETTERS[char] ?? char).join('');
  return transliterated
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' ve ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isValidSlug(value: string): boolean {
  return SLUG_PATTERN.test(value);
}

const MARKDOWN_EXTENSION = /\.(md|markdown)$/i;

export function isMarkdownPath(path: string): boolean {
  return MARKDOWN_EXTENSION.test(path);
}

/**
 * Kaynak repodaki dosya yolundan kararlı not adresi üretir.
 * `chapters/Chapter 2/Part-3.md` -> `chapters/chapter-2/part-3`
 *
 * Başlık değişse bile adres değişmez; adres yalnızca dosya yolundan gelir.
 * Boş kalan bir parça için `fallback` kullanılır (çağıran taraf kararlı bir değer verir).
 */
export function notePathToSlug(relativePath: string, fallback: (segment: string) => string): string {
  const withoutExtension = relativePath.replace(MARKDOWN_EXTENSION, '');
  return withoutExtension
    .split('/')
    .filter((segment) => segment.length > 0)
    .map((segment) => slugify(segment) || fallback(segment))
    .join('/');
}

/** Not adresinin her parçası geçerli mi? (`a/b-c/d`) */
export function isValidNoteSlug(value: string): boolean {
  return value.length > 0 && value.split('/').every((segment) => SLUG_PATTERN.test(segment));
}
