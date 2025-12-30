import { IsEmail, IsString, IsStrongPassword } from "class-validator";

export class CreateUserDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  username: string;

  @IsStrongPassword()
  password: string;
}
