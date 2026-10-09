/**
 * Pencere yöneticisi (tarayıcıda çalışır).
 *
 * Pencerelerin içeriği Astro tarafından önceden üretilmiş HTML'dir; bu modül
 * yalnızca davranış ekler: öne getirme, sürükleme, boyutlandırma, küçültme
 * (dock'tan geri açma), büyütme, kapatma ve okuma modu. Konum ve boyut aynı
 * sekme içinde sayfalar arasında hatırlanır (sessionStorage).
 *
 * Telefon ve tablet düzeninde (900 px altı) sürükleme/boyutlandırma yoktur;
 * pencere sayfanın kendisidir.
 */
import { localePaths, localizePath } from '../content/urls.ts';
import { localizeContentLinks, pageLocale, strings } from '../i18n/client.ts';
import { toggleTheme } from '../ui/appearance.ts';
import { initReadingEnhancements, showToast } from '../ui/enhancements.ts';
import { initBlogFilters } from '../ui/blog-filters.ts';
import { initPageMenus } from '../ui/page-menu.ts';
import { clampRect, isRect, moveRect, resizeRect, type Rect, type Size } from './bounds.ts';
import { openSearch, WINDOW_COMMAND, WINDOWS_CHANGED, type WindowCommand, type WindowSummary } from './events.ts';
import { activateMetadata, loadWindow, pageMetadata, type PageMetadata } from './navigation.ts';

const DESKTOP_QUERY = '(min-width: 900px)';
const STORAGE_PREFIX = 'pencere:';
const READING_KEY = 'okuma-modu';
const WORKSPACE_KEY = 'desktop-workspace:';

interface ManagedWindow {
  id: string;
  el: HTMLElement;
  title: string;
  icon: string;
  main: boolean;
  rect: Rect | null;
  maximized: boolean;
  minimized: boolean;
  closed: boolean;
  reading: boolean;
  meta: PageMetadata;
  operation: number;
}

interface SavedWindow {
  url: string;
  rect: Rect | null;
  maximized: boolean;
  minimized: boolean;
  reading: boolean;
}

interface StoredGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  maximized?: boolean;
}

const windows = new Map<string, ManagedWindow>();
let workspace: HTMLElement | null = null;
let desktopMedia: MediaQueryList;
let reducedMotion: MediaQueryList;
let initialized = false;
let activeWindow: ManagedWindow | undefined;
let navigationRequest = 0;
let historyIndex = 0;
let historyEnd = 0;
let initialUrl = '';
const pendingWindows = new Map<string, Promise<ManagedWindow>>();

function windowUrl(win: ManagedWindow): URL {
  return new URL(win.el.dataset.windowUrl ?? initialUrl, window.location.href);
}

function geometryKey(win: ManagedWindow): string {
  return `sayfa:${windowUrl(win).pathname}`;
}

function readStorage(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null): void {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    // Depolama kapalıysa pencere yine çalışır; yalnızca konum hatırlanmaz.
  }
}

function isDesktop(): boolean {
  return desktopMedia.matches;
}

function area(): Size {
  // Fullscreen hides the menu and Dock, but the saved normal rectangle must
  // continue to fit the space available after the window is restored.
  const styles = getComputedStyle(document.documentElement);
  const menuHeight = parseFloat(styles.getPropertyValue('--menubar-h')) || 34;
  const dockHeight = parseFloat(styles.getPropertyValue('--dock-reserved')) || 100;
  const desktopHeight = workspace?.closest<HTMLElement>('.desktop')?.clientHeight ?? window.innerHeight;
  return {
    width: workspace?.clientWidth ?? window.innerWidth,
    height: Math.max(0, desktopHeight - menuHeight - dockHeight),
  };
}

function measure(win: ManagedWindow): Rect {
  // The opening animation transforms the rendered box; offsets preserve the
  // actual layout instead of saving a temporarily scaled and shifted window.
  return { x: win.el.offsetLeft, y: win.el.offsetTop, width: win.el.offsetWidth, height: win.el.offsetHeight };
}

