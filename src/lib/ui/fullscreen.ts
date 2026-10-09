export type AppDisplayMode = 'browser' | 'standalone' | 'fullscreen';

export interface FullscreenState {
  standalone: boolean;
  fullscreen: boolean;
  available: boolean;
  ios: boolean;
  desktop: boolean;
  displayMode: AppDisplayMode;
}

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitFullscreenEnabled?: boolean;
  webkitExitFullscreen?: () => void | Promise<void>;
};

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => void | Promise<void>;
};

export const APP_DISPLAY_CHANGED = 'app:display-changed';
let initialized = false;
let installedDisplay = false;

function nativeElement(): Element | null {
  const doc = document as FullscreenDocument;
  return doc.fullscreenElement || doc.webkitFullscreenElement || null;
}

export function getFullscreenState(): FullscreenState {
  if (typeof window === 'undefined') {
    return { standalone: false, fullscreen: false, available: false, ios: false, desktop: false, displayMode: 'browser' };
  }
  const doc = document as FullscreenDocument;
  const root = doc.documentElement as FullscreenElement;
  const fullscreen = Boolean(nativeElement());
  const displayFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
  const standalone = window.matchMedia('(display-mode: standalone)').matches
    || (displayFullscreen && !fullscreen)
    || Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
    || (fullscreen && installedDisplay);
  if (!fullscreen) installedDisplay = standalone;
  const available = Boolean(
    (typeof root.requestFullscreen === 'function' && doc.fullscreenEnabled !== false)
    || (root.webkitRequestFullscreen && doc.webkitFullscreenEnabled !== false),
  );
  return {
    standalone,
    fullscreen,
    available,
    ios: /iPhone|iPad|iPod/.test(navigator.userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
    desktop: window.matchMedia('(min-width: 900px)').matches,
    displayMode: fullscreen || displayFullscreen ? 'fullscreen' : standalone ? 'standalone' : 'browser',
  };
}

function syncFullscreenMode(): FullscreenState {
  const state = getFullscreenState();
  document.documentElement.dataset.appDisplay = state.displayMode;
  document.documentElement.toggleAttribute('data-native-fullscreen', state.fullscreen);
  window.dispatchEvent(new CustomEvent<FullscreenState>(APP_DISPLAY_CHANGED, { detail: state }));
  return state;
}

/** Observe app/fullscreen changes. Entering browser fullscreen always needs a user gesture. */
export function initFullscreenMode(): void {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  document.addEventListener('fullscreenchange', syncFullscreenMode);
  document.addEventListener('webkitfullscreenchange', syncFullscreenMode);
  for (const query of ['(display-mode: standalone)', '(display-mode: fullscreen)', '(min-width: 900px)']) {
    window.matchMedia(query).addEventListener('change', syncFullscreenMode);
  }
  window.addEventListener('pageshow', syncFullscreenMode);
  syncFullscreenMode();
}

export function subscribeFullscreenState(listener: (state: FullscreenState) => void): () => void {
  initFullscreenMode();
  const onChange = (event: Event) => listener((event as CustomEvent<FullscreenState>).detail);
  window.addEventListener(APP_DISPLAY_CHANGED, onChange);
  listener(getFullscreenState());
  return () => window.removeEventListener(APP_DISPLAY_CHANGED, onChange);
}

export async function requestNativeFullscreen(): Promise<boolean> {
  initFullscreenMode();
  if (nativeElement()) return true;
  if (!getFullscreenState().available) throw new Error('Fullscreen is not available in this browser.');
  const doc = document as FullscreenDocument;
  const root = doc.documentElement as FullscreenElement;
  // Call the browser API before awaiting anything to preserve the click's activation.
  if (typeof root.requestFullscreen === 'function' && doc.fullscreenEnabled !== false) {
    await root.requestFullscreen({ navigationUI: 'hide' });
  } else if (root.webkitRequestFullscreen && doc.webkitFullscreenEnabled !== false) {
    await root.webkitRequestFullscreen();
  }
  return syncFullscreenMode().fullscreen;
}

export async function toggleNativeFullscreen(): Promise<boolean> {
  if (!nativeElement()) return requestNativeFullscreen();
  const doc = document as FullscreenDocument;
  if (doc.fullscreenElement && typeof doc.exitFullscreen === 'function') await doc.exitFullscreen();
  else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
  return syncFullscreenMode().fullscreen;
}
