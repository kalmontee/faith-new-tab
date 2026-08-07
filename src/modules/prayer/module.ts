import { lazy } from 'react';
import { HandHeart } from 'lucide-react';
import type { ModuleDefinition } from '@/shared/types/module';

export const prayerModule: ModuleDefinition = {
  id: 'prayer',
  title: 'Prayer Requests',
  description: 'Track prayer requests and mark them as answered',
  icon: HandHeart,
  enabled: true,
  component: lazy(() => import('./components/PrayerCard')),
  refreshInterval: 'never',
  gridArea: 'prayer',
  requiresNetwork: false,
};