function readStored(id: string): StoredGeometry | null {
  const raw = readStorage(STORAGE_PREFIX + id);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isRect(parsed) ? (parsed as StoredGeometry) : null;
  } catch {
    return null;
  }
}

function persist(win: ManagedWindow): void {
  if (!win.rect) return;
  const geometry: StoredGeometry = { ...win.rect, maximized: win.maximized };
  writeStorage(STORAGE_PREFIX + geometryKey(win), JSON.stringify(geometry));
  // Retain the initial pre-paint fallback used before this module loads.
  if (win.id === 'main' || win.id === 'intro') writeStorage(STORAGE_PREFIX + win.id, JSON.stringify(geometry));
}

function applyGeometry(win: ManagedWindow): void {
  const { style } = win.el;
  const prefix = '--window-';
  if (isDesktop() && win.rect) {
    style.setProperty(`${prefix}x`, `${win.rect.x}px`);
    style.setProperty(`${prefix}y`, `${win.rect.y}px`);
    style.setProperty(`${prefix}w`, `${win.rect.width}px`);
    style.setProperty(`${prefix}h`, `${win.rect.height}px`);
  } else {
    for (const key of ['x', 'y', 'w', 'h']) style.removeProperty(prefix + key);
  }
  win.el.toggleAttribute('data-maximized', isDesktop() && win.maximized && activeWindow === win && !win.el.hidden);
  win.el.toggleAttribute('data-reading', win.reading);
  const zoom = win.el.querySelector<HTMLButtonElement>('[data-window-action="zoom"]');
  if (zoom) {
    zoom.setAttribute('aria-pressed', String(win.maximized));
    const t = strings().window;
    const label = win.maximized ? t.unzoom : t.zoom;
    zoom.setAttribute('aria-label', label);
    zoom.title = label;
  }
}

/** Sayfa ilk çizilirken satır içi betiğin koyduğu geçici değerleri temizler. */
function clearPrePaintState(win: ManagedWindow): void {
  const root = document.documentElement;
  root.removeAttribute(`data-${win.id}-maximized`);
  for (const key of ['x', 'y', 'w', 'h']) root.style.removeProperty(`--${win.id}-${key}`);
}

function broadcast(): void {
  const summary: WindowSummary[] = [...windows.values()].map((win) => ({
    id: win.id,
    title: win.title,
    icon: win.icon,
    minimized: win.minimized,
    closed: win.closed,
    active: activeWindow === win && !win.minimized && !win.closed,
    url: windowUrl(win).href,
  }));
  window.__pencereler = summary;
  window.dispatchEvent(new CustomEvent<WindowSummary[]>(WINDOWS_CHANGED, { detail: summary }));
  updateWindowMenu();
  if (isDesktop()) {
    const saved: SavedWindow[] = [...windows.values()].filter((win) => !win.closed).map((win) => ({
      url: windowUrl(win).href, rect: win.rect, maximized: win.maximized, minimized: win.minimized, reading: win.reading,
    }));
    writeStorage(WORKSPACE_KEY + pageLocale(), JSON.stringify(saved));
  }
}

function focusWindow(win: ManagedWindow, historyMode: 'push' | 'replace' | 'none' = 'replace'): void {
  // Keep windows below the Dock and menu even after many interactions.
  const others = [...windows.values()]
    .filter((other) => other !== win)
    .sort((a, b) => (Number(a.el.style.zIndex) || 30) - (Number(b.el.style.zIndex) || 30));
  others.forEach((other, index) => {
    other.el.style.zIndex = String(30 + Math.floor(index * 100 / Math.max(1, others.length)));
    other.el.classList.remove('is-active');
  });
  win.el.style.zIndex = '131';
  win.el.classList.add('is-active');
  activeWindow = win;
  for (const other of windows.values()) applyGeometry(other);
  if (isDesktop()) {
    const url = windowUrl(win);
    activateMetadata(win.meta, url);
    if (historyMode !== 'none') {
      if (historyMode === 'push' && url.href !== window.location.href) historyEnd = ++historyIndex;
      const state = { ...window.history.state, desktopWindow: win.id, desktopIndex: historyIndex };
      if (historyMode === 'push' && url.href !== window.location.href) window.history.pushState(state, '', url);
      else window.history.replaceState(state, '', url);
    }
    syncDesktopLinks(win);
  }
  updateHistoryControls();
  broadcast();
}

