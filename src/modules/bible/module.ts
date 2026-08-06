import { lazy } from 'react';
import { BookOpen } from 'lucide-react';
import type { ModuleDefinition } from '@/shared/types/module';

export const bibleModule: ModuleDefinition = {
  id: 'bible',
  title: 'Daily Verse',
  description: 'Daily Bible verse with 24-hour cache. Powered by OurManna.',
  icon: BookOpen,
  enabled: true,
  component: lazy(() => import('./components/VerseCard')),
  refreshInterval: 'daily',
  gridArea: 'verse',
  requiresNetwork: true,
};
