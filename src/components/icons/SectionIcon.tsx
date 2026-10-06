import {
  BriefcaseBusiness,
  House,
  Library,
  Mail,
  Newspaper,
  NotebookPen,
  Search,
  UserRound,
  type LucideProps,
} from 'lucide-react';
import type { IconName } from '../../lib/site/sections.ts';

const ICONS = {
  home: House,
  about: UserRound,
  projects: BriefcaseBusiness,
  blog: Newspaper,
  notes: NotebookPen,
  series: Library,
  contact: Mail,
  search: Search,
} as const;

interface Props extends LucideProps {
  name: IconName;
}

/** Bölüm ikonları; dekoratiftir, anlamı yanındaki metin taşır. */
export default function SectionIcon({ name, ...props }: Props) {
  const Icon = ICONS[name];
  return <Icon aria-hidden="true" focusable="false" strokeWidth={1.9} {...props} />;
}
