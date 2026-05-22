import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AuditService } from "../audit/audit.service";
import { environments, features, groups, users } from "../store";
import { evaluateFeatureAccess } from "./evaluate-feature-access";
import { CreateFeatureDto } from "./create-feature.dto";
import { FeatureConfigDto } from "./feature-config.dto";
import { FeatureEnvironmentConfig } from "./feature-config.model";
import { Feature } from "./feature.model";
import { UpdateFeatureDto } from "./update-feature.dto";

@Injectable()
export class FeaturesService {
  constructor(private readonly auditService: AuditService) {}

  findAll(): Feature[] {
    return features;
  }

  findOne(key: string): Feature {
    const feature = features.find((item) => item.key === key);
    if (!feature) {
      throw new NotFoundException(`Feature ${key} not found`);
    }
    return feature;
  }

  create(dto: CreateFeatureDto): Feature {
    if (features.some((feature) => feature.key === dto.key)) {
      throw new ConflictException("Feature key already exists");
    }

    const feature: Feature = { ...dto };
    features.push(feature);
    this.auditService.log(
      "feature.created",
      `feature:${feature.key}`,
      { key: feature.key, name: feature.name, description: feature.description },
      feature.key,
    );
    return feature;
  }

  update(key: string, dto: UpdateFeatureDto): Feature {
    const index = features.findIndex((feature) => feature.key === key);
    if (index === -1) {
      throw new NotFoundException(`Feature ${key} not found`);
    }

    if (
      dto.key &&
      dto.key !== key &&
      features.some((feature) => feature.key === dto.key)
    ) {
      throw new ConflictException("Feature key already exists");
    }

    features[index] = { ...features[index], ...dto };
    const updated = features[index];
    this.auditService.log(
      "feature.updated",
      `feature:${updated.key}`,
      { previousKey: key, changes: dto },
      updated.key,
    );
    return updated;
  }

  enable(key: string): Feature {
    const feature = this.findOne(key);
    feature.enabled = true;
    this.auditService.log(
      "feature.enabled",
      `feature:${key}`,
      { key },
      key,
    );
    return feature;
  }

  disable(key: string): Feature {
    const feature = this.findOne(key);
    feature.enabled = false;
    this.auditService.log(
      "feature.disabled",
      `feature:${key}`,
      { key },
      key,
    );
    return feature;
  }

  setConfig(
    featureKey: string,
    envName: string,
    dto: FeatureConfigDto,
  ): FeatureEnvironmentConfig {
    const feature = this.findOne(featureKey);
    const environment = environments.find((env) => env.name === envName);
    if (!environment) {
      throw new NotFoundException(`Environment ${envName} not found`);
    }

    if (!feature.configs) {
      feature.configs = {};
    }

    const config: FeatureEnvironmentConfig = {
      enabled: dto.enabled,
      rollout: dto.rollout,
      allowedGroups: dto.allowedGroups,
      allowedUsers: dto.allowedUsers,
    };
    feature.configs[envName] = config;
    this.auditService.log(
      "feature.config.updated",
      `feature:${featureKey}`,
      { environment: envName, config },
      featureKey,
    );
    return config;
  }

  getConfig(
    featureKey: string,
    envName: string,
  ): FeatureEnvironmentConfig {
    const feature = this.findOne(featureKey);
    const environment = environments.find((env) => env.name === envName);
    if (!environment) {
      throw new NotFoundException(`Environment ${envName} not found`);
    }

    const config = feature.configs?.[envName];
    if (!config) {
      throw new NotFoundException(
        `Config for feature ${featureKey} in ${envName} not found`,
      );
    }
    return config;
  }

  evaluate(
    featureKey: string,
    userId: number,
    envName: string,
  ): { feature: string; enabled: boolean; reason: string } {
    const feature = this.findOne(featureKey);
    const config = this.getConfig(featureKey, envName);

    const user = users.find((item) => item.id === userId);
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    const userGroups = groups.filter((group) =>
      group.userIds.includes(userId),
    );
    const result = evaluateFeatureAccess(feature, config, user, userGroups);

    return {
      feature: feature.key,
      enabled: result.enabled,
      reason: result.reason,
    };
  }

  deleteConfig(featureKey: string, envName: string): void {
    const feature = this.findOne(featureKey);
    const environment = environments.find((env) => env.name === envName);
    if (!environment) {
      throw new NotFoundException(`Environment ${envName} not found`);
    }

    if (!feature.configs?.[envName]) {
      throw new NotFoundException(
        `Config for feature ${featureKey} in ${envName} not found`,
      );
    }
    delete feature.configs[envName];
    this.auditService.log(
      "feature.config.deleted",
      `feature:${featureKey}`,
      { environment: envName },
      featureKey,
    );
  }

  remove(key: string): void {
    const index = features.findIndex((feature) => feature.key === key);
    if (index === -1) {
      throw new NotFoundException(`Feature ${key} not found`);
    }
    this.auditService.log(
      "feature.deleted",
      `feature:${key}`,
      { key },
      key,
    );
    features.splice(index, 1);
  }
}
