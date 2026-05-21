import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateFeatureDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  key?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description?: string;
}
