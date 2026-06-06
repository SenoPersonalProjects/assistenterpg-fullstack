// src/auth/dto/register.dto.ts
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { IsAuthPassword } from './auth-password.validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  apelido: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsAuthPassword()
  senha: string;
}
