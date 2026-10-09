/**
 * Pencere yöneticisi ile dock/menü adacıkları arasındaki olaylar.
 * Adacıklar ayrı React kökleri olduğu için iletişim tarayıcı olaylarıyla yapılır.
 */
export const WINDOWS_CHANGED = 'pencereler:degisti';
export const WINDOW_COMMAND = 'pencereler:komut';
export const OPEN_SEARCH = 'arama:ac';

interface SearchOpenRequest {
  opener: HTMLElement | null;
}

const searchOpenListeners = new Set<(event: Event) => void>();
let pendingSearchRequest: SearchOpenRequest | null = null;

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
  const request: SearchOpenRequest = { opener: opener ?? null };
  if (searchOpenListeners.size === 0) pendingSearchRequest = request;
  window.dispatchEvent(new CustomEvent<SearchOpenRequest>(OPEN_SEARCH, { detail: request }));
}

/** Preserve the latest request until the dialog's hydrated listener is ready. */
export function registerSearchOpener(open: (opener: HTMLElement | null) => void): () => void {
  const listener = (event: Event) => {
    open((event as CustomEvent<SearchOpenRequest>).detail?.opener ?? null);
  };
  searchOpenListeners.add(listener);
  window.addEventListener(OPEN_SEARCH, listener);

  if (pendingSearchRequest) {
    const request = pendingSearchRequest;
    pendingSearchRequest = null;
    open(request.opener);
  }

  return () => {
    searchOpenListeners.delete(listener);
    window.removeEventListener(OPEN_SEARCH, listener);
  };
}
