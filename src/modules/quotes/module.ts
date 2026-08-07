import { lazy } from 'react';
import { MessageCircle } from 'lucide-react';
import type { ModuleDefinition } from '@/shared/types/module';

export const quotesModule: ModuleDefinition = {
  id: 'quotes',
  title: 'Daily Inspiration',
  description: 'A bundled inspirational quote that rotates daily',
  icon: MessageCircle,
  enabled: true,
  component: lazy(() => import('./components/QuoteCard')),
  refreshInterval: 'daily',
  gridArea: 'quotes',
  requiresNetwork: false,
};