function syncDesktopLinks(win: ManagedWindow): void {
  const url = windowUrl(win);
  const section = win.el.dataset.windowSection ?? win.icon;
  for (const link of document.querySelectorAll<HTMLAnchorElement>('.menubar a[data-section-link], .desktop-icons a[data-section-link]')) {
    const target = new URL(link.href);
    const exact = target.pathname === url.pathname;
    const inSection = target.pathname !== localePaths(pageLocale()).home && url.pathname.startsWith(target.pathname);
    if (exact || inSection) link.setAttribute('aria-current', exact ? 'page' : 'true');
    else link.removeAttribute('aria-current');
  }
  const skip = document.querySelector<HTMLAnchorElement>('.skip-link:not(.skip-link--mobile)');
  const content = win.el.querySelector<HTMLElement>('.window__content');
  if (skip && content) skip.href = `#${content.id}`;
  // The home window keeps its own visual treatment while other sections are active.
  document.documentElement.dataset.desktopSection = section;
}

function updateHistoryControls(): void {
  for (const win of windows.values()) {
    const back = win.el.querySelector<HTMLButtonElement>('[data-window-action="back"]');
    const forward = win.el.querySelector<HTMLButtonElement>('[data-window-action="forward"]');
    if (back) back.disabled = isDesktop() && historyIndex <= 0;
    if (forward) forward.disabled = isDesktop() && historyIndex >= historyEnd;
  }
}

function updateWindowMenu(): void {
  const list = document.querySelector<HTMLElement>('[data-window-menu-list]');
  if (!list) return;
  const open = [...windows.values()].filter((win) => !win.closed);
  const fragment = document.createDocumentFragment();
  for (const win of open) {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.restoreWindow = win.id;
    button.setAttribute('aria-pressed', String(win === activeWindow && !win.minimized));
    const mark = document.createElement('span');
    mark.className = 'desktop-window-menu__mark';
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = win === activeWindow && !win.minimized ? '✓' : win.minimized ? '−' : '';
    const label = document.createElement('span');
    label.textContent = win.title;
    button.title = win.title;
    button.append(mark, label);
    item.append(button);
    fragment.append(item);
  }
  list.replaceChildren(fragment);
  const empty = document.querySelector<HTMLElement>('[data-window-menu-empty]');
  if (empty) empty.hidden = open.length > 0;
}

function dockTarget(win: ManagedWindow): Element | null {
  const target = document.querySelector(`[data-dock-section="${win.icon}"]`) ?? document.querySelector('.dock');
  // Tam ekranda gizlenen dock'a doğru sıfır koordinatlı animasyon yapma.
  return target?.getClientRects().length ? target : null;
}

function animateToward(el: HTMLElement, target: Element | null, direction: 'out' | 'in'): Promise<void> {
  if (reducedMotion.matches || !target || typeof el.animate !== 'function') return Promise.resolve();
  const from = el.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const frames: Keyframe[] = [
    { transform: 'none', opacity: 1 },
    { transform: `translate(${dx}px, ${dy}px) scale(0.08)`, opacity: 0 },
  ];
  const animation = el.animate(direction === 'out' ? frames : [...frames].reverse(), {
    duration: 260,
    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  });
  return animation.finished.then(
    () => undefined,
    () => undefined,
  );
}

function pulse(win: ManagedWindow): void {
  if (reducedMotion.matches) return;
  win.el.classList.remove('window__pulse');
  void win.el.offsetWidth;
  win.el.classList.add('window__pulse');
}

async function minimize(win: ManagedWindow): Promise<void> {
  if (win.minimized || win.closed) return;
  const operation = ++win.operation;
  await animateToward(win.el, dockTarget(win), 'out');
  if (operation !== win.operation) return;
  win.minimized = true;
  win.el.hidden = true;
  focusNextWindow(win);
  requestAnimationFrame(() => {
    document.querySelector<HTMLElement>(`[data-restore-window="${win.id}"]`)?.focus();
  });
}

