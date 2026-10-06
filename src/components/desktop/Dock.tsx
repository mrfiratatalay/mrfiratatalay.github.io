import { useEffect, useState } from 'react';
import type { IconName, SectionId } from '../../lib/site/sections.ts';
import {
  currentWindows,
  openSearch,
  sendWindowCommand,
  WINDOWS_CHANGED,
  type WindowSummary,
} from '../../lib/window-manager/events.ts';
import SectionIcon from '../icons/SectionIcon.tsx';

export interface DockItem {
  id: SectionId;
  label: string;
  href: string;
  icon: IconName;
  desktopOnly?: boolean;
}

interface Props {
  items: DockItem[];
  current: SectionId;
  pathname: string;
}

/**
 * Dock: bölümlere gerçek bağlantılar verir. Küçültülen veya kapatılan
 * pencereler sağ tarafta görünür ve tıklanınca geri açılır.
 */
export default function Dock({ items, current, pathname }: Props) {
  const [windows, setWindows] = useState<WindowSummary[]>([]);

  useEffect(() => {
    setWindows(currentWindows());
    const onChange = (event: Event) => setWindows((event as CustomEvent<WindowSummary[]>).detail);
    window.addEventListener(WINDOWS_CHANGED, onChange);
    return () => window.removeEventListener(WINDOWS_CHANGED, onChange);
  }, []);

  const parked = windows.filter((win) => win.minimized || win.closed);

  return (
    <nav className="dock" aria-label="Dock">
      <ul className="dock__list">
        {items.map((item) => (
          <li key={item.id} className={item.desktopOnly ? 'dock__item dock__item--desktop-only' : 'dock__item'}>
            <a
              className="dock__link"
              href={item.href}
              data-section-link=""
              data-dock-section={item.icon}
              data-open={item.id === current ? '' : undefined}
              aria-current={item.href === pathname ? 'page' : undefined}
            >
              <span className="dock__icon" data-tile={item.icon}>
                <SectionIcon name={item.icon} />
              </span>
              <span className="dock__label">{item.label}</span>
              <span className="dock__indicator" aria-hidden="true" />
            </a>
          </li>
        ))}
        <li className="dock__item dock__item--desktop-only">
          <button
            type="button"
            className="dock__link"
            data-dock-section="search"
            aria-haspopup="dialog"
            onClick={(event) => openSearch(event.currentTarget)}
          >
            <span className="dock__icon" data-tile="search">
              <SectionIcon name="search" />
            </span>
            <span className="dock__label">Ara</span>
            <span className="dock__indicator" aria-hidden="true" />
          </button>
        </li>
      </ul>
      {parked.length > 0 && (
        <>
          <span className="dock__separator" aria-hidden="true" />
          <ul className="dock__list" aria-label="Küçültülen pencereler">
            {parked.map((win) => (
              <li key={win.id} className="dock__item dock__item--window">
                <button
                  type="button"
                  className="dock__link"
                  data-restore-window={win.id}
                  aria-label={`${win.title} penceresini geri aç`}
                  onClick={() => sendWindowCommand({ id: win.id, action: 'restore' })}
                >
                  <span className="dock__icon">
                    <SectionIcon name={win.icon as IconName} />
                  </span>
                  <span className="dock__label">{win.title}</span>
                  <span className="dock__indicator" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </nav>
  );
}
