import { ChevronLeft, Globe, Maximize2, Minimize2, Monitor, Moon, Search, SlidersHorizontal, Sun } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { deviceLocale, getLanguagePreference, goToLocale, setLanguagePreference } from '../../lib/i18n/client.ts';
import { languageHref, LANGUAGE_CODES, LANGUAGE_NAMES, LOCALE_TAGS, type Locale } from '../../lib/i18n/locales.ts';
import { useTranslations } from '../../lib/i18n/ui.ts';
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
import { lockPageScroll } from '../../lib/ui/scroll-lock.ts';
import { subscribeFullscreenState, toggleNativeFullscreen } from '../../lib/ui/fullscreen.ts';
import { showToast } from '../../lib/ui/enhancements.ts';
import { openSearch } from '../../lib/window-manager/events.ts';
import MobileAppMode from '../mobile/MobileAppMode.tsx';

interface Props {
  locale: Locale;
  otherLocale: Locale;
  /** Sayfanın diğer dildeki adresi; yoksa dil göstergesi gösterilmez. */
  alternatePath?: string | undefined;
}

type LanguageChoice = Locale | 'auto';

/** Denetim Merkezi: görünüm (tema), dil ve okuma metni boyutu. */
function ControlCenter({ locale }: { locale: Locale }) {
  const t = useTranslations(locale).menubar;
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<ThemePreference>('system');
  const [language, setLanguage] = useState<LanguageChoice>('auto');
  const [scale, setScale] = useState(1);
  const [mobile, setMobile] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const launcherRef = useRef<HTMLElement | null>(null);
  const returnFocusRef = useRef(false);
  const panelId = useId();
  const sliderLabelId = useId();
  const languageLabelId = useId();

  useEffect(() => {
    const screen = window.matchMedia('(max-width: 899.98px)');
    const sync = () => setMobile(screen.matches);
    const fromLauncher = (event: Event) => {
      const opener = (event as CustomEvent<{ opener?: HTMLElement }>).detail?.opener;
      launcherRef.current = opener ?? null;
      opener?.setAttribute('aria-controls', panelId);
      opener?.setAttribute('aria-expanded', 'true');
      setOpen(true);
    };
    sync();
    screen.addEventListener('change', sync);
    window.addEventListener('mobile:open-settings', fromLauncher);
    document.documentElement.setAttribute('data-ios-settings-ready', '');
    if (document.documentElement.hasAttribute('data-ios-settings-requested')) {
      document.documentElement.removeAttribute('data-ios-settings-requested');
      fromLauncher(new CustomEvent('mobile:open-settings', { detail: { opener: document.querySelector('[data-ios-settings], [data-ios-open-settings]') } }));
    }
    return () => {
      document.documentElement.removeAttribute('data-ios-settings-ready');
      screen.removeEventListener('change', sync);
      window.removeEventListener('mobile:open-settings', fromLauncher);
    };
  }, [panelId]);

  const close = () => {
    returnFocusRef.current = true;
    setOpen(false);
    launcherRef.current?.setAttribute('aria-expanded', 'false');
  };

  const themes = useMemo(
    () =>
      [
        { value: 'light', label: t.themeLight, Icon: Sun },
        { value: 'dark', label: t.themeDark, Icon: Moon },
        { value: 'system', label: t.themeAuto, Icon: Monitor },
      ] as const,
    [t],
  );
  const languages: Array<{ value: LanguageChoice; label: string }> = [
    { value: 'tr', label: LANGUAGE_NAMES.tr },
    { value: 'en', label: LANGUAGE_NAMES.en },
    { value: 'auto', label: t.languageAuto },
  ];

  useEffect(() => {
    const sync = () => {
      setTheme(getThemePreference());
      setScale(getReadingScale());
    };
    sync();
    setLanguage(getLanguagePreference() ?? 'auto');
    window.addEventListener(APPEARANCE_CHANGED, sync);
    return () => window.removeEventListener(APPEARANCE_CHANGED, sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node) && !panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
        launcherRef.current?.setAttribute('aria-expanded', 'false');
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || document.querySelector('dialog[open]')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      } else if (event.key === 'Tab' && mobile) {
        const targets = [...(panelRef.current?.querySelectorAll<HTMLElement>('button, input, a[href], summary') ?? [])].filter((element) => element.getClientRects().length > 0);
        const first = targets[0];
        const last = targets.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    const unlock = mobile ? lockPageScroll() : undefined;
    const background = mobile
      ? [...document.querySelectorAll<HTMLElement>('.workspace, .dock-bar, .menubar__left, .menubar__lang')].map((element) => ({ element, inert: element.inert }))
      : [];
    for (const { element } of background) element.inert = true;
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    const initial = mobile ? '.cc-mobile-header button' : '.cc-segment button[aria-pressed="true"]';
    panelRef.current?.querySelector<HTMLButtonElement>(initial)?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
      for (const { element, inert } of background) element.inert = inert;
      unlock?.();
      if (returnFocusRef.current) {
        returnFocusRef.current = false;
        const opener = launcherRef.current ?? buttonRef.current;
        if (opener?.isConnected && opener.getClientRects().length) opener.focus({ preventScroll: true });
      }
    };
  }, [open, mobile]);

  const chooseLanguage = (choice: LanguageChoice) => {
    setLanguage(choice);
    const stored = setLanguagePreference(choice === 'auto' ? null : choice);
    goToLocale(choice === 'auto' ? deviceLocale() : choice, stored || choice === 'auto');
  };

  const panel = open ? (
        <div ref={panelRef} id={panelId} className="control-center glass glass-edge" role="dialog" aria-modal={mobile || undefined} aria-label={mobile ? (locale === 'tr' ? 'Ayarlar' : 'Settings') : t.controlCenter}>
          <header className="cc-mobile-header">
            <button type="button" onClick={close} aria-label={locale === 'tr' ? 'Geri dön' : 'Go back'}><ChevronLeft aria-hidden="true" /></button>
            <h2>{locale === 'tr' ? 'Ayarlar' : 'Settings'}</h2>
            <span aria-hidden="true" />
          </header>
          <section className="cc-module" aria-label={t.appearance}>
            <h3>{t.appearance}</h3>
            <div className="cc-segment">
              {themes.map(({ value, label, Icon }) => (
                <button key={value} type="button" aria-pressed={theme === value} onClick={() => setThemePreference(value)}>
                  <Icon aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </section>
          <section className="cc-module" aria-labelledby={languageLabelId}>
            <h3 id={languageLabelId}>{t.language}</h3>
            <div className="cc-segment cc-segment--text">
              {languages.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  lang={value === 'auto' ? undefined : value}
                  aria-pressed={language === value}
                  onClick={() => chooseLanguage(value)}
                >
                  {value === 'auto' ? <Globe aria-hidden="true" /> : <span className="cc-code">{LANGUAGE_CODES[value]}</span>}
                  {label}
                </button>
              ))}
            </div>
            <p className="cc-note">{t.languageNote}</p>
          </section>
          <section className="cc-module" aria-labelledby={sliderLabelId}>
            <h3 id={sliderLabelId}>{t.readingSize}</h3>
            <div className="cc-slider">
              <span aria-hidden="true">A</span>
              <input
                type="range"
                min={READING_SCALE_MIN}
                max={READING_SCALE_MAX}
                step={0.05}
                value={scale}
                aria-labelledby={sliderLabelId}
                aria-valuetext={t.readingSizeValue(Math.round(scale * 100))}
                onChange={(event) => setReadingScale(Number(event.target.value))}
              />
              <span aria-hidden="true">A</span>
            </div>
            <p className="cc-note">{t.readingSizeNote}</p>
          </section>
          <MobileAppMode locale={locale} />
        </div>
      ) : null;

  return (
    <div className="control-center-root" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="menubar__status"
        aria-label={t.controlCenterLabel}
        title={t.controlCenter}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => { launcherRef.current = null; setOpen((value) => !value); }}
      >
        <SlidersHorizontal aria-hidden="true" />
      </button>
      {mobile && panel ? createPortal(panel, document.body) : panel}
    </div>
  );
}

