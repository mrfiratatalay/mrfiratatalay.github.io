/**
 * Okuma sayfalarındaki küçük etkileşimler (tarayıcıda çalışır):
 * kod kopyalama, bağlantı kopyalama ve içindekilerde etkin başlık.
 * JavaScript kapalıyken içerik yine tamamen okunabilir.
 */

import { pageLocale, strings } from '../i18n/client.ts';

let toastTimer = 0;
let readingHandlersInstalled = false;
const tocCleanups = new WeakMap<ParentNode, () => void>();

export function showToast(message: string): void {
  let toast = document.querySelector<HTMLElement>('[data-toast]');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.dataset.toast = '';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.append(toast);
  }
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    if (toast) toast.hidden = true;
  }, 3200);
}

/** Panoya kopyalar. İzin reddedilirse eski yöntemi dener; yine olmazsa false döner. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Aşağıdaki yöntem denenir.
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

function initCodeCopy(root: ParentNode): void {
  const t = strings().runtime;
  for (const button of root.querySelectorAll<HTMLButtonElement>('[data-copy-code]')) {
    button.hidden = false;
    if (!button.dataset.state) button.textContent = t.copy;
    button.setAttribute('aria-label', t.copyCode);
  }
  // Yazının içindeki tablo bölgeleri arayüz dilinde adlandırılır.
  for (const region of root.querySelectorAll<HTMLElement>('.table-scroll[role="region"]')) {
    region.setAttribute('aria-label', t.tableRegion);
  }
}

/** Delegated handlers also work in windows loaded after the initial page. */
function installReadingHandlers(): void {
  if (readingHandlersInstalled) return;
  readingHandlersInstalled = true;
  document.addEventListener('click', async (event) => {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-copy-code]');
    if (!button) return;
    const code = button.closest('.code-block')?.querySelector('pre');
    if (!code) return;
    const ok = await copyText(code.innerText.replace(/\n$/, ''));
    const t = strings().runtime;
    button.dataset.state = ok ? 'copied' : 'error';
    button.textContent = ok ? t.copied : t.copyFailed;
    if (!ok) showToast(t.clipboardDenied);
    window.setTimeout(() => {
      button.textContent = t.copy;
      delete button.dataset.state;
    }, 2200);
  });

  document.addEventListener('click', (event) => {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-copy-link]');
    if (!button) return;
    void copyPageLink(button);
  });
}

export async function copyPageLink(button: HTMLElement): Promise<void> {
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
  const windowUrl = button.closest<HTMLElement>('[data-window-id]')?.dataset.windowUrl;
  let url = canonical ?? window.location.href;
  if (windowUrl) {
    try {
      url = new URL(windowUrl, window.location.href).href;
    } catch {
      // Keep the canonical fallback if a window's URL is invalid.
    }
  }
  const ok = await copyText(url);
  const t = strings().runtime;
  showToast(ok ? t.linkCopied : t.linkCopyFailed(url));
}

/** Markdown hattının ürettiği arayüz etiketleri içerikten bağımsız olarak çevrilir. */
function localizeMarkdownLabels(root: ParentNode): void {
  const locale = pageLocale();
  const t = strings().runtime;
  for (const block of root.querySelectorAll<HTMLElement>('.code-block')) {
    const language = block.dataset.language?.toLowerCase() ?? '';
    const label = block.querySelector<HTMLElement>('.code-block__lang');
    const caption = block.querySelector<HTMLElement>('.code-block__bar');
    if (caption) caption.lang = locale;
    if (label && ['', 'plaintext', 'plain'].includes(language)) label.textContent = t.code;
    else if (label && ['text', 'txt'].includes(language)) label.textContent = t.text;
  }
  for (const notice of root.querySelectorAll<HTMLElement>('.missing-image')) {
    const alt = notice.dataset.missingImageAlt ?? (notice.textContent ?? '').replace(/^Görsel bulunamadı(?::\s*)?/, '').trim();
    notice.dataset.missingImageAlt = alt;
    notice.textContent = t.missingImage(alt);
    notice.lang = locale;
  }
  for (const heading of root.querySelectorAll<HTMLElement>('.prose [id="footnote-label"], .prose [id$="-footnote-label"], .prose [data-original-id="footnote-label"]')) {
    heading.textContent = t.footnotes;
    heading.lang = locale;
  }
  for (const link of root.querySelectorAll<HTMLAnchorElement>('[data-toc] a[href*="#"], .toc-inline a[href*="#"]')) {
    const id = fragmentId(link);
    if (id === 'footnote-label' || id?.endsWith('-footnote-label')) link.textContent = t.footnotes;
  }
  for (const link of root.querySelectorAll<HTMLAnchorElement>('.prose [data-footnote-backref], .prose .data-footnote-backref')) {
    link.setAttribute('aria-label', t.footnoteBack);
    link.lang = locale;
  }
}

function fragmentId(link: HTMLAnchorElement): string | null {
  try {
    return decodeURIComponent(link.hash.slice(1)) || null;
  } catch {
    return null;
  }
}

/** İçindekiler listesinde okunan başlığı işaretler. */
function initTocHighlight(root: ParentNode): void {
  const links = [...root.querySelectorAll<HTMLAnchorElement>('[data-toc] a[href*="#"], .toc-inline a[href*="#"]')];
  if (links.length === 0 || !('IntersectionObserver' in window)) return;

  const groups = new Map<ParentNode, HTMLAnchorElement[]>();
  for (const link of links) {
    const scope = link.closest<HTMLElement>('[data-window-id]') ?? root;
    const scopedLinks = groups.get(scope) ?? [];
    scopedLinks.push(link);
    groups.set(scope, scopedLinks);
  }

  for (const [scope, scopedLinks] of groups) {
    tocCleanups.get(scope)?.();
    const targets = scopedLinks.map((link) => {
      const id = fragmentId(link);
      const heading = id ? scope.querySelector<HTMLElement>(`#${CSS.escape(id)}, [data-original-id="${CSS.escape(id)}"]`) : null;
      return { link, heading };
    });
    const headings = [...new Set(targets.map(({ heading }) => heading).filter((heading): heading is HTMLElement => heading !== null))];
    if (headings.length === 0) continue;
    const scroller = scope instanceof Element ? scope.querySelector<HTMLElement>('.window__content') : null;
    const visible = new Set<Element>();
    const update = () => {
      const current = headings.find((heading) => visible.has(heading)) ?? null;
      for (const { link, heading } of targets) {
        if (current !== null && heading === current) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      }
    };
    let observer: IntersectionObserver | undefined;
    const observe = () => {
      observer?.disconnect();
      visible.clear();
      update();
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) visible.add(entry.target);
            else visible.delete(entry.target);
          }
          update();
        },
        {
          root: scroller && getComputedStyle(scroller).overflowY === 'auto' ? scroller : null,
          rootMargin: '0px 0px -65% 0px',
        },
      );
      for (const heading of headings) observer.observe(heading);
    };
    const desktop = window.matchMedia('(min-width: 900px)');
    observe();
    desktop.addEventListener('change', observe);
    tocCleanups.set(scope, () => {
      observer?.disconnect();
      desktop.removeEventListener('change', observe);
    });
  }
}

export function initReadingEnhancements(root: ParentNode = document): void {
  localizeMarkdownLabels(root);
  initCodeCopy(root);
  installReadingHandlers();
  initTocHighlight(root);
}
