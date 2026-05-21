import { IsNotEmpty, IsString } from "class-validator";

export class CreateEnvironmentDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;
}