function restore(win: ManagedWindow, historyMode: 'push' | 'replace' | 'none' = 'push'): void {
  win.operation++;
  for (const animation of win.el.getAnimations()) animation.cancel();
  const wasHidden = win.minimized || win.closed;
  win.minimized = false;
  win.closed = false;
  win.el.hidden = false;
  if (wasHidden) void animateToward(win.el, dockTarget(win), 'in');
  else pulse(win);
  focusWindow(win, historyMode);
  win.el.focus({ preventScroll: true });
}

async function close(win: ManagedWindow, control: Element): Promise<void> {
  if (!isDesktop()) {
    if (control instanceof HTMLAnchorElement) window.location.assign(control.href);
    return;
  }
  const operation = ++win.operation;
  if (!reducedMotion.matches && typeof win.el.animate === 'function') {
    await win.el
      .animate([{ transform: 'none', opacity: 1 }, { transform: 'scale(0.96)', opacity: 0 }], {
        duration: 150,
        easing: 'ease-in',
      })
      .finished.catch(() => undefined);
  }
  if (operation !== win.operation) return;
  win.closed = true;
  win.el.hidden = true;
  focusNextWindow(win);
}

function focusNextWindow(previous: ManagedWindow): void {
  previous.el.classList.remove('is-active');
  previous.el.removeAttribute('data-maximized');
  if (activeWindow !== previous) { broadcast(); return; }
  const next = [...windows.values()].filter((win) => !win.closed && !win.minimized)
    .sort((a, b) => Number(b.el.style.zIndex) - Number(a.el.style.zIndex))[0];
  if (next) {
    focusWindow(next);
    next.el.focus({ preventScroll: true });
  } else {
    activeWindow = undefined;
    window.history.replaceState({ ...window.history.state, desktopWindow: null }, '', localePaths(pageLocale()).home);
    for (const link of document.querySelectorAll('.menubar a[data-section-link][aria-current], .desktop-icons a[aria-current]')) link.removeAttribute('aria-current');
    broadcast();
    document.querySelector<HTMLElement>('.desktop-icons a')?.focus();
  }
}

function toggleZoom(win: ManagedWindow): void {
  if (!isDesktop()) return;
  win.maximized = !win.maximized;
  applyGeometry(win);
  persist(win);
  focusWindow(win);
}

function setReadingMode(enabled: boolean, win?: ManagedWindow): void {
  document.documentElement.removeAttribute('data-reading');
  writeStorage(READING_KEY, enabled ? '1' : null);
  for (const target of win ? [win] : windows.values()) {
    target.reading = enabled;
    target.el.toggleAttribute('data-reading', enabled);
    for (const button of target.el.querySelectorAll<HTMLButtonElement>('[data-window-action="reading"]')) {
      button.setAttribute('aria-pressed', String(enabled));
    }
  }
  broadcast();
}

function startPointerAction(
  win: ManagedWindow,
  event: PointerEvent,
  handle: HTMLElement,
  update: (start: Rect, dx: number, dy: number) => Rect,
): void {
  if (!isDesktop() || win.maximized || win.reading) return;
  if (event.button !== 0 || !win.rect) return;
  event.preventDefault();
  focusWindow(win);
  const start = { x: event.clientX, y: event.clientY, rect: { ...win.rect } };
  handle.setPointerCapture(event.pointerId);
  win.el.classList.add('is-moving');
  let frame = 0;
  let latest = { x: event.clientX, y: event.clientY };
  const applyLatest = () => {
    win.rect = update(start.rect, latest.x - start.x, latest.y - start.y);
    applyGeometry(win);
  };
  const onMove = (moveEvent: PointerEvent) => {
    if (moveEvent.pointerId !== event.pointerId) return;
    latest = { x: moveEvent.clientX, y: moveEvent.clientY };
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(applyLatest);
  };
  const onEnd = (endEvent: PointerEvent) => {
    if (endEvent.pointerId !== event.pointerId) return;
    if (endEvent.type === 'pointerup') latest = { x: endEvent.clientX, y: endEvent.clientY };
    cancelAnimationFrame(frame);
    applyLatest();
    handle.removeEventListener('pointermove', onMove);
    handle.removeEventListener('pointerup', onEnd);
    handle.removeEventListener('pointercancel', onEnd);
    win.el.classList.remove('is-moving');
    persist(win);
    broadcast();
  };
  handle.addEventListener('pointermove', onMove);
  handle.addEventListener('pointerup', onEnd);
  handle.addEventListener('pointercancel', onEnd);
}

