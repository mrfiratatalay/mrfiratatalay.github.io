import { useId, type CSSProperties, type ReactNode } from 'react';
import type { IconName } from '../../lib/site/sections.ts';

export type IOSIconName = IconName | 'cv' | 'settings' | 'java' | 'docker';

interface Props {
  name: IOSIconName;
  size?: number;
  className?: string;
}

const surfaces: Record<IOSIconName, [string, string]> = {
  home: ['#4bafff', '#0064e7'],
  about: ['#f5f5f7', '#dedfe3'],
  projects: ['#fff', '#f5f7fb'],
  blog: ['#fff', '#f4f7fa'],
  notes: ['#fff', '#f6f6f5'],
  series: ['#ffa92e', '#f27406'],
  contact: ['#54b4ff', '#0876ed'],
  search: ['#555861', '#2d3038'],
  cv: ['#fff', '#f5f3f2'],
  settings: ['#e9eaed', '#c1c3ca'],
  java: ['#fff9eb', '#f1dfbd'],
  docker: ['#2eb4ff', '#1474e5'],
};

/** Phone artwork has its own silhouette and composition, independent of the desktop icons. */
export default function IOSAppIcon({ name, size, className }: Props) {
  const id = `ios-${name}-${useId().replace(/:/g, '')}`;
  const paint = (key: string) => `url(#${id}-${key})`;
  const [top, bottom] = surfaces[name];
  const style = size ? ({ '--size': `${size}px` } as CSSProperties) : undefined;
  let artwork: ReactNode;

  switch (name) {
    case 'home':
      artwork = (
        <>
          <path d="m11 30 19-16a3 3 0 0 1 4 0l19 16a2.8 2.8 0 0 1-3.6 4.3L32 19.5 14.6 34.3A2.8 2.8 0 0 1 11 30Z" fill="#fff" />
          <path d="M17 32.6 32 20l15 12.6V48a3 3 0 0 1-3 3H20a3 3 0 0 1-3-3Z" fill="#fff" />
          <path d="M28 37h8v14h-8z" fill="#0878eb" />
          <path d="M42 17v8l-5-4v-4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1Z" fill="#fff" />
        </>
      );
      break;
    case 'about':
      artwork = (
        <>
          <path d="M56 15h8v9h-8z" fill="#f1bb42" />
          <path d="M56 27h8v9h-8z" fill="#64b882" />
          <path d="M56 39h8v9h-8z" fill="#6fa0de" />
          <path d="M8 0h2v64H8Z" fill="#c9cbd2" />
          <circle cx="32" cy="25" r="10" fill={paint('graphite')} />
          <path d="M15 50.5C15 40.6 21.3 35 32 35s17 5.6 17 15.5c-9.5 4.3-24.5 4.3-34 0Z" fill={paint('graphite')} />
        </>
      );
      break;
    case 'projects':
      artwork = (
        <>
          <path d="M10 20a4 4 0 0 1 4-4h11.5a4 4 0 0 1 2.8 1.2L32 21h18a4 4 0 0 1 4 4v23a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4Z" fill="#0085ec" />
          <rect x="14" y="23" width="36" height="23" rx="2" fill="#d7f1ff" />
          <rect x="16" y="26" width="32" height="22" rx="2" fill="#fff" />
          <path d="M9 29a3 3 0 0 1 3-3h40a3 3 0 0 1 3 3v19a4 4 0 0 1-4 4H13a4 4 0 0 1-4-4Z" fill={paint('folder')} />
          <path d="M12 27h40" stroke="#a9e5ff" strokeWidth=".8" strokeLinecap="round" />
        </>
      );
      break;
    case 'blog':
      artwork = (
        <>
          <circle cx="32" cy="32" r="24" fill={paint('compass')} />
          <circle cx="32" cy="32" r="21" stroke="#fff" strokeOpacity=".85" strokeWidth=".65" />
          {Array.from({ length: 24 }, (_, i) => <path key={i} d="M32 11.6v2.4" stroke="#fff" strokeWidth={i % 3 === 0 ? 1.1 : .65} strokeOpacity={i % 3 === 0 ? 1 : .68} transform={`rotate(${i * 15} 32 32)`} />)}
          <g transform="rotate(39 32 32)">
            <path d="M32 13 26 32h12Z" fill="#ff5e55" />
            <path d="M32 51 26 32h12Z" fill="#fff" />
            <path d="m32 13 6 19h-6Z" fill="#ef2d35" />
            <path d="m32 51 6-19h-6Z" fill="#e5edf7" />
          </g>
          <circle cx="32" cy="32" r="1.3" fill="#fff" />
        </>
      );
      break;
    case 'notes':
      artwork = (
        <>
          <path d="M0 0h64v20H0Z" fill={paint('yellow')} />
          <path d="M0 20h64" stroke="#c7a32b" strokeOpacity=".5" strokeWidth=".65" />
          <path d="M0 23h64" stroke="#e2e2df" strokeWidth=".65" strokeDasharray="1 1.2" />
          <path d="M0 32h64M0 42h64M0 52h64M0 62h64" stroke="#dadad8" strokeWidth=".75" />
        </>
      );
      break;
    case 'series':
      artwork = (
        <>
          <path d="M9 18c8-1.4 15-.3 22 4.1v29c-7.3-4.7-14.2-5.7-22-4.1Zm46 0c-8-1.4-15-.3-22 4.1v29c7.3-4.7 14.2-5.7 22-4.1Z" fill="#fff" />
          <path d="M31 22c-7-4.4-14-5.5-22-4.1v-2c8-1.4 15-.3 22 4.1m2 2c7-4.4 14-5.5 22-4.1v-2c-8-1.4-15-.3-22 4.1" fill="#ffe6ba" />
          <path d="M32 23v28" stroke="#ec7808" strokeWidth="1.2" />
          <path d="M13 26c4.9-.5 9.4.3 14 2.6m-14 3.4c4.9-.5 9.4.3 14 2.6m24-8.6c-4.9-.5-9.4.3-14 2.6m14 3.4c-4.9-.5-9.4.3-14 2.6" stroke="#edbf89" strokeWidth=".8" strokeLinecap="round" />
        </>
      );
      break;
    case 'contact':
      artwork = (
        <>
          <rect x="9" y="18" width="46" height="31" rx="3" fill="#fff" />
          <path d="m10.5 20 19.7 15.3c1.1.9 2.5.9 3.6 0L53.5 20" fill="none" stroke="#178bee" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="m10.5 47 15.9-13m27.1 13L37.6 34" fill="none" stroke="#178bee" strokeWidth="1.1" strokeLinecap="round" />
        </>
      );
      break;
    case 'search':
      artwork = (
        <>
          <circle cx="27.5" cy="27.5" r="14" stroke="#fff" strokeWidth="4.7" />
          <path d="m38 38 12.5 12.5" stroke="#fff" strokeWidth="5.7" strokeLinecap="round" />
        </>
      );
      break;
    case 'cv':
      artwork = (
        <>
          <path d="M18 9h21l10 10v34a3 3 0 0 1-3 3H18a3 3 0 0 1-3-3V12a3 3 0 0 1 3-3Z" fill="#fff" stroke="#d5d6da" strokeWidth="1" />
          <path d="M39 9v8a2 2 0 0 0 2 2h8" fill="#e5e7eb" />
          <path d="M23 26h18m-18 5h18" stroke="#b4b8c0" strokeWidth="1.4" strokeLinecap="round" />
          <rect x="10" y="37" width="44" height="15" rx="3" fill="#eb3c3b" />
          <path d="M19 48v-7h2.7a2.2 2.2 0 1 1 0 4.4H19m8.4 2.6v-7h2c2.2 0 3.3 1.1 3.3 3.5s-1.1 3.5-3.3 3.5Zm10.4 0v-7h4.7m-4.7 3.2h3.8" fill="none" stroke="#fff" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
      break;
    case 'settings':
      artwork = (
        <>
          <circle cx="32" cy="32" r="24" fill="#92959e" />
          <circle cx="32" cy="32" r="22" fill="#d9dbe0" />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d="M29.2 7.5h5.6v10.7h-5.6Z" fill="#727782" transform={`rotate(${i * 30} 32 32)`} />)}
          <circle cx="32" cy="32" r="17.5" fill="#727782" />
          <circle cx="32" cy="32" r="12.8" fill="#eceef2" />
          <circle cx="32" cy="32" r="9.7" fill="#747a84" />
          <circle cx="32" cy="32" r="6.5" fill="#dfe2e8" />
          <circle cx="32" cy="32" r="23.8" stroke="#f5f6f8" strokeWidth=".65" strokeOpacity=".9" />
        </>
      );
      break;
    case 'java':
      artwork = (
        <>
          <ellipse cx="30" cy="49" rx="21" ry="4" fill="#dcc098" />
          <path d="M43 29h4a7 7 0 0 1 0 14h-7" stroke="#a26132" strokeWidth="3.8" />
          <path d="M14 28h29v8c0 9-5.2 14-14.5 14S14 45 14 36Z" fill={paint('coffee')} />
          <ellipse cx="28.5" cy="28" rx="14.5" ry="3" fill="#774726" />
          <ellipse cx="28.5" cy="27.5" rx="11.8" ry="1.8" fill="#4e2b1a" />
          <path d="M24 22c-6-6 6-8 1-14m8 14c-6-6 6-8 1-14" stroke="#bf8c59" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M18 34v3c0 5 2.8 8 6.8 9" stroke="#f3bc78" strokeWidth="1.8" strokeLinecap="round" />
        </>
      );
      break;
    case 'docker':
      artwork = (
        <>
          <path d="M8 39h48c-1.5 9.6-10 16-25 16S10 49 8 39Z" fill="#dff4ff" />
          <path d="M8 39h48v3H8Z" fill="#fff" />
          <path d="M13 29h9v8h-9Zm11 0h9v8h-9Zm11 0h9v8h-9Zm-11-10h9v8h-9Zm11 0h9v8h-9Zm0-10h9v8h-9Z" fill="#fff" />
          <path d="M16 30v6m3-6v6m8-6v6m3-6v6m8-6v6m3-6v6M27 20v6m3-6v6m8-6v6m3-6v6m-3-16v6m3-6v6" stroke="#1385dc" strokeWidth=".7" />
          <path d="M10 48c6-2 10-1 15 1 8 2.7 17 2.7 29-3" fill="none" stroke="#97d6ff" strokeWidth="1.2" />
        </>
      );
      break;
  }

  return (
    <span className={`ios-app-icon ios-app-icon--${name}${className ? ` ${className}` : ''}`} style={style} aria-hidden="true">
      <svg viewBox="0 0 64 64" fill="none" focusable="false" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-surface`} x1="32" y1="0" x2="32" y2="64" gradientUnits="userSpaceOnUse"><stop stopColor={top} /><stop offset="1" stopColor={bottom} /></linearGradient>
          <linearGradient id={`${id}-graphite`} x1="32" y1="15" x2="32" y2="53" gradientUnits="userSpaceOnUse"><stop stopColor="#858994" /><stop offset="1" stopColor="#696e79" /></linearGradient>
          <linearGradient id={`${id}-folder`} x1="32" y1="26" x2="32" y2="52" gradientUnits="userSpaceOnUse"><stop stopColor="#55c7ff" /><stop offset="1" stopColor="#1095eb" /></linearGradient>
          <linearGradient id={`${id}-compass`} x1="32" y1="8" x2="32" y2="56" gradientUnits="userSpaceOnUse"><stop stopColor="#48c7fa" /><stop offset="1" stopColor="#0873e9" /></linearGradient>
          <linearGradient id={`${id}-yellow`} x1="32" y1="0" x2="32" y2="20" gradientUnits="userSpaceOnUse"><stop stopColor="#ffdd54" /><stop offset="1" stopColor="#ffd12f" /></linearGradient>
          <linearGradient id={`${id}-coffee`} x1="28" y1="28" x2="28" y2="50" gradientUnits="userSpaceOnUse"><stop stopColor="#c78c50" /><stop offset="1" stopColor="#9e6335" /></linearGradient>
        </defs>
        <rect width="64" height="64" fill={paint('surface')} />
        {artwork}
      </svg>
    </span>
  );
}
