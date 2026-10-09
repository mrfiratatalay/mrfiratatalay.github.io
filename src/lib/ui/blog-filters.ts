const initializers = new WeakMap<HTMLElement, () => void>();

/** Each Finder window keeps its own category selection and document address. */
export function initBlogFilters(root: ParentNode = document): void {
  const windows = root instanceof HTMLElement && root.matches('[data-window-id]')
    ? [root]
    : [...root.querySelectorAll<HTMLElement>('[data-window-id]')];

  for (const host of windows) {
    const list = host.querySelector<HTMLElement>('[data-post-list]');
    if (!list) continue;
    const existing = initializers.get(host);
    if (existing) {
      existing();
      continue;
    }

    const links = [...host.querySelectorAll<HTMLAnchorElement>('[data-category-filter]')];
    const items = [...list.querySelectorAll<HTMLElement>(':scope > [data-category]')];
    const empty = host.querySelector<HTMLElement>('[data-filter-empty]');
    const valid = new Set(links.map((link) => link.dataset.categoryFilter ?? ''));

    const apply = (requested: string) => {
      const category = valid.has(requested) ? requested : '';
      let visible = 0;
      for (const item of items) {
        const show = !category || item.dataset.category === category;
        item.hidden = !show;
        if (show) visible += 1;
      }
      if (empty) empty.hidden = visible > 0 || items.length === 0;
      for (const link of links) {
        const active = (link.dataset.categoryFilter ?? '') === category;
        if (link.closest('.filter-bar')) link.setAttribute('aria-pressed', String(active));
        else if (active) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      }
    };

    const fromAddress = () => {
      const url = new URL(host.dataset.windowUrl ?? window.location.href, window.location.href);
      apply(url.searchParams.get('kategori') ?? '');
    };

    for (const link of links) {
      link.addEventListener('click', (event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        const category = link.dataset.categoryFilter ?? '';
        const url = new URL(host.dataset.windowUrl ?? window.location.href, window.location.href);
        if (category) url.searchParams.set('kategori', category);
        else url.searchParams.delete('kategori');
        host.dataset.windowUrl = url.href;
        if (!window.matchMedia('(min-width: 900px)').matches || host.classList.contains('is-active')) {
          window.history.replaceState(window.history.state, '', url);
        }
        apply(category);
      });
    }

    initializers.set(host, fromAddress);
    host.addEventListener('desktop:location', fromAddress);
    fromAddress();
  }
}
