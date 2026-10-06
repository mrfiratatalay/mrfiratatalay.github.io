import { Coffee, Container, Leaf, Sparkles, type LucideProps } from 'lucide-react';

/** Kategoriye özel kart rengi ve ikonu (kapak görseli olmayan yazılar için). */
export const CATEGORY_STYLES: Record<string, { tint: string; Icon: typeof Coffee }> = {
  java: { tint: 'linear-gradient(140deg, #ffb35c 0%, #ff7a1a 55%, #e0480f 100%)', Icon: Coffee },
  'spring-boot': { tint: 'linear-gradient(140deg, #8ef0b0 0%, #2fcf6d 50%, #0f8f44 100%)', Icon: Leaf },
  docker: { tint: 'linear-gradient(140deg, #7fd3ff 0%, #2f8fff 50%, #1d4fd6 100%)', Icon: Container },
  genel: { tint: 'linear-gradient(140deg, #c3b3ff 0%, #8b6cff 50%, #5b3fd6 100%)', Icon: Sparkles },
};

const FALLBACK = CATEGORY_STYLES.genel!;

export function categoryTint(category: string | undefined): string {
  return (category && CATEGORY_STYLES[category]?.tint) || FALLBACK.tint;
}

export default function CategoryGlyph({ category, ...props }: LucideProps & { category: string | undefined }) {
  const { Icon } = (category && CATEGORY_STYLES[category]) || FALLBACK;
  return <Icon aria-hidden="true" focusable="false" strokeWidth={1.8} {...props} />;
}
