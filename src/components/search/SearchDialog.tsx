import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import type { Locale } from '../../lib/i18n/locales.ts';
import { useTranslations } from '../../lib/i18n/ui.ts';
import { lockPageScroll } from '../../lib/ui/scroll-lock.ts';
import { OPEN_SEARCH, openSearch, sendWindowCommand } from '../../lib/window-manager/events.ts';
import SearchPanel from './SearchPanel.tsx';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

function isVisible(element: HTMLElement): boolean {
  return element.isConnected && !element.closest('[hidden], [inert]') && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden';
}

function visiblePageInput(): HTMLInputElement | undefined {
  const inputs = [...document.querySelectorAll<HTMLInputElement>('.search-page input[type="search"]')].filter(isVisible);
  return inputs.find((input) => input.closest('[data-window-id].is-active')) ?? inputs[0];
}

/**
 * Spotlight: gerçek modal arama penceresi (WAI-ARIA modal dialog deseni).
 * Odak içeri taşınır, Tab dolaşımı pencere içinde kalır, Escape kapatır ve
 * kapanınca odak aramayı açan düğmeye döner.
 */
export default function SearchDialog({ locale }: { locale: Locale }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);

  // Mobile keyboards resize the visual viewport, not always the CSS viewport.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const mobile = window.matchMedia('(max-width: 899.98px)');
    const viewport = window.visualViewport;
    let unlock: (() => void) | undefined;
    const update = () => {
      if (mobile.matches) {
        dialog.style.setProperty('--search-viewport-h', `${viewport?.height ?? window.innerHeight}px`);
        dialog.style.setProperty('--search-viewport-top', `${viewport?.offsetTop ?? 0}px`);
        unlock ??= lockPageScroll();
      } else {
        dialog.style.removeProperty('--search-viewport-h');
        dialog.style.removeProperty('--search-viewport-top');
        unlock?.();
        unlock = undefined;
      }
    };
    update();
    viewport?.addEventListener('resize', update);
    viewport?.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      viewport?.removeEventListener('resize', update);
      viewport?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      dialog.style.removeProperty('--search-viewport-h');
      dialog.style.removeProperty('--search-viewport-top');
      unlock?.();
    };
  }, [open]);

  useEffect(() => {
    const onOpen = (event: Event) => {
      const dialog = dialogRef.current;
      if (!dialog || dialog.open) return;
      const detail = (event as CustomEvent<{ opener: HTMLElement | null }>).detail;
      openerRef.current = detail?.opener ?? (document.activeElement as HTMLElement | null);
      dialog.showModal();
      setOpen(true);
    };
    window.addEventListener(OPEN_SEARCH, onOpen);
    return () => window.removeEventListener(OPEN_SEARCH, onOpen);
  }, []);

  // ⌘K / Ctrl+K Spotlight'ı açar ve kapatır; yazı alanı dışında "/" de açar.
  // Arama sayfasında ise yeni pencere açmak yerine sayfadaki arama alanına odaklanır.
  useEffect(() => {
    const onShortcut = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = !!target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      const commandK = (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'k';
      const slash = event.key === '/' && !typing && !event.metaKey && !event.ctrlKey && !event.altKey;
      if (!commandK && !slash) return;
      event.preventDefault();
      if (dialogRef.current?.open) {
        if (commandK) dialogRef.current.close();
        return;
      }
      const pageInput = visiblePageInput();
      if (pageInput) {
        const owner = pageInput.closest<HTMLElement>('[data-window-id]');
        if (owner?.dataset.windowId && !owner.classList.contains('is-active')) {
          sendWindowCommand({ id: owner.dataset.windowId, action: 'restore' });
        }
        pageInput.focus();
        pageInput.select();
        return;
      }
      openSearch(document.activeElement as HTMLElement | null);
    };
    window.addEventListener('keydown', onShortcut);
    return () => window.removeEventListener('keydown', onShortcut);
  }, []);

  const close = () => dialogRef.current?.close();

  const onClose = () => {
    setOpen(false);
    const opener = openerRef.current;
    if (opener && isVisible(opener)) opener.focus({ preventScroll: true });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== 'Tab' || !dialogRef.current) return;
    const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (element) => element.offsetParent !== null,
    );
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  // Arama alanı ve panel dışındaki boşluğa tıklamak kapatır.
  const onBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    const target = event.target as HTMLElement;
    if (target === dialogRef.current || target.classList.contains('spotlight__inner')) close();
  };

  return (
    <dialog
      ref={dialogRef}
      className="spotlight"
      aria-label={useTranslations(locale).search.dialog}
      onClose={onClose}
      onKeyDown={onKeyDown}
      onClick={onBackdropClick}
    >
      {open && (
        <div className="spotlight__inner">
          <SearchPanel locale={locale} autoFocus onNavigate={close} onClose={close} />
        </div>
      )}
    </dialog>
  );
}
