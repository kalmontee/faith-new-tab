import { lazy } from 'react';
import { Zap } from 'lucide-react';
import type { ModuleDefinition } from '@/shared/types/module';

export const quickActionsModule: ModuleDefinition = {
  id: 'quick-actions',
  title: 'Quick Actions',
  description: 'Share, copy, and favorite the daily verse',
  icon: Zap,
  enabled: true,
  component: lazy(() => import('./components/QuickActionsCard')),
  refreshInterval: 'never',
  gridArea: 'quick-actions',
  requiresNetwork: false,
};
