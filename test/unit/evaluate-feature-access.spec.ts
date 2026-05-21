import { Group } from "../../src/groups/group.model";
import { User } from "../../src/users/user.model";
import { FeatureEnvironmentConfig } from "../../src/features/feature-config.model";
import { Feature } from "../../src/features/feature.model";
import { evaluateFeatureAccess } from "../../src/features/evaluate-feature-access";

const user: User = {
  id: 1,
  email: "lukas@test.com",
  name: "Lukas",
  role: "admin",
};

const baseFeature: Feature = {
  key: "dark-mode",
  name: "Dark Mode",
  description: "Theme",
  enabled: true,
};

const baseConfig: FeatureEnvironmentConfig = {
  enabled: true,
  rollout: 0,
  allowedGroups: [],
  allowedUsers: [],
};

/** hash("1" + "dark-mode") % 100 — utilisé pour les tests de rollout partiel */
const DARK_MODE_BUCKET_USER_1 = 53;

describe("evaluateFeatureAccess", () => {
  describe("activation globale", () => {
    it("returns disabled when feature.enabled is false", () => {
      const result = evaluateFeatureAccess(
        { ...baseFeature, enabled: false },
        baseConfig,
        user,
        [],
      );

      expect(result).toEqual({
        enabled: false,
        reason: "Feature is disabled globally",
      });
    });

    it("returns disabled when feature.enabled is undefined", () => {
      const result = evaluateFeatureAccess(
        { ...baseFeature, enabled: undefined },
        baseConfig,
        user,
        [],
      );

      expect(result).toEqual({
        enabled: false,
        reason: "Feature is disabled globally",
      });
    });

    it("ignores allowedUsers when feature is disabled globally", () => {
      const result = evaluateFeatureAccess(
        { ...baseFeature, enabled: false },
        { ...baseConfig, allowedUsers: [1] },
        user,
        [],
      );

      expect(result).toEqual({
        enabled: false,
        reason: "Feature is disabled globally",
      });
    });
  });

  describe("activation par environnement", () => {
    it("returns disabled when config.enabled is false", () => {
      const result = evaluateFeatureAccess(
        baseFeature,
        { ...baseConfig, enabled: false },
        user,
        [],
      );

      expect(result).toEqual({
        enabled: false,
        reason: "Feature is disabled in this environment",
      });
    });

    it("ignores allowedUsers when config is disabled in environment", () => {
      const result = evaluateFeatureAccess(
        baseFeature,
        { ...baseConfig, enabled: false, allowedUsers: [1] },
        user,
        [],
      );

      expect(result).toEqual({
        enabled: false,
        reason: "Feature is disabled in this environment",
      });
    });
  });

  describe("allowedUsers", () => {
    it("returns enabled when user id is in allowedUsers", () => {
      const result = evaluateFeatureAccess(
        baseFeature,
        { ...baseConfig, allowedUsers: [1] },
        user,
        [],
      );

      expect(result).toEqual({
        enabled: true,
        reason: "User is explicitly allowed",
      });
    });

    it("returns disabled when user id is not in allowedUsers and no other rule matches", () => {
      const result = evaluateFeatureAccess(
        baseFeature,
        { ...baseConfig, allowedUsers: [2] },
        user,
        [],
      );

      expect(result).toEqual({
        enabled: false,
        reason: "User is not eligible for this feature",
      });
    });
  });

  describe("allowedGroups", () => {
    it("returns enabled when user belongs to an allowed group", () => {
      const groups: Group[] = [
        { id: 2, name: "Beta", description: "Beta testers", userIds: [1] },
      ];

      const result = evaluateFeatureAccess(
        baseFeature,
        { ...baseConfig, allowedGroups: [2] },
        user,
        groups,
      );

      expect(result).toEqual({
        enabled: true,
        reason: "User belongs to an allowed group",
      });
    });

    it("returns enabled when at least one of the user groups is allowed", () => {
      const groups: Group[] = [
        { id: 10, name: "Other", description: "Other", userIds: [1] },
        { id: 2, name: "Beta", description: "Beta testers", userIds: [1] },
      ];

      const result = evaluateFeatureAccess(
        baseFeature,
        { ...baseConfig, allowedGroups: [2] },
        user,
        groups,
      );

      expect(result).toEqual({
        enabled: true,
        reason: "User belongs to an allowed group",
      });
    });

    it("returns disabled when user groups do not match allowedGroups", () => {
      const groups: Group[] = [
        { id: 10, name: "Other", description: "Other", userIds: [1] },
      ];

      const result = evaluateFeatureAccess(
        baseFeature,
        { ...baseConfig, allowedGroups: [2] },
        user,
        groups,
      );

      expect(result).toEqual({
        enabled: false,
        reason: "User is not eligible for this feature",
      });
    });

    it("returns disabled when user has no groups", () => {
      const result = evaluateFeatureAccess(
        baseFeature,
        { ...baseConfig, allowedGroups: [2] },
        user,
        [],
      );

      expect(result).toEqual({
        enabled: false,
        reason: "User is not eligible for this feature",
      });
    });
  });

  describe("rollout", () => {
    it("returns enabled when rollout is 100", () => {
      const result = evaluateFeatureAccess(
        baseFeature,
        { ...baseConfig, rollout: 100 },
        user,
        [],
      );

      expect(result).toEqual({
        enabled: true,
        reason: "User is within rollout percentage",
      });
    });

    it("returns disabled when rollout is 0", () => {
      const result = evaluateFeatureAccess(
        baseFeature,
        { ...baseConfig, rollout: 0 },
        user,
        [],
      );

      expect(result).toEqual({
        enabled: false,
        reason: "User is not eligible for this feature",
      });
    });

    it("returns enabled when bucket is strictly below rollout", () => {
      const result = evaluateFeatureAccess(
        baseFeature,
        { ...baseConfig, rollout: DARK_MODE_BUCKET_USER_1 + 1 },
        user,
        [],
      );

      expect(result).toEqual({
        enabled: true,
        reason: "User is within rollout percentage",
      });
    });

    it("returns disabled when bucket equals rollout", () => {
      const result = evaluateFeatureAccess(
        baseFeature,
        { ...baseConfig, rollout: DARK_MODE_BUCKET_USER_1 },
        user,
        [],
      );

      expect(result).toEqual({
        enabled: false,
        reason: "User is not eligible for this feature",
      });
    });

    it("returns the same result for the same user and feature key", () => {
      const config = { ...baseConfig, rollout: DARK_MODE_BUCKET_USER_1 + 1 };

      const first = evaluateFeatureAccess(baseFeature, config, user, []);
      const second = evaluateFeatureAccess(baseFeature, config, user, []);

      expect(first).toEqual(second);
    });

    it("can differ for another user with the same rollout", () => {
      const otherUser: User = { ...user, id: 2 };
      const config = { ...baseConfig, rollout: 50 };

      const resultUser1 = evaluateFeatureAccess(
        baseFeature,
        config,
        user,
        [],
      );
      const resultUser2 = evaluateFeatureAccess(
        baseFeature,
        config,
        otherUser,
        [],
      );

      expect(resultUser1.enabled).toBe(false);
      expect(resultUser2).toEqual({
        enabled: true,
        reason: "User is within rollout percentage",
      });
    });
  });

  describe("priorité des règles", () => {
    it("prefers allowedUsers over rollout failure", () => {
      const result = evaluateFeatureAccess(
        baseFeature,
        { ...baseConfig, allowedUsers: [1], rollout: 0 },
        user,
        [],
      );

      expect(result).toEqual({
        enabled: true,
        reason: "User is explicitly allowed",
      });
    });

    it("prefers allowedGroups over rollout failure", () => {
      const groups: Group[] = [
        { id: 2, name: "Beta", description: "Beta", userIds: [1] },
      ];

      const result = evaluateFeatureAccess(
        baseFeature,
        { ...baseConfig, allowedGroups: [2], rollout: 0 },
        user,
        groups,
      );

      expect(result).toEqual({
        enabled: true,
        reason: "User belongs to an allowed group",
      });
    });
  });
});
