import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
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
  @ApiProperty({ example: true })
  @IsBoolean()
  enabled!: boolean;

  @ApiProperty({ example: 50, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  rollout!: number;

  @ApiPropertyOptional({ example: [1, 2], type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  @IsOptional()
  allowedGroups: number[] = [];

  @ApiPropertyOptional({ example: [10], type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  @IsOptional()
  allowedUsers: number[] = [];
}
