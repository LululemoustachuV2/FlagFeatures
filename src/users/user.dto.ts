import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class UserDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  role!: string;
}
