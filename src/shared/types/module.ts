import type { LucideIcon } from 'lucide-react';
import type React from 'react';

export interface ModuleDefinition {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  enabled: boolean;
  component: React.LazyExoticComponent<React.FC>;
  gridArea?: string;
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
