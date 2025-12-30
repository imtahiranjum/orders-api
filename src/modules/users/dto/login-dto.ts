import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";

export class LoginDto {
  @IsOptional()
  @IsEmail({}, { message: "Invalid email format" })
  @IsNotEmpty({ message: "Email cannot be empty" })
  email: string;

  @IsNotEmpty({ message: "Password cannot be empty" })
  password: string;
}
