import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateGroupDto {
  @ApiProperty({ example: "Admins" })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: "Admin group" })
  @IsNotEmpty()
  @IsString()
  description!: string;
}
