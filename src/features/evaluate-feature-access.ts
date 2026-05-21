import { Group } from "../groups/group.model";
import { User } from "../users/user.model";
import { FeatureEnvironmentConfig } from "./feature-config.model";
import { Feature } from "./feature.model";

export interface FeatureAccessResult {
  enabled: boolean;
  reason: string;
}

function rolloutBucket(userId: number, featureKey: string): number {
  const input = `${userId}${featureKey}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash % 100;
}

function isInRollout(
  userId: number,
  featureKey: string,
  rollout: number,
): boolean {
  if (rollout <= 0) {
    return false;
  }
  if (rollout >= 100) {
    return true;
  }
  return rolloutBucket(userId, featureKey) < rollout;
}

export function evaluateFeatureAccess(
  feature: Feature,
  config: FeatureEnvironmentConfig,
  user: User,
  userGroups: Group[],
): FeatureAccessResult {
  if (feature.enabled !== true) {
    return { enabled: false, reason: "Feature is disabled globally" };
  }

  if (!config.enabled) {
    return { enabled: false, reason: "Feature is disabled in this environment" };
  }

  if (config.allowedUsers.includes(user.id)) {
    return { enabled: true, reason: "User is explicitly allowed" };
  }

  const allowedGroupIds = new Set(config.allowedGroups);
  if (userGroups.some((group) => allowedGroupIds.has(group.id))) {
    return { enabled: true, reason: "User belongs to an allowed group" };
  }

  if (isInRollout(user.id, feature.key, config.rollout)) {
    return { enabled: true, reason: "User is within rollout percentage" };
  }

  return { enabled: false, reason: "User is not eligible for this feature" };
}
