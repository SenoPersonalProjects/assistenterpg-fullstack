// src/usuario/dto/alterar-senha.dto.ts
import { IsString, MinLength } from 'class-validator';
import { AUTH_PASSWORD_MIN_LENGTH } from 'src/auth/auth-security.config';

export class AlterarSenhaDto {
  @IsString()
  senhaAtual: string;

  @IsString()
  @MinLength(AUTH_PASSWORD_MIN_LENGTH)
  novaSenha: string;
}
