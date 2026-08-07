import appConfig from '../../../config/app-config.yaml';
import { FeatureToggleService } from './feature-toggle-service';
import type { AppConfig } from '@/shared/types/app-config';

const config = ((appConfig as { default?: AppConfig }).default ?? appConfig) as AppConfig;

if (!config) {
  throw new Error('app-config.yaml did not parse into an object');
}

const env = import.meta.env.ENVIRONMENT === 'production' ? 'production' : 'dev';
const envConfig = config.environments[env];

if (!envConfig) {
  throw new Error(`No config found for environment: ${env}`);
}

export const featureToggle = new FeatureToggleService(envConfig.featureToggles ?? []);
