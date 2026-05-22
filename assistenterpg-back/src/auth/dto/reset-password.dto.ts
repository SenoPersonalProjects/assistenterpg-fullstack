import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { AUTH_PASSWORD_MIN_LENGTH } from '../auth-security.config';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(AUTH_PASSWORD_MIN_LENGTH)
  novaSenha: string;
}
