import type { LucideIcon } from 'lucide-react';
import type React from 'react';

export type RefreshInterval = 'daily' | 'hourly' | '30min' | 'never';

export interface ModuleDefinition {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  enabled: boolean;
  component: React.LazyExoticComponent<React.FC>;
  refreshInterval?: RefreshInterval;
  gridArea?: string;
  requiresNetwork?: boolean;
  settingsComponent?: React.LazyExoticComponent<React.FC>;
}

export interface ModuleConfig {
  id: string;
  enabled: boolean;
}

export interface CurrentVerse {
  reference: string;
  text: string;
  translation: string;
}
