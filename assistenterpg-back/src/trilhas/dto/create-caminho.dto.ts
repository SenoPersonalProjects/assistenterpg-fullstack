// src/trilhas/dto/create-caminho.dto.ts

import {
  IsString,
  IsOptional,
  IsInt,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class HabilidadeCaminhoDto {
  @IsInt()
  @IsNotEmpty()
  habilidadeId: number;

  @IsInt()
  @IsNotEmpty()
  nivelConcedido: number;
}

export class CreateCaminhoDto {
  @IsInt()
  @IsNotEmpty()
  trilhaId: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  nome: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Descrição deve ter no máximo 1000 caracteres' })
  descricao?: string;

  // ✅ Habilidades específicas do caminho (opcional)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HabilidadeCaminhoDto)
  habilidades?: HabilidadeCaminhoDto[];
}
