// src/usuario/dto/excluir-conta.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class ExcluirContaDto {
  @IsOptional()
  @IsString()
  senhaAtual?: string;

  @IsOptional()
  @IsString()
  senha?: string;
}
