import { lazy } from 'react';
import { Heart } from 'lucide-react';
import type { ModuleDefinition } from '@/shared/types/module';

export const gratitudeModule: ModuleDefinition = {
  id: 'gratitude',
  title: "Today's Gratitude",
  description: 'Reflect on one thing you are grateful for today',
  icon: Heart,
  enabled: true,
  component: lazy(() => import('./components/GratitudeCard')),
  refreshInterval: 'never',
  gridArea: 'gratitude',
  requiresNetwork: false,
};
