// src/usuario/dto/excluir-conta.dto.ts
import { IsString } from 'class-validator';

export class ExcluirContaDto {
  @IsString()
  senha: string;
}
