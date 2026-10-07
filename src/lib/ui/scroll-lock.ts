/** Shared by overlays so closing one never unlocks a page behind another. */
let locks = 0;
let previousOverflow = '';

export function lockPageScroll(): () => void {
  const root = document.documentElement;
  if (locks === 0) previousOverflow = root.style.overflow;
  locks += 1;
  root.style.overflow = 'hidden';
  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks -= 1;
    if (locks === 0) root.style.overflow = previousOverflow;
  };
}