function register(el: HTMLElement, meta: PageMetadata = pageMetadata(document)): ManagedWindow {
  const id = el.dataset.windowId ?? `pencere-${windows.size + 1}`;
  const url = new URL(el.dataset.windowUrl ?? initialUrl, window.location.href);
  el.dataset.windowUrl = url.href;
  const stored = readStored(`sayfa:${url.pathname}`) ?? readStored(id);
  const win: ManagedWindow = {
    id,
    el,
    title: el.querySelector<HTMLElement>('.page-title, .article-header h1')?.textContent?.trim() || el.dataset.windowTitle || document.title,
    icon: el.dataset.windowIcon ?? 'home',
    main: el.hasAttribute('data-window-main'),
    rect: null,
    maximized: Boolean(stored?.maximized),
    minimized: false,
    closed: false,
    reading: readStorage(READING_KEY) === '1',
    meta,
    operation: 0,
  };
  windows.set(id, win);
  initPageMenus(el);

  if (isDesktop()) {
    win.rect = clampRect(stored ?? measure(win), area());
  }
  applyGeometry(win);
  clearPrePaintState(win);

  el.addEventListener('pointerdown', () => {
    if (isDesktop() && activeWindow !== win) focusWindow(win);
  });
  el.addEventListener('focusin', () => {
    if (isDesktop() && activeWindow !== win) { navigationRequest++; focusWindow(win); }
  });

  for (const handle of el.querySelectorAll<HTMLElement>('[data-window-handle]')) {
    handle.addEventListener('pointerdown', (event) => {
      if ((event.target as Element).closest('a, button, input, select, textarea, summary, details, [data-no-drag]')) return;
      startPointerAction(win, event, handle, (start, dx, dy) => moveRect(start, dx, dy, area()));
    });
    handle.addEventListener('dblclick', (event) => {
      if ((event.target as Element).closest('a, button, input, select, textarea, summary, details, [data-no-drag]')) return;
      toggleZoom(win);
    });
  }

  // Kaydırma kenarı efekti: içerik kaydırılınca araç çubuğunun altı bulanıklaşır.
  const content = el.querySelector<HTMLElement>('.window__content');
  content?.addEventListener(
    'scroll',
    () => {
      el.toggleAttribute('data-scrolled', content.scrollTop > 4);
    },
    { passive: true },
  );

  const resizer = el.querySelector<HTMLElement>('[data-window-resize]');
  resizer?.addEventListener('pointerdown', (event) => {
    startPointerAction(win, event, resizer, (start, dw, dh) => resizeRect(start, dw, dh, area()));
  });

  el.addEventListener('click', (event) => {
    const control = (event.target as Element).closest<HTMLElement>('[data-window-action]');
    if (!control || !el.contains(control)) return;
    if (isDesktop()) navigationRequest++;
    const action = control.dataset.windowAction;
    if (action === 'close') {
      if (control instanceof HTMLAnchorElement && (event.metaKey || event.ctrlKey || event.shiftKey)) return;
      event.preventDefault();
      void close(win, control);
    } else if (action === 'minimize') {
      event.preventDefault();
      if (isDesktop()) void minimize(win);
    } else if (action === 'zoom') {
      event.preventDefault();
      toggleZoom(win);
    } else if (action === 'reading') {
      event.preventDefault();
      setReadingMode(!win.reading, win);
    } else if (action === 'back') {
      event.preventDefault();
      if (isDesktop()) { if (historyIndex > 0) window.history.back(); }
      else if (window.history.length > 1) window.history.back();
      else window.location.assign(localePaths(pageLocale()).home);
    } else if (action === 'forward') {
      event.preventDefault();
      window.history.forward();
    }
  });

  for (const button of el.querySelectorAll('[data-window-action="reading"]')) button.setAttribute('aria-pressed', String(win.reading));

  return win;
}

