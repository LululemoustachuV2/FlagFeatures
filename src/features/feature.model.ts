import { FeatureEnvironmentConfig } from "./feature-config.model";

export interface Feature {
  key: string;
  name: string;
  description: string;
  enabled?: boolean;
  configs?: Record<string, FeatureEnvironmentConfig>;
}
