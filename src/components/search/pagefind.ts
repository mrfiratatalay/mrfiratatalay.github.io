/**
 * Pagefind arama paketini yalnızca arama açıldığında yükler.
 * Paket `npm run build` sonrasında `dist/pagefind/` içinde oluşur; geliştirme
 * sunucusunda bulunmaması normaldir.
 */
export interface PagefindResultData {
  url: string;
  excerpt: string;
  meta: Record<string, string | undefined>;
}

interface PagefindResult {
  id: string;
  data: () => Promise<PagefindResultData>;
}

interface PagefindSearch {
  results: PagefindResult[];
}

interface PagefindModule {
  options: (options: Record<string, unknown>) => Promise<void>;
  init: () => Promise<void>;
  debouncedSearch: (term: string, options?: Record<string, unknown>, debounceMs?: number) => Promise<PagefindSearch | null>;
}

const BUNDLE_URL = '/pagefind/pagefind.js';
let loading: Promise<PagefindModule> | null = null;

export function loadPagefind(): Promise<PagefindModule> {
  if (!loading) {
    loading = (import(/* @vite-ignore */ BUNDLE_URL) as Promise<PagefindModule>)
      .then(async (pagefind) => {
        await pagefind.options({ excerptLength: 26 });
        await pagefind.init();
        return pagefind;
      })
      .catch((error: unknown) => {
        // Bir sonraki denemede yeniden yüklenebilsin.
        loading = null;
        throw error;
      });
  }
  return loading;
}

export interface SearchHit {
  url: string;
  title: string;
  type: string;
  excerpt: string;
}

export async function search(term: string, limit: number): Promise<{ hits: SearchHit[]; total: number } | null> {
  const pagefind = await loadPagefind();
  const result = await pagefind.debouncedSearch(term, {}, 220);
  if (!result) return null;
  const data = await Promise.all(result.results.slice(0, limit).map((item) => item.data()));
  return {
    total: result.results.length,
    hits: data.map((item) => ({
      url: item.url,
      title: item.meta.title ?? item.url,
      type: item.meta.type ?? 'page',
      excerpt: item.excerpt,
    })),
  };
}