function mainWindow(): ManagedWindow | undefined {
  return [...windows.values()].find((win) => win.main);
}

function onSectionLinkClick(event: MouseEvent): void {
  // Phones retain normal page navigation and their dedicated iOS interface.
  if (!isDesktop()) return;
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }
  const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
  if (!link) return;
  if (link.hasAttribute('download') || link.hasAttribute('data-lang-switch') || link.target && link.target !== '_self') return;
  const owner = windows.get(link.closest<HTMLElement>('[data-window-id]')?.dataset.windowId ?? '');
  const raw = link.getAttribute('href') ?? '';
  const url = new URL(raw, owner ? windowUrl(owner) : window.location.href);
  if (url.origin !== window.location.origin || !/^https?:$/.test(url.protocol)) return;
  if (raw.startsWith('#') || owner && url.pathname === windowUrl(owner).pathname && url.search === windowUrl(owner).search && url.hash) {
    const win = owner ?? [...windows.values()].find((item) => findFragment(item, url.hash));
    if (!win) return;
    event.preventDefault();
    const fragment = link.dataset.windowHash ?? url.hash.slice(1);
    restore(win, 'replace');
    scrollToFragment(win, `#${fragment}`, true);
    return;
  }
  if (!isWindowUrl(url)) return;
  event.preventDefault();
  void openPage(url);
}

function isWindowUrl(url: URL): boolean {
  if (url.origin !== window.location.origin || !/^https?:$/.test(url.protocol)) return false;
  if (/\.(?:pdf|png|jpe?g|webp|gif|svg|xml|json|zip|md|txt|html)$/i.test(url.pathname)) return false;
  return localizePath(url.pathname, 'tr') !== localizePath(url.pathname, 'en') && localizePath(url.pathname, pageLocale()) === url.pathname;
}

