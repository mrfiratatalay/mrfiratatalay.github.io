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
import { localePaths } from '../content/urls.ts';
import { pageLocale, strings } from '../i18n/client.ts';
import { toggleTheme } from '../ui/appearance.ts';
import { clampRect, isRect, moveRect, resizeRect, type Rect, type Size } from './bounds.ts';
import { openSearch, WINDOW_COMMAND, WINDOWS_CHANGED, type WindowCommand, type WindowSummary } from './events.ts';

const DESKTOP_QUERY = '(min-width: 900px)';
const STORAGE_PREFIX = 'pencere:';
const READING_KEY = 'okuma-modu';

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
let topZ = 30;
let initialized = false;

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
  return { width: workspace?.clientWidth ?? window.innerWidth, height: workspace?.clientHeight ?? window.innerHeight };
}

function measure(win: ManagedWindow): Rect {
  const box = win.el.getBoundingClientRect();
  const origin = workspace?.getBoundingClientRect() ?? { left: 0, top: 0 };
  return { x: box.left - origin.left, y: box.top - origin.top, width: box.width, height: box.height };
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
  writeStorage(STORAGE_PREFIX + win.id, JSON.stringify(geometry));
}

function applyGeometry(win: ManagedWindow): void {
  const { style } = win.el;
  const prefix = `--${win.id}-`;
  if (isDesktop() && win.rect) {
    style.setProperty(`${prefix}x`, `${win.rect.x}px`);
    style.setProperty(`${prefix}y`, `${win.rect.y}px`);
    style.setProperty(`${prefix}w`, `${win.rect.width}px`);
    style.setProperty(`${prefix}h`, `${win.rect.height}px`);
  } else {
    for (const key of ['x', 'y', 'w', 'h']) style.removeProperty(prefix + key);
  }
  win.el.toggleAttribute('data-maximized', isDesktop() && win.maximized);
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
  }));
  window.__pencereler = summary;
  window.dispatchEvent(new CustomEvent<WindowSummary[]>(WINDOWS_CHANGED, { detail: summary }));
}

function focusWindow(win: ManagedWindow): void {
  topZ += 1;
  win.el.style.zIndex = String(topZ);
  for (const other of windows.values()) other.el.classList.toggle('is-active', other === win);
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
  await animateToward(win.el, dockTarget(win), 'out');
  win.minimized = true;
  win.el.hidden = true;
  broadcast();
  requestAnimationFrame(() => {
    document.querySelector<HTMLElement>(`[data-restore-window="${win.id}"]`)?.focus();
  });
}

function restore(win: ManagedWindow): void {
  const wasHidden = win.minimized || win.closed;
  win.minimized = false;
  win.closed = false;
  win.el.hidden = false;
  if (wasHidden) void animateToward(win.el, dockTarget(win), 'in');
  else pulse(win);
  focusWindow(win);
  win.el.focus({ preventScroll: true });
  broadcast();
}

async function close(win: ManagedWindow, control: Element): Promise<void> {
  // Ana içerik penceresinin kapatma düğmesi masaüstüne giden gerçek bir bağlantıdır.
  if (control instanceof HTMLAnchorElement) {
    if (!reducedMotion.matches && typeof win.el.animate === 'function') {
      await win.el
        .animate([{ transform: 'none', opacity: 1 }, { transform: 'scale(0.96)', opacity: 0 }], {
          duration: 150,
          easing: 'ease-in',
          fill: 'forwards',
        })
        .finished.catch(() => undefined);
    }
    window.location.assign(control.href);
    return;
  }
  await animateToward(win.el, null, 'out');
  win.closed = true;
  win.el.hidden = true;
  broadcast();
  document.querySelector<HTMLElement>('.desktop-icons a')?.focus();
}

function toggleZoom(win: ManagedWindow): void {
  if (!isDesktop()) return;
  win.maximized = !win.maximized;
  applyGeometry(win);
  persist(win);
  focusWindow(win);
}

function setReadingMode(enabled: boolean): void {
  document.documentElement.toggleAttribute('data-reading', enabled);
  writeStorage(READING_KEY, enabled ? '1' : null);
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-window-action="reading"]')) {
    button.setAttribute('aria-pressed', String(enabled));
  }
}

