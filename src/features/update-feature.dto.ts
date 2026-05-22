import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateFeatureDto {
  @ApiPropertyOptional({ example: "dark-mode-v2" })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  key?: string;

  @ApiPropertyOptional({ example: "Dark Mode v2" })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: "Updated theme" })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description?: string;
}
