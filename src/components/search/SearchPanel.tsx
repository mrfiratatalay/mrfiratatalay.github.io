import { Search } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { localePaths } from '../../lib/content/urls.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import { useTranslations } from '../../lib/i18n/ui.ts';
import { sectionsFor, type IconName } from '../../lib/site/sections.ts';
import AppIcon from '../icons/AppIcon.tsx';
import { search, type SearchHit } from './pagefind.ts';

type Status = 'idle' | 'loading' | 'ready' | 'error';

interface Props {
  locale: Locale;
  autoFocus?: boolean;
  /** Arama sayfasında sorgu adres çubuğundaki ?q= ile eşlenir. */
  syncUrl?: boolean;
  onNavigate?: () => void;
  onClose?: () => void;
}

const PAGE_SIZE = 9;
const TYPE_ICONS: Record<string, IconName> = { post: 'blog', note: 'notes', project: 'projects' };

/** Spotlight tarzı arama: alan, durum, gruplanmış sonuçlar ve öneriler. */
export default function SearchPanel({ locale, autoFocus = false, syncUrl = false, onNavigate, onClose }: Props) {
  const t = useTranslations(locale).search;
  const paths = localePaths(locale);
  const groupTitle = (type: string) => t.groups[type as keyof typeof t.groups] ?? t.groups.page;
  const inputId = useId();
  const statusId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [status, setStatus] = useState<Status>('idle');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [total, setTotal] = useState(0);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (syncUrl) {
      const initial = new URLSearchParams(window.location.search).get('q');
      if (initial) setQuery(initial);
    }
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus, syncUrl]);

  useEffect(() => {
    const term = query.trim();
    if (syncUrl) {
      const url = new URL(window.location.href);
      if (term) url.searchParams.set('q', term);
      else url.searchParams.delete('q');
      window.history.replaceState(null, '', url);
    }
    if (term.length < 2) {
      setStatus('idle');
      setHits([]);
      setTotal(0);
      return;
    }
    let cancelled = false;
    setStatus('loading');
    search(term, limit)
      .then((result) => {
        if (cancelled || !result) return;
        setHits(result.hits);
        setTotal(result.total);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [query, limit, attempt, syncUrl]);

  // Ok tuşlarıyla sonuçlar arasında gezinme (Enter bağlantıyı açar).
  const links = () => [...(panelRef.current?.querySelectorAll<HTMLAnchorElement>('.search-result a') ?? [])];
  const onInputKey = (event: KeyboardEvent<HTMLInputElement>) => {
    // Spotlight gibi: ilk Escape yazıyı temizler, ikincisi pencereyi kapatır.
    if (event.key === 'Escape') {
      event.preventDefault();
      if (query) setQuery('');
      else onClose?.();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      links()[0]?.focus();
    } else if (event.key === 'Enter') {
      const first = links()[0];
      if (first && query.trim().length >= 2) {
        event.preventDefault();
        first.click();
      }
    }
  };
  const onPanelKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const all = links();
    const index = all.indexOf(document.activeElement as HTMLAnchorElement);
    if (index === -1) return;
    event.preventDefault();
    if (event.key === 'ArrowDown') all[Math.min(all.length - 1, index + 1)]?.focus();
    else if (index === 0) inputRef.current?.focus();
    else all[index - 1]?.focus();
  };

  const term = query.trim();
  let message = t.idle;
  if (status === 'loading') message = t.loading;
  if (status === 'ready') message = total > 0 ? t.results(total) : t.noResults(term);
  if (status === 'error') message = t.error;

  const groups = new Map<string, SearchHit[]>();
  for (const hit of hits) groups.set(hit.type, [...(groups.get(hit.type) ?? []), hit]);

  return (
    <>
      <div className="spotlight__field glass glass-edge">
        <Search aria-hidden="true" />
        <label className="visually-hidden" htmlFor={inputId}>
          {t.inputLabel}
        </label>
        <input
          ref={inputRef}
          id={inputId}
          className="spotlight__input"
          type="search"
          value={query}
          placeholder={t.placeholder}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          aria-describedby={statusId}
          onKeyDown={onInputKey}
          onChange={(event) => {
            setLimit(PAGE_SIZE);
            setQuery(event.target.value);
          }}
        />
        {onClose && (
          <button type="button" className="spotlight__esc" onClick={onClose} aria-label={t.close}>
            <span className="spotlight__esc-desktop">esc</span>
            <span className="spotlight__esc-mobile">{locale === 'tr' ? 'Vazgeç' : 'Cancel'}</span>
          </button>
        )}
      </div>

      <div className="spotlight__panel glass glass-edge" ref={panelRef} onKeyDown={onPanelKey}>
        <p id={statusId} className="search-status" role="status" aria-live="polite">
          {message}
        </p>

        {status === 'idle' && (
          <section className="search-group" aria-label={t.suggestions}>
            <p className="search-group__title">{t.suggestions}</p>
            <ul className="search-results">
              {sectionsFor(locale).map((section) => (
                <li className="search-result" key={section.id}>
                  <a href={section.href} onClick={() => onNavigate?.()}>
                    <AppIcon name={section.icon} />
                    <span className="search-result__title">{section.label}</span>
                    <span className="search-result__excerpt search-result__route">{section.href}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {status === 'error' && (
          <div className="search-actions">
            <button type="button" className="button button--primary" onClick={() => setAttempt((value) => value + 1)}>
              {t.retry}
            </button>
            <a className="button" href={paths.blog}>
              {t.posts}
            </a>
            <a className="button" href={paths.notes}>
              {t.notes}
            </a>
          </div>
        )}

        {status !== 'error' &&
          [...groups].map(([type, items]) => (
            <section className="search-group" key={type} aria-label={groupTitle(type)}>
              <p className="search-group__title">{groupTitle(type)}</p>
              <ul className="search-results">
                {items.map((hit) => (
                  <li className="search-result" key={hit.url}>
                    <a href={hit.url} onClick={() => onNavigate?.()}>
                      <AppIcon name={TYPE_ICONS[hit.type] ?? 'search'} />
                      <span className="search-result__title">{hit.title}</span>
                      {/* Pagefind özeti metni kaçışlanmış olarak üretir; yalnızca <mark> ekler. */}
                      <span className="search-result__excerpt" dangerouslySetInnerHTML={{ __html: hit.excerpt }} />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}

        {status === 'ready' && total > hits.length && (
          <div className="search-more">
            <button type="button" className="button" onClick={() => setLimit((value) => value + PAGE_SIZE)}>
              {t.more}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
