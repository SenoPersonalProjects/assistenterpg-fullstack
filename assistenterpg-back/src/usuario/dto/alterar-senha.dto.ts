// src/usuario/dto/alterar-senha.dto.ts
import { IsString } from 'class-validator';
import { IsAuthPassword } from 'src/auth/dto/auth-password.validator';

export class AlterarSenhaDto {
  @IsString()
  senhaAtual: string;

  @IsString()
  @IsAuthPassword()
  novaSenha: string;
}
