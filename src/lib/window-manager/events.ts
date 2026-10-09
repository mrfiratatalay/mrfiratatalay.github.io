/**
 * Pencere yöneticisi ile dock/menü adacıkları arasındaki olaylar.
 * Adacıklar ayrı React kökleri olduğu için iletişim tarayıcı olaylarıyla yapılır.
 */
export const WINDOWS_CHANGED = 'pencereler:degisti';
export const WINDOW_COMMAND = 'pencereler:komut';
export const OPEN_SEARCH = 'arama:ac';

export interface WindowSummary {
  id: string;
  title: string;
  icon: string;
  minimized: boolean;
  closed: boolean;
  /** The foreground window; minimized and closed windows are never active. */
  active?: boolean;
  /** The window's document URL, independent of the initial page URL. */
  url?: string;
}

export interface WindowCommand {
  id: string;
  action: 'restore';
}

declare global {
  interface Window {
    __pencereler?: WindowSummary[];
  }
}

export function currentWindows(): WindowSummary[] {
  return typeof window === 'undefined' ? [] : (window.__pencereler ?? []);
}

export function sendWindowCommand(command: WindowCommand): void {
  window.dispatchEvent(new CustomEvent<WindowCommand>(WINDOW_COMMAND, { detail: command }));
}

export function openSearch(opener?: HTMLElement | null): void {
  window.dispatchEvent(new CustomEvent(OPEN_SEARCH, { detail: { opener: opener ?? null } }));
}
