import { lazy } from 'react';
import { Target } from 'lucide-react';
import type { ModuleDefinition } from '@/shared/types/module';

export const focusModule: ModuleDefinition = {
  id: 'focus',
  title: "Today's Focus",
  description: 'Set your daily focus and tagline',
  icon: Target,
  enabled: true,
  component: lazy(() => import('./components/FocusCard')),
  refreshInterval: 'never',
  gridArea: 'focus',
  requiresNetwork: false,
};
