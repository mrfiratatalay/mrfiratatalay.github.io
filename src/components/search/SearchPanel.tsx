import { Search } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { paths } from '../../lib/content/urls.ts';
import { search, type SearchHit } from './pagefind.ts';

type Status = 'idle' | 'loading' | 'ready' | 'error';

interface Props {
  autoFocus?: boolean;
  /** Arama sayfasında sorgu adres çubuğundaki ?q= ile eşlenir. */
  syncUrl?: boolean;
  onNavigate?: () => void;
}

const PAGE_SIZE = 8;

export default function SearchPanel({ autoFocus = false, syncUrl = false, onNavigate }: Props) {
  const inputId = useId();
  const statusId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
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

  const term = query.trim();
  let message = 'Blog yazılarında ve öğrenme notlarında ara. En az 2 harf yaz.';
  if (status === 'loading') message = 'Aranıyor…';
  if (status === 'ready') {
    message = total > 0 ? `${total} sonuç bulundu.` : `"${term}" için sonuç bulunamadı. Başka bir kelime deneyebilirsin.`;
  }
  if (status === 'error') message = 'Arama şu anda yüklenemedi.';

  return (
    <div className="search-panel">
      <div className="search-field">
        <label className="visually-hidden" htmlFor={inputId}>
          Aranacak kelime
        </label>
        <Search aria-hidden="true" />
        <input
          ref={inputRef}
          id={inputId}
          className="search-input"
          type="search"
          value={query}
          placeholder="Örneğin: controller, docker, interface"
          autoComplete="off"
          spellCheck={false}
          aria-describedby={statusId}
          onChange={(event) => {
            setLimit(PAGE_SIZE);
            setQuery(event.target.value);
          }}
        />
      </div>
      <p id={statusId} className="search-status" role="status" aria-live="polite">
        {message}
      </p>
      {status === 'error' && (
        <div className="search-help">
          <button type="button" className="button" onClick={() => setAttempt((value) => value + 1)}>
            Tekrar dene
          </button>
          <a className="button" href={paths.blog}>
            Blog yazıları
          </a>
          <a className="button" href={paths.notes}>
            Öğrenme notları
          </a>
        </div>
      )}
      {hits.length > 0 && status !== 'error' && (
        <ul className="search-results">
          {hits.map((hit) => (
            <li className="search-result" key={hit.url}>
              <a href={hit.url} onClick={() => onNavigate?.()}>
                <span className="search-result__top">
                  <span className="badge">{hit.type}</span>
                  <span className="search-result__title">{hit.title}</span>
                </span>
                {/* Pagefind özeti metni kaçışlanmış olarak üretir; yalnızca <mark> ekler. */}
                <span className="search-result__excerpt" dangerouslySetInnerHTML={{ __html: hit.excerpt }} />
              </a>
            </li>
          ))}
        </ul>
      )}
      {status === 'ready' && total > hits.length && (
        <button type="button" className="button" onClick={() => setLimit((value) => value + PAGE_SIZE)}>
          Daha fazla sonuç göster
        </button>
      )}
    </div>
  );
}