function startPointerAction(
  win: ManagedWindow,
  event: PointerEvent,
  handle: HTMLElement,
  update: (start: Rect, dx: number, dy: number) => Rect,
): void {
  if (!isDesktop() || win.maximized || document.documentElement.hasAttribute('data-reading')) return;
  if (event.button !== 0 || !win.rect) return;
  event.preventDefault();
  focusWindow(win);
  const start = { x: event.clientX, y: event.clientY, rect: { ...win.rect } };
  handle.setPointerCapture(event.pointerId);
  win.el.classList.add('is-moving');
  let frame = 0;
  const onMove = (moveEvent: PointerEvent) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      win.rect = update(start.rect, moveEvent.clientX - start.x, moveEvent.clientY - start.y);
      applyGeometry(win);
    });
  };
  const onEnd = () => {
    cancelAnimationFrame(frame);
    handle.removeEventListener('pointermove', onMove);
    handle.removeEventListener('pointerup', onEnd);
    handle.removeEventListener('pointercancel', onEnd);
    win.el.classList.remove('is-moving');
    persist(win);
  };
  handle.addEventListener('pointermove', onMove);
  handle.addEventListener('pointerup', onEnd);
  handle.addEventListener('pointercancel', onEnd);
}

function register(el: HTMLElement): ManagedWindow {
  const id = el.dataset.windowId ?? `pencere-${windows.size + 1}`;
  const stored = readStored(id);
  const win: ManagedWindow = {
    id,
    el,
    title: el.dataset.windowTitle ?? document.title,
    icon: el.dataset.windowIcon ?? 'home',
    main: el.hasAttribute('data-window-main'),
    rect: null,
    maximized: Boolean(stored?.maximized),
    minimized: false,
    closed: false,
  };
  windows.set(id, win);

  if (isDesktop()) {
    win.rect = stored ? clampRect(stored, area()) : measure(win);
  }
  applyGeometry(win);
  clearPrePaintState(win);

  el.addEventListener('pointerdown', () => focusWindow(win));

  for (const handle of el.querySelectorAll<HTMLElement>('[data-window-handle]')) {
    handle.addEventListener('pointerdown', (event) => {
      if ((event.target as Element).closest('a, button, input, [data-no-drag]')) return;
      startPointerAction(win, event, handle, (start, dx, dy) => moveRect(start, dx, dy, area()));
    });
    handle.addEventListener('dblclick', (event) => {
      if ((event.target as Element).closest('a, button, input')) return;
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
      setReadingMode(!document.documentElement.hasAttribute('data-reading'));
    } else if (action === 'back') {
      event.preventDefault();
      if (window.history.length > 1) window.history.back();
      else window.location.assign(localePaths(pageLocale()).home);
    } else if (action === 'forward') {
      event.preventDefault();
      window.history.forward();
    }
  });

  return win;
}

function mainWindow(): ManagedWindow | undefined {
  return [...windows.values()].find((win) => win.main);
}

function onSectionLinkClick(event: MouseEvent): void {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }
  const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[data-section-link]');
  if (!link) return;
  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return;
  const win = mainWindow();
  if (!win) return;
  // Aynı klasörü tekrar açmak mevcut pencereyi öne getirir.
  event.preventDefault();
  restore(win);
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

  for (const el of document.querySelectorAll<HTMLElement>('[data-window-id]')) register(el);
  const main = mainWindow();
  if (main) focusWindow(main);

  setReadingMode(readStorage(READING_KEY) === '1');
  desktopMedia.addEventListener('change', onResize);
  if (workspace && 'ResizeObserver' in window) new ResizeObserver(onResize).observe(workspace);
  else window.addEventListener('resize', onResize);

  document.addEventListener('click', onSectionLinkClick);
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing || !isDesktop()) return;
    if (document.querySelector('dialog[open]')) return;
    const expanded = [...windows.values()].filter((win) => win.maximized && !win.minimized && !win.closed);
    const win = expanded.find((item) => item.el.classList.contains('is-active')) ?? expanded[0];
    if (!win) return;
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
    if (win && action === 'restore') restore(win);
  });
  broadcast();
}
