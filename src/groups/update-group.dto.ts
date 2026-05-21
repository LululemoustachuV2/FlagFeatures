import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateGroupDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description?: string;
}
