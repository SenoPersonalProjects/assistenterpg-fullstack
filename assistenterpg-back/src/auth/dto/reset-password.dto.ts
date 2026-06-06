import { IsNotEmpty, IsString } from 'class-validator';
import { IsAuthPassword } from './auth-password.validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @IsAuthPassword()
  novaSenha: string;
}
