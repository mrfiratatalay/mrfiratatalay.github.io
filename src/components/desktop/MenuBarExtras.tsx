import { Moon, Search, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { openSearch } from '../../lib/window-manager/events.ts';

type Theme = 'light' | 'dark';
const THEME_KEY = 'tema';

function readStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
    // Kullanıcı tema seçmediyse işletim sistemi tercihini takip et.
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (readStoredTheme()) return;
      const next: Theme = media.matches ? 'dark' : 'light';
      document.documentElement.dataset.theme = next;
      setTheme(next);
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Tercih kaydedilemezse tema yine değişir; site kullanılabilir kalır.
    }
    setTheme(next);
  };

  const label = theme === 'dark' ? 'Açık temaya geç' : theme === 'light' ? 'Koyu temaya geç' : 'Temayı değiştir';
  return (
    <button type="button" className="icon-button" onClick={toggle} aria-label={label} title={label}>
      {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </button>
  );
}

const dayFormat = new Intl.DateTimeFormat('tr-TR', { weekday: 'short' });
const dateFormat = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' });
const timeFormat = new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' });

/** Saat dakikada bir güncellenir; sekme görünmüyorken zamanlayıcı durur. */
function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let timer = 0;
    const schedule = () => {
      window.clearTimeout(timer);
      if (document.hidden) return;
      const current = new Date();
      setNow(current);
      timer = window.setTimeout(schedule, 60_000 - (current.getSeconds() * 1000 + current.getMilliseconds()) + 50);
    };
    schedule();
    document.addEventListener('visibilitychange', schedule);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', schedule);
    };
  }, []);

  if (!now) return <span className="menubar__clock" aria-hidden="true" />;
  return (
    <time className="menubar__clock" dateTime={now.toISOString()}>
      {`${dayFormat.format(now)} ${dateFormat.format(now)} ${timeFormat.format(now)}`}
    </time>
  );
}

export default function MenuBarExtras() {
  return (
    <div className="menubar__right">
      <button
        type="button"
        className="icon-button"
        aria-label="Sitede ara"
        aria-haspopup="dialog"
        title="Sitede ara"
        onClick={(event) => openSearch(event.currentTarget)}
      >
        <Search aria-hidden="true" />
      </button>
      <ThemeToggle />
      <Clock />
    </div>
  );
}
