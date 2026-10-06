import { useId, type CSSProperties, type ReactNode } from 'react';
import type { IconName } from '../../lib/site/sections.ts';
import SectionIcon from './SectionIcon.tsx';

interface Props {
  name: IconName | 'monogram';
  /** Piksel cinsinden boyut; verilmezse CSS'teki boyut kullanılır. */
  size?: number;
  /** Monogram ikonunda yazılacak harfler. */
  text?: string;
  className?: string;
}

/** Özgün masaüstü nesne ikonları; anlamlarını yanlarındaki bölüm adları taşır. */
export default function AppIcon({ name, size, text = 'FA', className }: Props) {
  const style = size ? ({ '--size': `${size}px` } as CSSProperties) : undefined;
  const id = `app-${name}-${useId()}`;
  return (
    <span className={`app-icon app-icon--${name}${className ? ` ${className}` : ''}`} style={style} aria-hidden="true">
      {name === 'monogram' ? <span>{text}</span> : (
        <>
          <IconArtwork name={name} id={id} />
          <span className="app-icon__flat"><SectionIcon name={name} /></span>
        </>
      )}
    </span>
  );
}

function IconArtwork({ name, id }: { name: IconName; id: string }) {
  const paint = (gradient: string) => `url(#${id}-${gradient})`;
  const palettes: Record<IconName, [string, string]> = {
    home: ['#f8fcff', '#dceaf7'],
    about: ['#fbfaf6', '#e6e3dc'],
    projects: ['#faf4e9', '#e8dcc9'],
    blog: ['#fafbfc', '#dce3e9'],
    notes: ['#fffef9', '#f3efdc'],
    series: ['#eef5ef', '#d8e6dc'],
    contact: ['#61b5f4', '#087cda'],
    search: ['#f1f3f6', '#bdc4cd'],
  };
  const [top, bottom] = palettes[name];
  let artwork: ReactNode = null;

  switch (name) {
    case 'home':
      artwork = (
        <>
          <path d="M15 1h17v62H15C7.3 63 1 56.7 1 49V15C1 7.3 7.3 1 15 1Z" fill={paint('blue')} />
          <path d="M35 1c-1.1 11.6-5.4 16.1-8.1 29H36l-2 19" fill="none" stroke="#2474a9" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19 20v7M45 20v7" stroke="#1d5279" strokeWidth="2.1" strokeLinecap="round" />
          <path d="M15 38c7.4 7.5 26 8.4 34-.7" fill="none" stroke="#1d5279" strokeWidth="1.9" strokeLinecap="round" />
        </>
      );
      break;
    case 'about':
      artwork = (
        <>
          <rect x="12" y="7" width="43" height="51" rx="5" fill="#8a6b44" opacity=".19" />
          <rect x="10" y="6" width="43" height="50" rx="5" fill={paint('paper')} stroke="#b9b4aa" strokeWidth=".7" />
          <path d="M15 6h-1a4 4 0 0 0-4 4v42a4 4 0 0 0 4 4h1Z" fill={paint('leather')} />
          <path d="M51 15h5v7h-5m0 4h5v7h-5m0 4h5v7h-5" fill="#bdad94" />
          <circle cx="33" cy="25" r="7" fill={paint('blue')} />
          <path d="M21 43c.7-7.2 4.8-11 12-11s11.3 3.8 12 11" fill={paint('blue')} />
          <path d="M23 49h20" stroke="#c1c5c9" strokeWidth="1.5" strokeLinecap="round" />
        </>
      );
      break;
    case 'projects':
      artwork = (
        <>
          <path d="M22 22v-5c0-3 2-5 5-5h10c3 0 5 2 5 5v5" fill="none" stroke="#6e4b2c" strokeWidth="4" />
          <path d="M24 21v-4c0-1.5 1-2.5 2.5-2.5h11c1.5 0 2.5 1 2.5 2.5V21" fill="none" stroke="#d4ac75" strokeWidth="1.1" />
          <rect x="7" y="22" width="50" height="31" rx="6" fill="#342515" opacity=".18" />
          <rect x="7" y="20" width="50" height="31" rx="5" fill={paint('leather')} stroke="#825a35" strokeWidth=".7" />
          <path d="M8 27c9 7.2 39 7.2 48 0" fill="none" stroke="#7a512d" strokeWidth="1" />
          <path d="M10 39v7c0 1.2.8 2 2 2h40c1.2 0 2-.8 2-2v-7" fill="none" stroke="#e8c392" strokeWidth=".7" strokeDasharray="1.3 1.8" opacity=".65" />
          <rect x="27" y="28" width="10" height="9" rx="1.7" fill={paint('metal')} stroke="#827c64" strokeWidth=".6" />
          <path d="M30 31h4v3h-4z" fill="#75634d" />
        </>
      );
      break;
    case 'blog':
      artwork = (
        <>
          <path d="m14 12 40 2-2 43-40-2Z" fill="#82919e" opacity=".23" />
          <rect x="10" y="8" width="42" height="47" rx="3" fill={paint('paper')} stroke="#b3bdc5" strokeWidth=".6" />
          <path d="M16 15h30" stroke="#435566" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M16 20h30" stroke="#d3d9dd" strokeWidth=".7" />
          <rect x="16" y="25" width="14" height="12" rx="1" fill={paint('blue')} />
          <path d="m18 34 4-4 3 3 3-5" fill="none" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
          <path d="M35 26h11m-11 5h11m-11 5h11M16 42h30M16 47h30" stroke="#909da7" strokeWidth="1.35" strokeLinecap="round" />
        </>
      );
      break;
    case 'notes':
      artwork = (
        <>
          <path d="M1 15C1 7.3 7.3 1 15 1h34c7.7 0 14 6.3 14 14v5H1Z" fill={paint('yellow')} />
          <path d="M1 20h62" stroke="#c6a940" strokeWidth=".75" />
          <path d="M9 30h46M9 38h46M9 46h46M9 54h46" stroke="#c5c1b3" strokeWidth=".75" />
          <path d="M18 22v40" stroke="#d6aca5" strokeWidth=".65" />
          <path d="m35 43 12-16 4 3-12 16-5 3Z" fill="#b89143" opacity=".16" />
          <path d="m33 42 13-17 4 3-13 17-5 3Z" fill="#5f666f" />
          <path d="m46 25 3-4c.5-.7 1.3-.7 2-.2l2 1.6c.6.5.7 1.3.2 2l-3 3.6Z" fill={paint('metal')} />
          <path d="m32 48 1-6 4 3Z" fill="#d0a97b" />
          <path d="m32 48 .5-2.2 1.6 1.2Z" fill="#333b42" />
        </>
      );
      break;
    case 'series':
      artwork = (
        <>
          <path d="M10 53h44" stroke="#9ca89e" strokeWidth="1.2" strokeLinecap="round" />
          <rect x="11" y="14" width="12" height="37" rx="2" fill={paint('green')} stroke="#548269" strokeWidth=".6" />
          <path d="M14 19h6m-6 4h6m-6 23h6" stroke="#d9eade" strokeWidth="1" />
          <rect x="25" y="10" width="12" height="41" rx="2" fill={paint('leather')} stroke="#886a4c" strokeWidth=".6" />
          <path d="M28 15h6m-6 4h6m-6 27h6" stroke="#f1dfc7" strokeWidth="1" />
          <g transform="rotate(-9 46 49)">
            <rect x="40" y="16" width="12" height="35" rx="2" fill={paint('blue')} stroke="#3c7a99" strokeWidth=".6" />
            <path d="M43 21h6m-6 4h6m-6 21h6" stroke="#d5effb" strokeWidth="1" />
          </g>
        </>
      );
      break;
    case 'contact':
      artwork = (
        <>
          <rect x="8" y="18" width="48" height="33" rx="4" fill="#005795" opacity=".2" />
          <rect x="8" y="16" width="48" height="33" rx="4" fill={paint('paper')} stroke="#d4e6f3" strokeWidth=".6" />
          <path d="m10 47 18-17h8l18 17" fill="#e0e8ef" stroke="#b9c9d7" strokeWidth=".6" />
          <path d="m9 18 20 17c1.7 1.5 4.3 1.5 6 0l20-17" fill="#fff" stroke="#b4c5d4" strokeWidth=".7" />
        </>
      );
      break;
    case 'search':
      artwork = (
        <>
          <path d="m39 39 14 14" stroke="#4b5564" strokeWidth="7" strokeLinecap="round" />
          <path d="m40 39 13 13" stroke="#d7dde4" strokeWidth="2" strokeLinecap="round" />
          <circle cx="27" cy="27" r="17" fill={paint('lens')} stroke="#5e6e80" strokeWidth="3" />
          <circle cx="27" cy="27" r="14" fill="none" stroke="#f6fbff" strokeWidth="1" opacity=".85" />
          <path d="M18 23c1-4 4-7 9-7" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity=".8" />
        </>
      );
      break;
  }

  return (
    <svg className="app-icon__artwork" viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-surface`} x1="32" y1="1" x2="32" y2="63" gradientUnits="userSpaceOnUse"><stop stopColor={top} /><stop offset="1" stopColor={bottom} /></linearGradient>
        <linearGradient id={`${id}-blue`} x1="17" y1="2" x2="36" y2="62" gradientUnits="userSpaceOnUse"><stop stopColor="#76c7f3" /><stop offset="1" stopColor="#2493df" /></linearGradient>
        <linearGradient id={`${id}-paper`} x1="32" y1="6" x2="32" y2="56" gradientUnits="userSpaceOnUse"><stop stopColor="#ffffff" /><stop offset="1" stopColor="#eceef0" /></linearGradient>
        <linearGradient id={`${id}-leather`} x1="32" y1="6" x2="32" y2="54" gradientUnits="userSpaceOnUse"><stop stopColor="#d7b17a" /><stop offset=".5" stopColor="#b98b53" /><stop offset="1" stopColor="#9b6a39" /></linearGradient>
        <linearGradient id={`${id}-metal`} x1="32" y1="22" x2="32" y2="38" gradientUnits="userSpaceOnUse"><stop stopColor="#fcfcf7" /><stop offset=".5" stopColor="#b9b8aa" /><stop offset="1" stopColor="#eeeade" /></linearGradient>
        <linearGradient id={`${id}-yellow`} x1="32" y1="1" x2="32" y2="20" gradientUnits="userSpaceOnUse"><stop stopColor="#ffe37a" /><stop offset="1" stopColor="#eec84b" /></linearGradient>
        <linearGradient id={`${id}-green`} x1="17" y1="14" x2="17" y2="51" gradientUnits="userSpaceOnUse"><stop stopColor="#99c6a5" /><stop offset="1" stopColor="#5d9470" /></linearGradient>
        <linearGradient id={`${id}-lens`} x1="16" y1="10" x2="36" y2="42" gradientUnits="userSpaceOnUse"><stop stopColor="#e5f6ff" /><stop offset="1" stopColor="#8cb4d8" /></linearGradient>
      </defs>
      <rect x=".7" y=".7" width="62.6" height="62.6" rx="14" fill={paint('surface')} />
      {artwork}
      <rect x=".7" y=".7" width="62.6" height="62.6" rx="14" stroke="#fff" strokeOpacity=".5" strokeWidth=".7" />
    </svg>
  );
}