function FullscreenButton({ locale }: { locale: Locale }) {
  const [mode, setMode] = useState({ available: false, fullscreen: false });
  const [pending, setPending] = useState(false);
  useEffect(() => subscribeFullscreenState(({ available, fullscreen }) => setMode({ available, fullscreen })), []);
  if (!mode.available) return null;
  const label = locale === 'tr'
    ? (mode.fullscreen ? 'Tam ekrandan çık' : 'Tam ekran aç')
    : (mode.fullscreen ? 'Exit fullscreen' : 'Open fullscreen');
  return (
    <button type="button" className="menubar__status" aria-label={label} title={label} aria-pressed={mode.fullscreen} disabled={pending} onClick={async () => {
      setPending(true);
      try { await toggleNativeFullscreen(); }
      catch { showToast(locale === 'tr' ? 'Tarayıcı tam ekran isteğini kabul etmedi.' : 'The browser declined the fullscreen request.'); }
      finally { setPending(false); }
    }}>
      {mode.fullscreen ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
    </button>
  );
}

/** Saat dakikada bir güncellenir; sekme görünmüyorken zamanlayıcı durur. */
function Clock({ locale }: { locale: Locale }) {
  const [now, setNow] = useState<Date | null>(null);
  const formats = useMemo(() => {
    const tag = LOCALE_TAGS[locale];
    return {
      day: new Intl.DateTimeFormat(tag, { weekday: 'short' }),
      date: new Intl.DateTimeFormat(tag, locale === 'en' ? { month: 'short', day: 'numeric' } : { day: 'numeric', month: 'short' }),
      time: new Intl.DateTimeFormat(tag, { hour: '2-digit', minute: '2-digit' }),
    };
  }, [locale]);

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
      {`${formats.day.format(now)} ${formats.date.format(now)}  ${formats.time.format(now)}`}
    </time>
  );
}

export default function MenuBarStatus({ locale, otherLocale, alternatePath }: Props) {
  const t = useTranslations(locale).menubar;
  return (
    <div className="menubar__right">
      {alternatePath && (
        <a
          className="menubar__status menubar__lang"
          href={languageHref(alternatePath, otherLocale)}
          hrefLang={otherLocale}
          data-lang-switch={otherLocale}
          aria-label={t.switchLanguage}
          title={t.switchLanguage}
        >
          {LANGUAGE_CODES[locale]}
        </a>
      )}
      <button
        type="button"
        className="menubar__status"
        aria-label={t.search}
        aria-haspopup="dialog"
        title="Spotlight"
        onClick={(event) => openSearch(event.currentTarget)}
      >
        <Search aria-hidden="true" />
      </button>
      <FullscreenButton locale={locale} />
      <ControlCenter locale={locale} />
      <Clock locale={locale} />
    </div>
  );
}
