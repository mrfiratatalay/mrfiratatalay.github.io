import { X } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { OPEN_SEARCH } from '../../lib/window-manager/events.ts';
import SearchPanel from './SearchPanel.tsx';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Gerçek modal arama penceresi (WAI-ARIA modal dialog deseni):
 * odak içeri taşınır, Tab dolaşımı pencere içinde kalır, Escape kapatır ve
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

  const onBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) close();
  };

  return (
    <dialog
      ref={dialogRef}
      className="search-dialog"
      aria-labelledby="arama-penceresi-baslik"
      onClose={onClose}
      onKeyDown={onKeyDown}
      onClick={onBackdropClick}
    >
      <div className="search-dialog__head">
        <h2 id="arama-penceresi-baslik">Sitede ara</h2>
        <button type="button" className="icon-button" aria-label="Aramayı kapat" onClick={close}>
          <X aria-hidden="true" />
        </button>
      </div>
      <div className="search-dialog__body">{open && <SearchPanel autoFocus onNavigate={close} />}</div>
    </dialog>
  );
}
