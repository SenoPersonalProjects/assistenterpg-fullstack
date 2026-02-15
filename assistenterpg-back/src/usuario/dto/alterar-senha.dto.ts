// src/usuario/dto/alterar-senha.dto.ts
import { IsString, MinLength } from 'class-validator';

export class AlterarSenhaDto {
  @IsString()
  senhaAtual: string;

  @IsString()
  @MinLength(6)
  novaSenha: string;
}
