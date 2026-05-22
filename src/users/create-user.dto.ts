import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
  @ApiProperty({ example: "lukas@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "Lukas" })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: "admin" })
  @IsNotEmpty()
  @IsString()
  role!: string;
}