function findFragment(win: ManagedWindow, hash: string): HTMLElement | undefined {
  let id: string;
  try { id = decodeURIComponent(hash.replace(/^#/, '')); } catch { return; }
  return [...win.el.querySelectorAll<HTMLElement>('[id]')].find((node) => node.id === id || node.dataset.originalId === id);
}

function scrollToFragment(win: ManagedWindow, hash: string, updateUrl = false): void {
  const target = findFragment(win, hash);
  if (!target) return;
  const content = win.el.querySelector<HTMLElement>('.window__content');
  if (content) {
    const padding = parseFloat(getComputedStyle(content).scrollPaddingTop) || 0;
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const top = target === content ? 0 : target.getBoundingClientRect().top - content.getBoundingClientRect().top + content.scrollTop - padding - margin;
    content.scrollTo({ top: Math.max(0, top), behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  }
  if (target.classList.contains('window__content')) target.focus({ preventScroll: true });
  if (updateUrl) {
    const url = windowUrl(win);
    url.hash = target.dataset.originalId ?? target.id;
    win.el.dataset.windowUrl = url.href;
    window.history.replaceState(window.history.state, '', url);
    broadcast();
  }
}

function uniqueWindowId(url: URL): string {
  let hash = 2166136261;
  for (const character of url.pathname) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  const base = `page-${(hash >>> 0).toString(36)}`;
  let id = base;
  for (let suffix = 1; windows.has(id); suffix++) id = `${base}-${suffix}`;
  return id;
}

async function createPageWindow(url: URL): Promise<ManagedWindow> {
  if (!workspace) throw new Error('workspace');
  const { el, meta } = await loadWindow(url, uniqueWindowId(url));
  // A resize can cross into the phone layout while the page is downloading.
  if (!isDesktop()) throw new Error('mobile');
  workspace.append(el);
  const win = register(el, meta);
  if (!readStored(geometryKey(win)) && win.rect && !el.classList.contains('window--intro')) {
    const offset = Math.min(5, windows.size - 1) * 24;
    win.rect = clampRect({ ...win.rect, x: Math.max(0, Math.min(win.rect.x + offset, area().width - win.rect.width - 8)), y: 8 + offset, height: Math.min(win.rect.height, Math.max(240, area().height - 48 - offset)) }, area());
    applyGeometry(win);
  }
  localizeContentLinks(el);
  initReadingEnhancements(el);
  initBlogFilters(el);
  broadcast();
  return win;
}

async function ensurePageWindow(url: URL): Promise<ManagedWindow> {
  const existing = [...windows.values()].find((win) => windowUrl(win).pathname === url.pathname);
  if (existing) return existing;
  const key = url.pathname;
  const pending = pendingWindows.get(key);
  if (pending) return pending;
  const task = createPageWindow(url).finally(() => {
    pendingWindows.delete(key);
    document.documentElement.toggleAttribute('data-window-loading', pendingWindows.size > 0);
  });
  pendingWindows.set(key, task);
  document.documentElement.setAttribute('data-window-loading', '');
  return task;
}

async function openPage(url: URL, historyMode: 'push' | 'replace' | 'none' = 'push'): Promise<void> {
  const request = ++navigationRequest;
  try {
    const win = await ensurePageWindow(url);
    if (historyMode === 'none' || url.search && windowUrl(win).search !== url.search || url.hash) {
      win.el.dataset.windowUrl = url.href;
      win.el.dispatchEvent(new CustomEvent('desktop:location'));
    }
    // Both rapid clicks create their windows; the latest click stays in front.
    if (request === navigationRequest) {
      restore(win, historyMode);
      if (url.hash) requestAnimationFrame(() => scrollToFragment(win, url.hash));
    }
  } catch {
    if (request !== navigationRequest || !isDesktop()) return;
    showToast(pageLocale() === 'tr' ? 'Pencere açılamadı. Bağlantıya tekrar tıklayabilirsin.' : 'Could not open the window. Click the link to try again.');
  }
}

function readWorkspace(): SavedWindow[] {
  try {
    const saved: unknown = JSON.parse(readStorage(WORKSPACE_KEY + pageLocale()) ?? '[]');
    if (!Array.isArray(saved)) return [];
    return saved.filter((entry): entry is SavedWindow => {
      if (!entry || typeof entry !== 'object' || typeof entry.url !== 'string') return false;
      try { return isWindowUrl(new URL(entry.url, window.location.href)); } catch { return false; }
    }).slice(0, 64);
  } catch { return []; }
}

async function restoreWorkspace(saved: SavedWindow[]): Promise<void> {
  const initiallyActive = activeWindow;
  for (const entry of saved) {
    if (!isDesktop()) return;
    const url = new URL(entry.url, window.location.href);
    if ([...windows.values()].some((win) => windowUrl(win).pathname === url.pathname)) continue;
    try {
      const win = await ensurePageWindow(url);
      if (isRect(entry.rect)) win.rect = clampRect(entry.rect, area());
      win.maximized = Boolean(entry.maximized);
      win.minimized = Boolean(entry.minimized);
      win.reading = Boolean(entry.reading);
      win.el.hidden = win.minimized;
      for (const button of win.el.querySelectorAll('[data-window-action="reading"]')) button.setAttribute('aria-pressed', String(win.reading));
      applyGeometry(win);
      // Restore behind the page the visitor opened, without changing its address.
      if (activeWindow === initiallyActive && initiallyActive) focusWindow(initiallyActive, 'none');
      else broadcast();
    } catch { /* A removed page must not prevent the rest of the desktop opening. */ }
  }
}

function onResize(): void {
  for (const win of windows.values()) {
    if (isDesktop()) {
      win.rect = win.rect ? clampRect(win.rect, area()) : measure(win);
    }
    applyGeometry(win);
  }
}

export function initDesktop(): void {
  if (initialized) return;
  initialized = true;
  workspace = document.querySelector<HTMLElement>('[data-workspace]');
  desktopMedia = window.matchMedia(DESKTOP_QUERY);
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  initialUrl = window.location.href;
  const saved = readWorkspace();
  historyIndex = Number(window.history.state?.desktopIndex) || 0;
  historyEnd = historyIndex;

  for (const el of document.querySelectorAll<HTMLElement>('[data-window-id]')) {
    el.dataset.windowUrl = initialUrl;
    register(el);
  }
  const main = mainWindow();
  if (main) focusWindow(main);

  setReadingMode(readStorage(READING_KEY) === '1');
  initBlogFilters();
  desktopMedia.addEventListener('change', () => {
    if (!isDesktop()) {
      // Re-render the foreground route with the dedicated phone layout.
      const url = activeWindow ? windowUrl(activeWindow).href : localePaths(pageLocale()).home;
      if (windows.size > 1 || new URL(url, window.location.href).pathname !== new URL(initialUrl).pathname || [...windows.values()].some((win) => win.el.hidden)) {
        window.location.replace(url);
        return;
      }
      onResize();
    } else {
      const savedDesktop = readWorkspace();
      onResize();
      if (activeWindow) focusWindow(activeWindow);
      void restoreWorkspace(savedDesktop);
    }
  });
  if (workspace && 'ResizeObserver' in window) new ResizeObserver(onResize).observe(workspace);
  else window.addEventListener('resize', onResize);

  document.addEventListener('click', onSectionLinkClick);
  document.addEventListener('click', (event) => {
    const button = (event.target as Element | null)?.closest<HTMLElement>('[data-window-menu] [data-restore-window]');
    if (!button) return;
    const win = windows.get(button.dataset.restoreWindow ?? '');
    const menu = button.closest<HTMLDetailsElement>('[data-window-menu]');
    if (menu) menu.open = false;
    if (win) { navigationRequest++; restore(win); }
  });
  document.addEventListener('pointerdown', (event) => {
    if (isDesktop()) navigationRequest++;
    for (const menu of document.querySelectorAll<HTMLDetailsElement>('[data-window-menu][open]')) {
      if (!menu.contains(event.target as Node)) menu.open = false;
    }
  }, { capture: true });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    for (const menu of document.querySelectorAll<HTMLDetailsElement>('[data-window-menu][open]')) {
      menu.open = false;
      menu.querySelector<HTMLElement>('summary')?.focus();
      event.preventDefault();
    }
  });
  window.addEventListener('popstate', (event) => {
    if (!isDesktop()) return;
    const url = new URL(window.location.href);
    if (!isWindowUrl(url)) { window.location.reload(); return; }
    historyIndex = Number(event.state?.desktopIndex) || 0;
    historyEnd = Math.max(historyEnd, historyIndex);
    void openPage(url, 'none');
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing || !isDesktop()) return;
    if (document.querySelector('dialog[open]')) return;
    const win = activeWindow;
    if (!win?.maximized || win.minimized || win.closed) return;
    event.preventDefault();
    toggleZoom(win);
  });
  document.addEventListener('click', (event) => {
    const target = (event.target as Element | null)?.closest<HTMLElement>('[data-open-search], [data-action="theme-toggle"]');
    if (!target) return;
    event.preventDefault();
    if (target.hasAttribute('data-open-search')) openSearch(target);
    else toggleTheme();
  });

  // Telefonda sayfa kaydırılınca üst gezinme çubuğu cam görünüme geçer.
  const onPageScroll = () => document.documentElement.toggleAttribute('data-page-scrolled', window.scrollY > 6);
  window.addEventListener('scroll', onPageScroll, { passive: true });
  onPageScroll();
  window.addEventListener(WINDOW_COMMAND, (event) => {
    const { id, action } = (event as CustomEvent<WindowCommand>).detail;
    const win = windows.get(id);
    if (win && action === 'restore') { navigationRequest++; restore(win); }
  });
  broadcast();
  if (isDesktop()) void restoreWorkspace(saved);
}
