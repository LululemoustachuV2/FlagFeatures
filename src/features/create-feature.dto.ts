import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateFeatureDto {
  @ApiProperty({ example: "dark-mode" })
  @IsNotEmpty()
  @IsString()
  key!: string;

  @ApiProperty({ example: "Dark Mode" })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: "Enable dark theme" })
  @IsNotEmpty()
  @IsString()
  description!: string;
}
