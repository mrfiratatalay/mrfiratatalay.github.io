import { useEffect, useRef, useState } from 'react';
import { localePaths } from '../../lib/content/urls.ts';
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
import IOSAppIcon from '../mobile/IOSAppIcon.tsx';
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
  const focusedOrder = useRef(new Map<string, number>());
  const focusSequence = useRef(0);
  const parked = windows.filter((win) => win.minimized && !win.closed);

  useEffect(() => {
    const sync = (summary: WindowSummary[]) => {
      for (const win of summary) {
        if (win.active && !win.closed && !win.minimized) {
          focusedOrder.current.set(win.id, ++focusSequence.current);
        }
      }
      setWindows(summary);
    };
    sync(currentWindows());
    const onChange = (event: Event) => sync((event as CustomEvent<WindowSummary[]>).detail);
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
  }, [windows.length, parked.length]);

  const openWindows = windows.filter((win) => !win.closed);
  const activeWindow = openWindows.find((win) => win.active && !win.minimized);
  const windowForApp = (icon: IconName): WindowSummary | undefined => {
    const matching = openWindows.filter((win) => win.icon === icon);
    return matching.find((win) => win.active && !win.minimized) ?? matching.reduce<WindowSummary | undefined>(
      (preferred, win) => !preferred || (focusedOrder.current.get(win.id) ?? 0) >= (focusedOrder.current.get(preferred.id) ?? 0) ? win : preferred,
      undefined,
    );
  };
  const paths = localePaths(locale);
  const mobileItems: DockItem[] = [
    { id: 'home', label: locale === 'tr' ? 'Ana Sayfa' : 'Home', href: paths.home, icon: 'home' },
    { id: 'projects', label: t.sections.projects.short, href: paths.projects, icon: 'projects' },
    { id: 'blog', label: locale === 'tr' ? 'Yazılar' : 'Writing', href: paths.blog, icon: 'blog' },
    { id: 'contact', label: t.sections.contact.short, href: paths.contact, icon: 'contact' },
  ];
  const mobileCurrent = ['blog', 'notes', 'series', 'search'].includes(current) ? 'blog' : current;
  const mobileHome = current === 'home';
  const homeDockItems: DockItem[] = [
    { id: 'about', label: t.sections.about.short, href: paths.about, icon: 'about' },
    ...mobileItems.slice(1),
  ];

  return (
    <>
      <nav className="dock dock--desktop glass glass-edge" aria-label={t.dock.label}>
        <ul className="dock__list" ref={listRef}>
          {items.map((item) => (
            <li key={item.id} className={item.desktopOnly ? 'dock__item dock__item--desktop-only' : 'dock__item'}>
              <a
                className="dock__app"
                href={item.href}
                data-section-link=""
                data-dock-section={item.icon}
                data-open={openWindows.some((win) => win.icon === item.icon) ? '' : undefined}
                aria-current={activeWindow?.icon === item.icon ? 'location' : undefined}
                onClick={(event) => {
                  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  if (!window.matchMedia('(min-width: 900px)').matches) return;
                  const existing = windowForApp(item.icon);
                  if (!existing) return;
                  event.preventDefault();
                  sendWindowCommand({ id: existing.id, action: 'restore' });
                }}
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
              data-open={openWindows.some((win) => win.icon === 'search') ? '' : undefined}
              aria-current={activeWindow?.icon === 'search' ? 'location' : undefined}
              aria-haspopup="dialog"
              onClick={(event) => {
                const existing = window.matchMedia('(min-width: 900px)').matches ? windowForApp('search') : undefined;
                if (existing) sendWindowCommand({ id: existing.id, action: 'restore' });
                else openSearch(event.currentTarget);
              }}
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
      <nav
        className={`dock dock--mobile mobile-dock ${mobileHome ? 'mobile-dock--home' : 'mobile-dock--tabs'}`}
        aria-label={locale === 'tr' ? 'Ana gezinme' : 'Main navigation'}
      >
        <ul className="mobile-dock__list">
          {(mobileHome ? homeDockItems : mobileItems).map((item) => (
            <li className="mobile-dock__item" key={item.id}>
              <a
                className="mobile-dock__link"
                href={item.href}
                data-section-link=""
                data-active={item.id === mobileCurrent ? '' : undefined}
                aria-current={item.id === mobileCurrent ? (item.href === pathname ? 'page' : 'location') : undefined}
              >
                {mobileHome ? <IOSAppIcon name={item.icon} /> : <SectionIcon name={item.icon} />}
                <span className="mobile-dock__label">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
