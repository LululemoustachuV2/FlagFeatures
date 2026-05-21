export interface FeatureEnvironmentConfig {
  enabled: boolean;
  rollout: number;
  allowedGroups: number[];
  allowedUsers: number[];
}
