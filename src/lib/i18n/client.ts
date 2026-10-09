/**
 * Tarayıcıda dil işleri: sayfanın dili, ziyaretçinin dil tercihi ve dil
 * değiştirme bağlantıları. Hangi dilin açılacağına sayfa çizilmeden önce
 * DesktopLayout'taki satır içi betik karar verir; bu modül sonradan çalışır.
 */
import { localizePath } from '../content/urls.ts';
import { DEFAULT_LOCALE, isLocale, LANGUAGE_KEY, type Locale } from './locales.ts';
import { UI, type Dictionary } from './ui.ts';

export function pageLocale(): Locale {
  const lang = document.documentElement.lang;
  return isLocale(lang) ? lang : DEFAULT_LOCALE;
}

export function strings(): Dictionary {
  return UI[pageLocale()];
}

/** Kayıtlı tercih; "otomatik" seçiliyse null. */
export function getLanguagePreference(): Locale | null {
  const current = document.documentElement.dataset.langPref;
  if (current === 'auto') return null;
  if (isLocale(current)) return current;
  for (const storage of [() => localStorage, () => sessionStorage]) {
    try {
      const value = storage().getItem(LANGUAGE_KEY);
      if (isLocale(value)) return value;
    } catch {
      // Depolama kapalı olabilir.
    }
  }
  return null;
}

/** Tercihi kaydeder; kaydedilemezse false döner. `null` otomatik seçime döner. */
export function setLanguagePreference(locale: Locale | null): boolean {
  let stored = false;
  for (const storage of [() => localStorage, () => sessionStorage]) {
    try {
      if (locale === null) storage().removeItem(LANGUAGE_KEY);
      else storage().setItem(LANGUAGE_KEY, locale);
      stored = true;
    } catch {
      // Diğer depolama denenir.
    }
  }
  document.documentElement.dataset.langPref = locale ?? 'auto';
  document.documentElement.toggleAttribute('data-lang-transient', locale !== null && !stored);
  const url = new URL(window.location.href);
  if (locale !== null && !stored) url.searchParams.set(LANGUAGE_KEY, locale);
  else url.searchParams.delete(LANGUAGE_KEY);
  window.history.replaceState(window.history.state, '', url);
  return stored;
}

/** Cihaz dili: listede ilk Türkçe veya İngilizce olan; ikisi de yoksa İngilizce. */
export function deviceLocale(): Locale {
  const list = navigator.languages?.length ? navigator.languages : [navigator.language ?? ''];
  for (const item of list) {
    const code = String(item).slice(0, 2).toLowerCase();
    if (isLocale(code)) return code;
  }
  return 'en';
}

/** Sayfanın istenen dildeki karşılığına gider (aynı dildeyse bir şey yapmaz). */
export function goToLocale(locale: Locale, stored = true): void {
  if (locale === pageLocale()) return;
  const target = localizePath(window.location.pathname, locale);
  const alternate = document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${locale}"]`);
  const path = alternate ? new URL(alternate.href).pathname : target;
  const url = new URL(path + window.location.search + window.location.hash, window.location.href);
  url.searchParams.delete(LANGUAGE_KEY);
  // Tercih saklanamadıysa yeni sayfa da seçimi bilsin diye adrese eklenir.
  if (!stored) url.searchParams.set(LANGUAGE_KEY, locale);
  window.location.assign(url);
}

/** Depolama kapalıysa açık tercih site içinde adreslerle taşınır. */
function preserveTransientPreference(event: MouseEvent): void {
  if (!document.documentElement.hasAttribute('data-lang-transient')) return;
  const locale = getLanguagePreference();
  if (!locale) return;
  const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
  if (!link || link.hasAttribute('data-lang-switch') || link.hasAttribute('download')) return;
  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin) return;
  const recognized = localizePath(url.pathname, 'tr') !== localizePath(url.pathname, 'en');
  if (!recognized && url.pathname !== '/404.html' && url.pathname !== '/en/404/') return;
  url.searchParams.set(LANGUAGE_KEY, locale);
  link.href = url.toString();
}

/** Dil değiştirme bağlantıları JavaScript olmadan da çalışır; burada yalnızca tercih kaydedilir. */
function onLanguageLinkClick(event: MouseEvent): void {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }
  const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[data-lang-switch]');
  if (!link) return;
  const locale = link.dataset.langSwitch;
  if (!isLocale(locale)) return;
  event.preventDefault();
  followLanguageLink(link);
}

/** Shared by native page menus and the desktop language switch. */
export function followLanguageLink(link: HTMLAnchorElement): void {
  const locale = link.dataset.langSwitch;
  if (!isLocale(locale)) return;
  const stored = setLanguagePreference(locale);
  if (locale === pageLocale()) return;
  // A background Finder window can have its own locale link.
  const url = new URL(link.href, window.location.href);
  if (stored) url.searchParams.delete(LANGUAGE_KEY);
  else url.searchParams.set(LANGUAGE_KEY, locale);
  window.location.assign(url);
}

/**
 * İngilizce sayfalarda yazıların içindeki site içi bağlantılar (ör. /notlar/...)
 * İngilizce karşılıklarına çevrilir; böylece okur dil değiştirmeden gezinir.
 */
export function localizeContentLinks(root: ParentNode = document): void {
  const locale = pageLocale();
  if (locale === DEFAULT_LOCALE) return;
  for (const link of root.querySelectorAll<HTMLAnchorElement>('.prose a[href], .series-block a[href]')) {
    const href = link.getAttribute('href') ?? '';
    const url = new URL(href, root instanceof HTMLElement ? root.closest<HTMLElement>('[data-window-id]')?.dataset.windowUrl ?? window.location.href : window.location.href);
    if (url.origin !== window.location.origin || href.startsWith('#')) continue;
    const localized = localizePath(url.pathname, locale);
    if (localized !== url.pathname) link.setAttribute('href', localized + url.search + url.hash);
  }
}

export function initLanguage(): void {
  document.addEventListener('click', onLanguageLinkClick);
  document.addEventListener('click', preserveTransientPreference);
  window.addEventListener('languagechange', () => {
    if (getLanguagePreference() === null) goToLocale(deviceLocale());
  });
  localizeContentLinks();
}
