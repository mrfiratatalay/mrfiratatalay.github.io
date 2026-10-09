/** Load a pre-rendered page into the existing desktop without replacing it. */
export interface PageMetadata {
  title: string;
  description: string;
  canonical: string;
  alternates: Array<{ language: string; href: string }>;
}

export function pageMetadata(doc: Document): PageMetadata {
  return {
    title: doc.title,
    description: doc.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ?? '',
    canonical: doc.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? '',
    alternates: [...doc.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]')].map((link) => ({
      language: link.hreflang,
      href: link.href,
    })),
  };
}

export function activateMetadata(meta: PageMetadata, url: URL): void {
  document.title = meta.title;
  const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (description) description.content = meta.description;
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) canonical.href = meta.canonical || new URL(url.pathname, url.origin).href;
  for (const link of document.querySelectorAll('link[rel="alternate"][hreflang]')) link.remove();
  for (const alternate of meta.alternates) {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = alternate.language;
    link.href = alternate.href;
    document.head.append(link);
  }
  for (const link of document.querySelectorAll<HTMLAnchorElement>('.menubar [data-lang-switch]')) {
    const alternate = meta.alternates.find((item) => item.language === link.dataset.langSwitch);
    if (!alternate) continue;
    const target = new URL(alternate.href, url);
    target.searchParams.set('dil', alternate.language);
    link.href = target.href;
  }
}

const stylesheets = new Map<string, Promise<void>>();

async function loadStyles(doc: Document, base: URL): Promise<void> {
  const tasks: Promise<void>[] = [];
  for (const source of doc.querySelectorAll<HTMLLinkElement>('head link[rel="stylesheet"]')) {
    const href = new URL(source.getAttribute('href') ?? '', base).href;
    if (href && !stylesheets.has(href)) {
      const existing = [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].some((link) => link.href === href);
      if (existing) stylesheets.set(href, Promise.resolve());
      else {
        const pending = new Promise<void>((resolve, reject) => {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = href;
          if (source.media) link.media = source.media;
          link.onload = () => resolve();
          link.onerror = () => { link.remove(); stylesheets.delete(href); reject(new Error('stylesheet')); };
          document.head.append(link);
        });
        stylesheets.set(href, pending);
      }
    }
    const pending = stylesheets.get(href);
    if (pending) tasks.push(pending);
  }
  // Inline scoped styles are emitted by the development server, too.
  for (const source of doc.querySelectorAll<HTMLStyleElement>('head style')) {
    if ([...document.head.querySelectorAll('style')].some((style) => style.textContent === source.textContent)) continue;
    document.head.append(document.importNode(source, true));
  }
  await Promise.all(tasks);
}

function prepareMarkup(el: HTMLElement, id: string, base: URL): void {
  for (const island of el.querySelectorAll<HTMLElement>('astro-island[prefix]')) {
    const previous = island.getAttribute('prefix');
    if (!previous) continue;
    const prefix = `${id}-${previous}`;
    const from = `_${previous}R_`;
    const to = `_${prefix}R_`;
    island.setAttribute('prefix', prefix);
    // Match React's identifierPrefix instead of changing island IDs arbitrarily.
    for (const node of island.querySelectorAll('*')) {
      if (node.closest('astro-island') !== island) continue;
      for (const attribute of [...node.attributes]) {
        if (attribute.value.includes(from)) node.setAttribute(attribute.name, attribute.value.replaceAll(from, to));
      }
    }
  }
  const ids = new Map<string, string>();
  // React owns its island IDs and hydration prefix. Static headings and SVG
  // gradients need their own namespace when several pages share a document.
  for (const node of el.querySelectorAll<HTMLElement>('[id]')) {
    if (node.closest('astro-island')) continue;
    const original = node.id;
    const namespaced = `${id}-${original}`;
    ids.set(original, namespaced);
    node.dataset.originalId = original;
    node.id = namespaced;
  }
  for (const node of el.querySelectorAll<Element>('*')) {
    if (node.closest('astro-island')) continue;
    for (const name of ['for', 'aria-controls', 'aria-labelledby', 'aria-describedby', 'aria-owns', 'headers']) {
      const value = node.getAttribute(name);
      if (value) node.setAttribute(name, value.split(/\s+/).map((ref) => ids.get(ref) ?? ref).join(' '));
    }
    for (const attribute of [...node.attributes]) {
      if (!attribute.value.includes('url(#')) continue;
      node.setAttribute(attribute.name, attribute.value.replace(/url\(#([^)]*)\)/g, (_, ref: string) => `url(#${ids.get(ref) ?? ref})`));
    }
    for (const name of ['href', 'src', 'poster', 'action']) {
      const value = node.getAttribute(name);
      if (!value) continue;
      if (name === 'href' && value.startsWith('#')) {
        const ref = value.slice(1);
        const renamed = ids.get(ref);
        if (node instanceof HTMLAnchorElement) {
          const target = new URL(base);
          target.hash = ref;
          node.href = target.href;
          node.dataset.windowHash = ref;
        } else if (renamed) {
          node.setAttribute('href', `#${renamed}`);
        }
      } else {
        try { node.setAttribute(name, new URL(value, base).href); } catch { /* Keep non-URL attributes intact. */ }
      }
    }
  }
  // Shared desktop scripts already run once. Astro islands hydrate on insertion.
  for (const script of el.querySelectorAll('script')) script.remove();
  el.dataset.windowId = id;
  el.dataset.windowUrl = base.href;
}

export async function loadWindow(url: URL, id: string): Promise<{ el: HTMLElement; meta: PageMetadata }> {
  const response = await fetch(url.href, { credentials: 'same-origin' });
  if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) throw new Error('page');
  const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
  const source = doc.querySelector<HTMLElement>('[data-workspace] [data-window-id]');
  if (!source || doc.documentElement.lang !== document.documentElement.lang) throw new Error('window');
  await loadStyles(doc, url);
  const el = document.importNode(source, true);
  prepareMarkup(el, id, url);
  return { el, meta: pageMetadata(doc) };
}
