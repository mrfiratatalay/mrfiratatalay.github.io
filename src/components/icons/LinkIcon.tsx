import { AtSign, BriefcaseBusiness, Camera, CirclePlay, CodeXml, ExternalLink, Globe, PenLine, type LucideProps } from 'lucide-react';
import type { Profile } from '../../lib/content/schemas.ts';

type LinkKind = Profile['links'][number]['kind'];

/**
 * Lucide marka logolarını içermediği için sosyal bağlantılarda tutarlı, genel
 * ikonlar kullanılır; bağlantının adı her zaman metin olarak da yazılır.
 */
const ICONS: Record<LinkKind, typeof Globe> = {
  github: CodeXml,
  linkedin: BriefcaseBusiness,
  medium: PenLine,
  youtube: CirclePlay,
  x: AtSign,
  instagram: Camera,
  website: Globe,
  diger: ExternalLink,
};

export default function LinkIcon({ kind, ...props }: LucideProps & { kind: LinkKind }) {
  const Icon = ICONS[kind];
  return <Icon aria-hidden="true" focusable="false" strokeWidth={1.9} {...props} />;
}
