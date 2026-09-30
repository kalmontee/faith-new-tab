import { lazy } from 'react';
import { Cloud } from 'lucide-react';
import type { ModuleDefinition } from '@/shared/types/module';

export const weatherModule: ModuleDefinition = {
  id: 'weather',
  title: 'Weather',
  description: 'Current conditions with 30-minute refresh',
  icon: Cloud,
  enabled: true,
  component: lazy(() => import('./components/WeatherCard')),
  gridArea: 'weather',
};
