import { type RawToggle } from './feature-toggles';

export interface EnvironmentConfig {
  api_base_url: string;
  log_level: string;
  extension_name: string;
  featureToggles: RawToggle[];
}

export interface AppConfig {
  app: {
    name: string;
    version: string;
  };
  all: Record<string, EnvironmentConfig>;
  environments: Record<string, EnvironmentConfig>;
}
