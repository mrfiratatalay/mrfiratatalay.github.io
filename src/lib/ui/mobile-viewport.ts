let initialized = false;

/** Keep the Dock out of the keyboard without treating browser bars as a keyboard. */
export function initMobileViewport(): void {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  const root = document.documentElement;
  const viewport = window.visualViewport;
  const mobile = window.matchMedia('(max-width: 899.98px)');
  let restingHeight = window.innerHeight;
  let frame = 0;

  const isEditing = () => {
    const active = document.activeElement;
    if (active instanceof HTMLTextAreaElement) return !active.readOnly && !active.disabled;
    if (active instanceof HTMLInputElement) {
      return !active.readOnly && !active.disabled
        && ['text', 'search', 'email', 'url', 'tel', 'password', 'number'].includes(active.type);
    }
    return active instanceof HTMLElement && active.isContentEditable;
  };

  const sync = () => {
    frame = 0;
    const editing = isEditing();
    if (!editing) restingHeight = window.innerHeight;
    const layoutHeight = Math.max(restingHeight, window.innerHeight);
    const keyboard = mobile.matches && editing && Boolean(viewport)
      && Math.abs((viewport?.scale ?? 1) - 1) < 0.05
      && layoutHeight - (viewport?.height ?? layoutHeight) > 160;
    root.toggleAttribute('data-mobile-keyboard', keyboard);
  };
  const schedule = () => {
    if (!frame) frame = window.requestAnimationFrame(sync);
  };

  document.addEventListener('focusin', schedule);
  document.addEventListener('focusout', schedule);
  viewport?.addEventListener('resize', schedule);
  window.addEventListener('resize', schedule);
  window.addEventListener('pageshow', schedule);
  mobile.addEventListener('change', schedule);
  window.addEventListener('orientationchange', () => {
    restingHeight = window.innerHeight;
    schedule();
  });
  sync();
}
