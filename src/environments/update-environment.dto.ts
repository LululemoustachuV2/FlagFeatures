import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateEnvironmentDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description?: string;
}
