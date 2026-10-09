import { followLanguageLink } from '../i18n/client.ts';
import { openSearch } from '../window-manager/events.ts';
import { toggleTheme } from './appearance.ts';
import { copyPageLink } from './enhancements.ts';
import { openSettings } from './settings-events.ts';

const initializedMenus = new WeakSet<HTMLDetailsElement>();
let installed = false;
let pressedMenu: HTMLDetailsElement | null = null;
let releaseTimer = 0;

function openMenus(): NodeListOf<HTMLDetailsElement> {
  return document.querySelectorAll<HTMLDetailsElement>('.ios-page-menu[open]');
}

function installDismissal(): void {
  if (installed) return;
  installed = true;
  document.addEventListener('pointerdown', (event) => {
    window.clearTimeout(releaseTimer);
    pressedMenu = (event.target as Element | null)?.closest<HTMLDetailsElement>('.ios-page-menu') ?? null;
    for (const menu of openMenus()) {
      if (menu !== pressedMenu) menu.open = false;
    }
  }, { capture: true });
  document.addEventListener('pointerup', () => {
    const menu = pressedMenu;
    releaseTimer = window.setTimeout(() => {
      if (pressedMenu === menu) pressedMenu = null;
    }, 350);
  }, { capture: true });
  document.addEventListener('pointercancel', () => { pressedMenu = null; }, { capture: true });
  document.addEventListener('click', () => {
    // Keep touch focus changes from dismissing a menu before its click arrives.
    queueMicrotask(() => { pressedMenu = null; });
  }, { capture: true });
  document.addEventListener('keydown', (event) => {
    pressedMenu = null;
    if (event.key !== 'Escape' || event.isComposing) return;
    for (const menu of openMenus()) {
      menu.open = false;
      menu.querySelector<HTMLElement>('summary')?.focus({ preventScroll: true });
      event.preventDefault();
    }
  });
}

/** Bind actions to their native controls, including windows added after loading. */
export function initPageMenus(root: ParentNode = document): void {
  installDismissal();
  for (const menu of root.querySelectorAll<HTMLDetailsElement>('.ios-page-menu')) {
    if (initializedMenus.has(menu)) continue;
    initializedMenus.add(menu);
    menu.addEventListener('toggle', () => {
      if (!menu.open) return;
      for (const other of openMenus()) if (other !== menu) other.open = false;
    });
    menu.addEventListener('focusout', (event) => {
      if (pressedMenu === menu || !event.relatedTarget || menu.contains(event.relatedTarget as Node)) return;
      menu.open = false;
    });
    for (const action of menu.querySelectorAll<HTMLElement>('.ios-page-menu__action')) {
      action.addEventListener('click', (event) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const trigger = menu.querySelector<HTMLElement>('summary');
        const overlay = action.hasAttribute('data-ios-open-search') || action.hasAttribute('data-ios-open-settings');
        event.preventDefault();
        event.stopPropagation();
        // Invoke while the control is still visible and the user gesture is active.
        if (action instanceof HTMLAnchorElement && action.hasAttribute('data-lang-switch')) followLanguageLink(action);
        else if (action.dataset.action === 'theme-toggle') toggleTheme();
        else if (action.hasAttribute('data-ios-open-search')) openSearch(trigger ?? action);
        else if (action.hasAttribute('data-ios-open-settings')) openSettings(trigger ?? action);
        else if (action.hasAttribute('data-copy-link')) void copyPageLink(action);
        menu.open = false;
        if (event.detail === 0 && !overlay && !(action instanceof HTMLAnchorElement)) trigger?.focus({ preventScroll: true });
      });
    }
  }
}
