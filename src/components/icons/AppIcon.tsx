import type { CSSProperties } from 'react';
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

/** "Liquid Glass" tarzı uygulama ikonu. Dekoratiftir; anlamı yanındaki metin taşır. */
export default function AppIcon({ name, size, text = 'FA', className }: Props) {
  const style = size ? ({ '--size': `${size}px` } as CSSProperties) : undefined;
  return (
    <span className={`app-icon app-icon--${name}${className ? ` ${className}` : ''}`} style={style} aria-hidden="true">
      {name === 'monogram' ? <span>{text}</span> : <SectionIcon name={name} />}
    </span>
  );
}
