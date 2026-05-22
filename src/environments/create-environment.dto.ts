import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateEnvironmentDto {
  @ApiProperty({ example: "prod" })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: "Production" })
  @IsNotEmpty()
  @IsString()
  description!: string;
}
