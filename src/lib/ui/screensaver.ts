import { WINDOWS_CHANGED } from '../window-manager/events.ts';
import { SCREENSAVER_CHANGED, SCREENSAVER_PREVIEW, getScreensaverEnabled } from './screensaver-preference.ts';

const DESKTOP_IDLE = 30_000;
const CONTENT_IDLE = 120_000;
const FADE_DURATION = 700;

/** Desktop-only, decorative idle view. It never changes window geometry/history. */
export function initScreensaver(): void {
  const overlay = document.querySelector<HTMLElement>('[data-screensaver-overlay]');
  const desktop = document.querySelector<HTMLElement>('.desktop');
  const dismiss = overlay?.querySelector<HTMLButtonElement>('[data-screensaver-dismiss]');
  if (!overlay || !desktop || !dismiss || overlay.dataset.initialized) return;
  overlay.dataset.initialized = 'true';

  const root = document.documentElement;
  const desktopScreen = matchMedia('(min-width: 900px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const paths = [...overlay.querySelectorAll<SVGPathElement>('[data-screensaver-route]')];
  const light = overlay.querySelector<SVGGElement>('[data-screensaver-light]');
  const pulses = [...overlay.querySelectorAll<SVGCircleElement>('[data-screensaver-pulse]')];
  let active = false;
  let lastActivity = performance.now();
  let idleTimer: ReturnType<typeof setTimeout> | undefined;
  let fadeTimer: ReturnType<typeof setTimeout> | undefined;
  let frame = 0;
  let desktopWasInert = false;
  let previousFocus: HTMLElement | null = null;
  let swallowClickUntil = 0;
  let swallowedKey: string | null = null;
  const pressedPointers = new Set<number>();

  // Cache geometry only when entering. There is no animation loop while browsing.
  function animate(): void {
    if (!light || reducedMotion.matches || paths.length !== 2) return;
    const lengths = paths.map((path) => path.getTotalLength());
    if (!lengths.every((length) => Number.isFinite(length) && length > 0)) return;
    const legs = [
      { route: 0, reverse: false, duration: 6_000, hold: 1_000, pulse: 0 },
      { route: 1, reverse: false, duration: 3_600, hold: 1_600, pulse: 1 },
      { route: 1, reverse: true, duration: 3_600, hold: 650, pulse: 0 },
      { route: 0, reverse: true, duration: 6_000, hold: 1_800, pulse: -1 },
    ];
    const cycle = legs.reduce((sum, leg) => sum + leg.duration + leg.hold, 0);
    let start: number | undefined;
    const tick = (time: number) => {
      if (!active || document.hidden || reducedMotion.matches || !Number.isFinite(time)) return;
      // The first RAF timestamp is the clock origin, avoiding negative segments.
      start ??= time;
      let elapsed = Math.max(0, time - start) % cycle;
      let leg = legs[legs.length - 1];
      for (const candidate of legs) {
        leg = candidate;
        if (elapsed < candidate.duration + candidate.hold) break;
        elapsed -= candidate.duration + candidate.hold;
      }
      const path = paths[leg.route];
      const length = lengths[leg.route];
      if (!path || !Number.isFinite(length)) return;
      const progress = Math.max(0, Math.min(1, elapsed / leg.duration));
      const point = path.getPointAtLength((leg.reverse ? 1 - progress : progress) * length);
      light!.setAttribute('transform', `translate(${point.x} ${point.y})`);
      // Fade at the outer edge; linger and softly pulse at service/data junctions.
      const entry = leg.route === 0 && !leg.reverse ? Math.min(1, elapsed / 600) : 1;
      const exit = leg.route === 0 && leg.reverse ? Math.max(0, Math.min(1, (leg.duration - elapsed) / 600)) : 1;
      light!.setAttribute('opacity', String(entry * exit * 0.9));
      const holdProgress = Math.max(0, Math.min(1, (elapsed - leg.duration) / leg.hold));
      pulses.forEach((pulse, index) => {
        const opacity = index === leg.pulse && elapsed >= leg.duration ? Math.sin(holdProgress * Math.PI) * 0.5 : 0;
        pulse.setAttribute('r', String(5 + holdProgress * 15));
        pulse.setAttribute('opacity', String(opacity));
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  }

  function stopAnimation(): void {
    cancelAnimationFrame(frame);
    frame = 0;
    light?.setAttribute('opacity', '0');
    for (const pulse of pulses) pulse.setAttribute('opacity', '0');
  }

  function blocked(): boolean {
    const focused = document.activeElement;
    return document.hidden || !document.hasFocus() || pressedPointers.size > 0
      || root.hasAttribute('data-window-loading')
      || !!document.querySelector('dialog[open], .control-center, .ios-page-menu[open], .desktop-window-menu[open], .window.is-active[data-reading]')
      || (focused instanceof Element && focused.matches('input, textarea, select, [contenteditable]:not([contenteditable="false"])'))
      || !!window.getSelection()?.toString().trim()
      || [...document.querySelectorAll<HTMLMediaElement>('video, audio')].some((media) => !media.paused && !media.ended);
  }

  function idleDelay(): number {
    // Allow time to read portfolio/content windows; the launcher rests after 30s.
    return document.querySelector('.window--main.is-active:not([hidden])') ? CONTENT_IDLE : DESKTOP_IDLE;
  }

  function scheduleIdle(): void {
    if (idleTimer !== undefined || active || !desktopScreen.matches || !getScreensaverEnabled() || reducedMotion.matches) return;
    idleTimer = setTimeout(() => {
      idleTimer = undefined;
      const remaining = idleDelay() - (performance.now() - lastActivity);
      if (remaining > 0) { scheduleIdle(); return; }
      if (blocked()) { lastActivity = performance.now(); scheduleIdle(); return; }
      enter();
    }, Math.max(250, idleDelay() - (performance.now() - lastActivity)));
  }

  function enter(preview = false): void {
    if (active || !desktopScreen.matches || document.hidden || (!preview && (!getScreensaverEnabled() || blocked()))) return;
    clearTimeout(idleTimer);
    idleTimer = undefined;
    clearTimeout(fadeTimer);
    fadeTimer = undefined;
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    desktopWasInert = desktop!.inert;
    desktop!.inert = true;
    overlay!.style.removeProperty('pointer-events');
    overlay!.hidden = false;
    // Resolve the initial opacity before switching so the entrance can fade.
    overlay!.getBoundingClientRect();
    active = true;
    root.setAttribute('data-screensaver', '');
    dismiss!.focus({ preventScroll: true });
    animate();
  }

  function leave(restoreFocus = true): void {
    if (!active) return;
    active = false;
    root.removeAttribute('data-screensaver');
    stopAnimation();
    desktop!.inert = desktopWasInert;
    // The fading overlay must not intercept the next deliberate interaction.
    overlay!.style.pointerEvents = 'none';
    fadeTimer = setTimeout(() => {
      overlay!.hidden = true;
      overlay!.style.removeProperty('pointer-events');
      fadeTimer = undefined;
    }, reducedMotion.matches ? 0 : FADE_DURATION);
    const focus = previousFocus;
    previousFocus = null;
    if (restoreFocus && focus?.isConnected && !focus.closest('[inert]')) focus.focus({ preventScroll: true });
    lastActivity = performance.now();
    scheduleIdle();
  }

  function activity(event: Event): void {
    if (event.type === 'focusin' && overlay!.contains(event.target as Node)) return;
    if (!active && event instanceof KeyboardEvent && event.key === swallowedKey) {
      event.preventDefault();
      event.stopImmediatePropagation();
      swallowClickUntil = performance.now() + 600;
      lastActivity = performance.now();
      scheduleIdle();
      return;
    }
    if (active) {
      if (event.type === 'pointerdown' || event.type === 'keydown' || event.type === 'wheel') {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (event.type === 'pointerdown' || event.type === 'keydown') swallowClickUntil = performance.now() + 600;
        if (event instanceof KeyboardEvent) swallowedKey = event.key;
      }
      leave();
    } else if (event.type === 'pointerdown') {
      // A second deliberate click starts a new gesture and works normally.
      swallowClickUntil = 0;
      pressedPointers.add((event as PointerEvent).pointerId);
    }
    lastActivity = performance.now();
    scheduleIdle();
  }

  function swallowWakeClick(event: Event): void {
    if (performance.now() >= swallowClickUntil) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.type === 'click') swallowClickUntil = 0;
  }

  const reset = () => {
    clearTimeout(idleTimer);
    idleTimer = undefined;
    leave();
    lastActivity = performance.now();
    scheduleIdle();
  };
  for (const type of ['pointerdown', 'pointermove', 'keydown', 'focusin', 'scroll']) {
    document.addEventListener(type, activity, { capture: true });
  }
  document.addEventListener('wheel', activity, { capture: true, passive: false });
  for (const type of ['pointerup', 'click']) document.addEventListener(type, swallowWakeClick, { capture: true });
  for (const type of ['pointerup', 'pointercancel']) document.addEventListener(type, (event) => {
    pressedPointers.delete((event as PointerEvent).pointerId);
    lastActivity = performance.now();
  }, { capture: true });
  document.addEventListener('keyup', (event) => {
    if (event.key !== swallowedKey) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    swallowedKey = null;
  }, { capture: true });
  dismiss.addEventListener('click', () => leave());
  desktopScreen.addEventListener('change', reset);
  reducedMotion.addEventListener('change', reset);
  window.addEventListener(SCREENSAVER_CHANGED, reset);
  window.addEventListener(SCREENSAVER_PREVIEW, () => enter(true));
  window.addEventListener(WINDOWS_CHANGED, () => { lastActivity = performance.now(); scheduleIdle(); });
  window.addEventListener('blur', () => {
    swallowedKey = null;
    swallowClickUntil = 0;
    pressedPointers.clear();
    leave(false);
  });
  window.addEventListener('focus', reset);
  document.addEventListener('visibilitychange', reset);
  window.addEventListener('pagehide', () => {
    swallowedKey = null;
    swallowClickUntil = 0;
    pressedPointers.clear();
    leave(false);
    clearTimeout(idleTimer);
    idleTimer = undefined;
  });
  window.addEventListener('pageshow', reset);
  scheduleIdle();
}
