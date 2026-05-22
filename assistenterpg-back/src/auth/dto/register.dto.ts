// src/auth/dto/register.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { AUTH_PASSWORD_MIN_LENGTH } from '../auth-security.config';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  apelido: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(AUTH_PASSWORD_MIN_LENGTH)
  senha: string;
}
