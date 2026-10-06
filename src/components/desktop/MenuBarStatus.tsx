import { Monitor, Moon, Search, SlidersHorizontal, Sun } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import {
  APPEARANCE_CHANGED,
  getReadingScale,
  getThemePreference,
  READING_SCALE_MAX,
  READING_SCALE_MIN,
  setReadingScale,
  setThemePreference,
  type ThemePreference,
} from '../../lib/ui/appearance.ts';
import { openSearch } from '../../lib/window-manager/events.ts';

const THEMES: Array<{ value: ThemePreference; label: string; Icon: typeof Sun }> = [
  { value: 'light', label: 'Açık', Icon: Sun },
  { value: 'dark', label: 'Koyu', Icon: Moon },
  { value: 'system', label: 'Otomatik', Icon: Monitor },
];

/** Denetim Merkezi: görünüm (tema) ve okuma metni boyutu. */
function ControlCenter() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<ThemePreference>('system');
  const [scale, setScale] = useState(1);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const sliderLabelId = useId();

  useEffect(() => {
    const sync = () => {
      setTheme(getThemePreference());
      setScale(getReadingScale());
    };
    sync();
    window.addEventListener(APPEARANCE_CHANGED, sync);
    return () => window.removeEventListener(APPEARANCE_CHANGED, sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    rootRef.current?.querySelector<HTMLButtonElement>('.cc-segment button[aria-pressed="true"]')?.focus();
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="control-center-root" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="menubar__status"
        aria-label="Denetim Merkezi: görünüm ve okuma boyutu"
        title="Denetim Merkezi"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <SlidersHorizontal aria-hidden="true" />
      </button>
      {open && (
        <div id={panelId} className="control-center glass glass-edge" role="dialog" aria-label="Denetim Merkezi">
          <section className="cc-module" aria-label="Görünüm">
            <h3>Görünüm</h3>
            <div className="cc-segment">
              {THEMES.map(({ value, label, Icon }) => (
                <button key={value} type="button" aria-pressed={theme === value} onClick={() => setThemePreference(value)}>
                  <Icon aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </section>
          <section className="cc-module" aria-labelledby={sliderLabelId}>
            <h3 id={sliderLabelId}>Okuma metni boyutu</h3>
            <div className="cc-slider">
              <span aria-hidden="true">A</span>
              <input
                type="range"
                min={READING_SCALE_MIN}
                max={READING_SCALE_MAX}
                step={0.05}
                value={scale}
                aria-labelledby={sliderLabelId}
                aria-valuetext={`Yüzde ${Math.round(scale * 100)}`}
                onChange={(event) => setReadingScale(Number(event.target.value))}
              />
              <span aria-hidden="true">A</span>
            </div>
            <p className="cc-note">Yazılardaki ve notlardaki metni büyütür veya küçültür.</p>
          </section>
        </div>
      )}
    </div>
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
      {`${dayFormat.format(now)} ${dateFormat.format(now)}  ${timeFormat.format(now)}`}
    </time>
  );
}

export default function MenuBarStatus() {
  return (
    <div className="menubar__right">
      <button
        type="button"
        className="menubar__status"
        aria-label="Sitede ara"
        aria-haspopup="dialog"
        title="Spotlight"
        onClick={(event) => openSearch(event.currentTarget)}
      >
        <Search aria-hidden="true" />
      </button>
      <ControlCenter />
      <Clock />
    </div>
  );
}
