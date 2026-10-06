import { useEffect, useRef, useState } from 'react';
import type { Locale } from '../../lib/i18n/locales.ts';
import { useTranslations } from '../../lib/i18n/ui.ts';
import type { IconName, SectionId } from '../../lib/site/sections.ts';
import {
  currentWindows,
  openSearch,
  sendWindowCommand,
  WINDOWS_CHANGED,
  type WindowSummary,
} from '../../lib/window-manager/events.ts';
import AppIcon from '../icons/AppIcon.tsx';
import SectionIcon from '../icons/SectionIcon.tsx';

export interface DockItem {
  id: SectionId;
  label: string;
  href: string;
  icon: IconName;
  desktopOnly?: boolean;
}

interface Props {
  locale: Locale;
  items: DockItem[];
  current: SectionId;
  pathname: string;
}

const MAGNIFY = 0.38;
const RADIUS = 145;

/**
 * Dock: bölümlere gerçek bağlantılar verir. Masaüstünde imleç yaklaştıkça
 * ikonlar büyür; küçültülen pencereler sağ tarafta minyatür olarak görünür.
 * Telefonda yüzen bir sekme çubuğuna dönüşür.
 */
export default function Dock({ locale, items, current, pathname }: Props) {
  const t = useTranslations(locale);
  const [windows, setWindows] = useState<WindowSummary[]>([]);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setWindows(currentWindows());
    const onChange = (event: Event) => setWindows((event as CustomEvent<WindowSummary[]>).detail);
    window.addEventListener(WINDOWS_CHANGED, onChange);
    return () => window.removeEventListener(WINDOWS_CHANGED, onChange);
  }, []);

  // Büyütme efekti: ikonların büyümemiş merkezleri ölçülür, imlece uzaklığa göre büyütülür.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = window.matchMedia('(min-width: 900px) and (hover: hover) and (pointer: fine)');
    let centers: number[] = [];
    let frame = 0;
    const items = () => [...list.querySelectorAll<HTMLElement>('.dock__item')];
    const reset = () => {
      cancelAnimationFrame(frame);
      for (const item of items()) item.style.setProperty('--m', '1');
    };
    const measure = () => {
      centers = items().map((item) => {
        const box = item.getBoundingClientRect();
        return box.left + box.width / 2;
      });
    };
    const onEnter = () => {
      if (!pointer.matches || reduced.matches) return;
      measure();
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !pointer.matches || reduced.matches) return;
      if (centers.length === 0) measure();
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        items().forEach((item, index) => {
          const distance = Math.abs(event.clientX - (centers[index] ?? 0));
          const strength = Math.max(0, 1 - distance / RADIUS);
          item.style.setProperty('--m', (1 + MAGNIFY * strength * strength).toFixed(3));
        });
      });
    };
    const onLeave = () => {
      reset();
      centers = [];
    };
    list.addEventListener('pointerenter', onEnter);
    list.addEventListener('pointermove', onMove);
    list.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', onLeave);
    return () => {
      list.removeEventListener('pointerenter', onEnter);
      list.removeEventListener('pointermove', onMove);
      list.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', onLeave);
      cancelAnimationFrame(frame);
    };
  }, [windows.length]);

  const parked = windows.filter((win) => win.minimized || win.closed);

  return (
    <nav className="dock glass glass-edge" aria-label={t.dock.label}>
      <ul className="dock__list" ref={listRef}>
        {items.map((item) => (
          <li key={item.id} className={item.desktopOnly ? 'dock__item dock__item--desktop-only' : 'dock__item'}>
            <a
              className="dock__app"
              href={item.href}
              data-section-link=""
              data-dock-section={item.icon}
              data-open={item.id === current ? '' : undefined}
              aria-current={item.href === pathname ? 'page' : undefined}
            >
              <AppIcon name={item.icon} />
              <span className="dock__label">{item.label}</span>
              <span className="dock__dot" aria-hidden="true" />
            </a>
          </li>
        ))}
        <li className="dock__divider dock__item--desktop-only" aria-hidden="true" />
        <li className="dock__item dock__item--desktop-only">
          <button
            type="button"
            className="dock__app"
            data-dock-section="search"
            aria-haspopup="dialog"
            onClick={(event) => openSearch(event.currentTarget)}
          >
            <AppIcon name="search" />
            <span className="dock__label">{t.sections.search.label}</span>
            <span className="dock__dot" aria-hidden="true" />
          </button>
        </li>
        {parked.map((win) => (
          <li key={win.id} className="dock__item dock__item--window">
            <button
              type="button"
              className="dock__app"
              data-restore-window={win.id}
              aria-label={t.dock.restore(win.title)}
              onClick={() => sendWindowCommand({ id: win.id, action: 'restore' })}
            >
              <span className="dock__window-thumb" aria-hidden="true">
                <SectionIcon name={win.icon as IconName} />
              </span>
              <span className="dock__label" aria-hidden="true">
                {win.title}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
