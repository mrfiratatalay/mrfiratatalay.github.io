/**
 * Görünüm tercihleri (tarayıcıda): tema (açık / koyu / otomatik) ve okuma
 * metni boyutu. Tercihler localStorage'da saklanır; saklanamazsa site yine çalışır.
 */
export type ThemePreference = 'light' | 'dark' | 'system';

export const THEME_KEY = 'tema';
export const READING_SCALE_KEY = 'okuma-boyutu';
export const APPEARANCE_CHANGED = 'gorunum:degisti';
export const READING_SCALE_MIN = 0.9;
export const READING_SCALE_MAX = 1.3;

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Tercih kaydedilemezse görünüm yine değişir.
  }
}

function systemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getThemePreference(): ThemePreference {
  const stored = read(THEME_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'system';
}

export function getEffectiveTheme(): 'light' | 'dark' {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function notify(): void {
  window.dispatchEvent(new CustomEvent(APPEARANCE_CHANGED));
}

export function setThemePreference(preference: ThemePreference): void {
  write(THEME_KEY, preference === 'system' ? null : preference);
  document.documentElement.dataset.theme = preference === 'system' ? systemTheme() : preference;
  notify();
}

export function toggleTheme(): void {
  setThemePreference(getEffectiveTheme() === 'dark' ? 'light' : 'dark');
}

export function getReadingScale(): number {
  const value = Number(read(READING_SCALE_KEY));
  return Number.isFinite(value) && value >= READING_SCALE_MIN && value <= READING_SCALE_MAX ? value : 1;
}

export function setReadingScale(scale: number): void {
  const value = Math.min(READING_SCALE_MAX, Math.max(READING_SCALE_MIN, Math.round(scale * 100) / 100));
  write(READING_SCALE_KEY, value === 1 ? null : String(value));
  document.documentElement.style.setProperty('--reading-scale', String(value));
  notify();
}

/** Tema "otomatik" iken işletim sistemi değişikliğini takip eder. */
export function watchSystemTheme(): void {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getThemePreference() === 'system') {
      document.documentElement.dataset.theme = systemTheme();
      notify();
    }
  });
}
