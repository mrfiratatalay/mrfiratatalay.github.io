import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { OPEN_SEARCH } from '../../lib/window-manager/events.ts';
import SearchPanel from './SearchPanel.tsx';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Spotlight: gerçek modal arama penceresi (WAI-ARIA modal dialog deseni).
 * Odak içeri taşınır, Tab dolaşımı pencere içinde kalır, Escape kapatır ve
 * kapanınca odak aramayı açan düğmeye döner.
 */
export default function SearchDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);

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

  const close = () => dialogRef.current?.close();

  const onClose = () => {
    setOpen(false);
    openerRef.current?.focus();
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
      aria-label="Spotlight araması"
      onClose={onClose}
      onKeyDown={onKeyDown}
      onClick={onBackdropClick}
    >
      {open && (
        <div className="spotlight__inner">
          <SearchPanel autoFocus onNavigate={close} onClose={close} />
        </div>
      )}
    </dialog>
  );
}
