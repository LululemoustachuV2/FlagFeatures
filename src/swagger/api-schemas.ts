import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class HealthStatusSchema {
  @ApiProperty({ example: "ok" })
  status!: string;
}

export class VersionSchema {
  @ApiProperty({ example: "2.0.0" })
  version!: string;
}

export class UserSchema {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "lukas@example.com" })
  email!: string;

  @ApiProperty({ example: "Lukas" })
  name!: string;

  @ApiProperty({ example: "admin" })
  role!: string;
}

export class GroupSchema {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "Admins" })
  name!: string;

  @ApiProperty({ example: "Admin group" })
  description!: string;

  @ApiProperty({ example: [1], type: [Number] })
  userIds!: number[];
}

export class EnvironmentSchema {
  @ApiProperty({ example: "prod" })
  name!: string;

  @ApiProperty({ example: "Production" })
  description!: string;
}

export class FeatureEnvironmentConfigSchema {
  @ApiProperty({ example: true })
  enabled!: boolean;

  @ApiProperty({ example: 50, minimum: 0, maximum: 100 })
  rollout!: number;

  @ApiProperty({ example: [1], type: [Number] })
  allowedGroups!: number[];

  @ApiProperty({ example: [10], type: [Number] })
  allowedUsers!: number[];
}

export class FeatureSchema {
  @ApiProperty({ example: "dark-mode" })
  key!: string;

  @ApiProperty({ example: "Dark Mode" })
  name!: string;

  @ApiProperty({ example: "Enable dark theme" })
  description!: string;

  @ApiPropertyOptional({ example: true })
  enabled?: boolean;

  @ApiPropertyOptional({
    example: {
      prod: {
        enabled: true,
        rollout: 50,
        allowedGroups: [1],
        allowedUsers: [10],
      },
    },
  })
  configs?: Record<string, FeatureEnvironmentConfigSchema>;
}

export class FeatureEvaluateResponseSchema {
  @ApiProperty({ example: "dark-mode" })
  feature!: string;

  @ApiProperty({ example: true })
  enabled!: boolean;

  @ApiProperty({ example: "User is explicitly allowed" })
  reason!: string;
}

export class AuditLogSchema {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "feature.created" })
  action!: string;

  @ApiProperty({ example: "feature:dark-mode" })
  resource!: string;

  @ApiProperty({ example: "2026-05-21T12:00:00.000Z" })
  timestamp!: string;

  @ApiProperty({ example: { key: "dark-mode", name: "Dark Mode" } })
  details!: Record<string, unknown>;

  @ApiPropertyOptional({ example: "dark-mode" })
  featureKey?: string;
}
