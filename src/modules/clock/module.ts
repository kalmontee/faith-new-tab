import { lazy } from 'react';
import { Clock } from 'lucide-react';
import type { ModuleDefinition } from '@/shared/types/module';

export const clockModule: ModuleDefinition = {
  id: 'clock-greetings',
  title: 'Clock & Greeting',
  description: 'Real-time clock with time-of-day greeting',
  icon: Clock,
  enabled: true,
  component: lazy(() => import('./components/ClockGreeting')),
  refreshInterval: 'never',
  gridArea: 'clock',
  requiresNetwork: false,
};
