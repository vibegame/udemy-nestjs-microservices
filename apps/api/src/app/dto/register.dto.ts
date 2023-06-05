import { IsEmail, IsOptional, IsString } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsOptional()
  displayName?: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
