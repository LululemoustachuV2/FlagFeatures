import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateEnvironmentDto {
  @ApiPropertyOptional({ example: "production" })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: "Production updated" })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description?: string;
}
