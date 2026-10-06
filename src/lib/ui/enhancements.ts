/**
 * Okuma sayfalarındaki küçük etkileşimler (tarayıcıda çalışır):
 * kod kopyalama, bağlantı kopyalama ve içindekilerde etkin başlık.
 * JavaScript kapalıyken içerik yine tamamen okunabilir.
 */

import { strings } from '../i18n/client.ts';

let toastTimer = 0;

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

function initCodeCopy(): void {
  const t = strings().runtime;
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-copy-code]')) {
    button.hidden = false;
    button.textContent = t.copy;
    button.setAttribute('aria-label', t.copyCode);
  }
  // Yazının içindeki tablo bölgeleri arayüz dilinde adlandırılır.
  for (const region of document.querySelectorAll<HTMLElement>('.table-scroll[role="region"]')) {
    region.setAttribute('aria-label', t.tableRegion);
  }
  document.addEventListener('click', async (event) => {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-copy-code]');
    if (!button) return;
    const code = button.closest('.code-block')?.querySelector('pre');
    if (!code) return;
    const ok = await copyText(code.innerText.replace(/\n$/, ''));
    button.dataset.state = ok ? 'copied' : 'error';
    button.textContent = ok ? t.copied : t.copyFailed;
    if (!ok) showToast(t.clipboardDenied);
    window.setTimeout(() => {
      button.textContent = t.copy;
      delete button.dataset.state;
    }, 2200);
  });
}

function initCopyLink(): void {
  document.addEventListener('click', async (event) => {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-copy-link]');
    if (!button) return;
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
    const url = canonical ?? window.location.href;
    const ok = await copyText(url);
    const t = strings().runtime;
    showToast(ok ? t.linkCopied : t.linkCopyFailed(url));
  });
}

/** İçindekiler listesinde okunan başlığı işaretler. */
function initTocHighlight(): void {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-toc] a[href^="#"]')];
  if (links.length === 0 || !('IntersectionObserver' in window)) return;
  const headings = links
    .map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1))))
    .filter((heading): heading is HTMLElement => heading !== null);
  const scroller = document.querySelector<HTMLElement>('.window--main .window__content');
  const visible = new Set<Element>();
  const update = () => {
    const current = headings.find((heading) => visible.has(heading)) ?? null;
    for (const link of links) {
      const active = current !== null && decodeURIComponent(link.hash.slice(1)) === current.id;
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  };
  const observer = new IntersectionObserver(
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
}

export function initReadingEnhancements(): void {
  initCodeCopy();
  initCopyLink();
  initTocHighlight();
}
