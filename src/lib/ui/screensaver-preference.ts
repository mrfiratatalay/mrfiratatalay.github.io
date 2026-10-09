/** Shared by the desktop screen saver and its Control Center controls. */
export const SCREENSAVER_CHANGED = 'screensaver:changed';
export const SCREENSAVER_PREVIEW = 'screensaver:preview';

const STORAGE_KEY = 'ekran-koruyucu';
let enabledPreference: boolean | undefined;

export function getScreensaverEnabled(): boolean {
  if (enabledPreference !== undefined) return enabledPreference;
  if (typeof window === 'undefined') return true;
  try {
    enabledPreference = window.localStorage.getItem(STORAGE_KEY) !== 'false';
  } catch {
    enabledPreference = true;
  }
  return enabledPreference;
}

export function setScreensaverEnabled(enabled: boolean): void {
  enabledPreference = enabled;
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    // The preference still applies for this visit if storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent(SCREENSAVER_CHANGED));
}

/** Let the closing settings panel release its focus before opening the preview. */
export function previewScreensaver(): void {
  if (typeof window === 'undefined') return;
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent(SCREENSAVER_PREVIEW));
    });
  });
}
