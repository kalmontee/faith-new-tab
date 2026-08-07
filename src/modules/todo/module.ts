import { lazy } from 'react';
import { ListChecks } from 'lucide-react';
import type { ModuleDefinition } from '@/shared/types/module';

export const todoModule: ModuleDefinition = {
  id: 'todo',
  title: 'To-Do List',
  description: 'Simple checklist that persists across sessions',
  icon: ListChecks,
  enabled: true,
  component: lazy(() => import('./components/TodoCard')),
  refreshInterval: 'never',
  gridArea: 'todo',
  requiresNetwork: false,
};
