import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  Max,
  Min,
} from "class-validator";

export class FeatureConfigDto {
  @IsBoolean()
  enabled!: boolean;

  @IsInt()
  @Min(0)
  @Max(100)
  rollout!: number;

  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  @IsOptional()
  allowedGroups: number[] = [];

  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  @IsOptional()
  allowedUsers: number[] = [];
}
